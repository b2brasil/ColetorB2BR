import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { logWhatsAppCommunication } from '@/lib/whatsapp-logger';

export const dynamic = 'force-dynamic';

function formatBrl(value: number | string): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value || '0'));
  if (isNaN(num)) return 'R$ 0,00';
  return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      sellerName,
      clientFantasyName,
      totalValue,
      manufacturers,
      isTest
    } = body;

    // Format fields with defaults
    const orderNumStr = String(orderNumber || 'Pendente').trim();
    const sellerStr = String(sellerName || 'Não informado').trim();
    const clientStr = String(clientFantasyName || 'Cliente').trim();
    const formattedValue = formatBrl(totalValue);

    // Format Manufacturers list
    let mfgStr = 'Não especificado';
    if (Array.isArray(manufacturers) && manufacturers.length > 0) {
      const cleanList = manufacturers.map((m: any) => String(m).trim()).filter(Boolean);
      const uniqueList = Array.from(new Set(cleanList));
      if (uniqueList.length > 0) {
        mfgStr = uniqueList.join(', ');
      }
    } else if (typeof manufacturers === 'string' && manufacturers.trim()) {
      mfgStr = manufacturers.trim();
    }

    // Build the exact required WhatsApp text message
    const messageText = `📋 *CÓPIA DE PEDIDO EMITIDO - B2BR*${isTest ? ' *(TESTE DE ENVIO)*' : ''}

• *Número do Pedido Omie:* ${orderNumStr.startsWith('#') ? orderNumStr : `#${orderNumStr}`}
• *Vendedor:* ${sellerStr}
• *Cliente (Nome Fantasia):* ${clientStr}
• *Valor do Pedido:* ${formattedValue}
• *Fabricantes:* ${mfgStr}`;

    // Get list of recipients configured to receive order copy
    let recipients: Array<{ name: string; email: string; phone: string }> = [];

    try {
      const snap = await getDocs(collection(db, 'whatsapp_order_recipients'));
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.receive_order_copy && data.phone) {
          recipients.push({
            name: data.nome || 'Vendedor',
            email: data.email || '',
            phone: data.phone
          });
        }
      });
    } catch (dbErr) {
      console.warn('[Notify Order API] Warning fetching recipients:', dbErr);
    }

    // Fallback: If no custom recipients stored yet, default to admin or seller phone
    if (recipients.length === 0) {
      recipients.push({
        name: 'Administração B2BR',
        email: 'financeiro@b2brdistribuicao.com.br',
        phone: '(19) 99582-0909'
      });
    }

    // Load WhatsApp configuration from Firestore
    let storedConfig: any = {};
    try {
      const configSnap = await getDoc(doc(db, 'whatsapp_config', 'meta'));
      if (configSnap.exists()) {
        storedConfig = configSnap.data();
      }
    } catch (cfgErr) {
      console.warn('[Notify Order API] Warning fetching config:', cfgErr);
    }

    const provider = storedConfig.provider || 'evolution';
    let dispatchResults: Array<{ phone: string; success: boolean; response?: any; error?: string }> = [];

    // -----------------------------------------------------------------
    // DISPATCH METHOD 1: EVOLUTION API (QR Code)
    // -----------------------------------------------------------------
    if (provider === 'evolution') {
      let serverUrl = storedConfig.evolutionServerUrl || process.env.EVOLUTION_API_URL;
      let apiKey = storedConfig.evolutionApiKey || process.env.EVOLUTION_API_KEY;
      let instanceName = storedConfig.evolutionInstanceName || process.env.EVOLUTION_INSTANCE_NAME || 'b2br_coletor';

      if (serverUrl && apiKey && instanceName) {
        let cleanUrl = String(serverUrl).trim();
        if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
        const cleanApiKey = String(apiKey).trim();
        const cleanInstance = String(instanceName).trim();

        for (const rec of recipients) {
          let cleanPhone = rec.phone.replace(/\D/g, '');
          if (cleanPhone) {
            if (!cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
              cleanPhone = `55${cleanPhone}`;
            }

            // Quick pre-check on instance connectionState and ground truth
            try {
              const [stateRes, fetchAllRes] = await Promise.all([
                fetch(`${cleanUrl}/instance/connectionState/${cleanInstance}`, {
                  headers: { 'apikey': cleanApiKey },
                  signal: AbortSignal.timeout(3000)
                }).catch(() => null),
                fetch(`${cleanUrl}/instance/fetchInstances`, {
                  headers: { 'apikey': cleanApiKey },
                  signal: AbortSignal.timeout(3000)
                }).catch(() => null)
              ]);

              let isDisconnected = false;
              let discReason = '';

              let curState = 'close';
              if (stateRes && stateRes.ok) {
                const stateJson = await stateRes.json().catch(() => ({}));
                curState = String(stateJson.instance?.state || stateJson.state || '').toLowerCase();
              }

              if (curState !== 'open' && curState !== 'connected') {
                if (fetchAllRes && fetchAllRes.ok) {
                  const list = await fetchAllRes.json().catch(() => []);
                  if (Array.isArray(list)) {
                    const target = list.find((item: any) => {
                      const name = item.name || item.instanceName || item.instance?.instanceName || item.instance?.name;
                      return String(name).toLowerCase() === cleanInstance.toLowerCase();
                    });
                    if (target) {
                      const fetchStatus = String(target.connectionStatus || '').toLowerCase();
                      const discCode = target.disconnectionReasonCode;
                      const discObj = String(target.disconnectionObject || '');
                      if (fetchStatus === 'open' || fetchStatus === 'connected') {
                        isDisconnected = false;
                      } else if (discCode === 401 || discObj.includes('401') || discObj.includes('device_removed') || discObj.includes('conflict') || discObj.includes('Log out')) {
                        isDisconnected = true;
                        discReason = 'Sessão desvinculada no celular (código 401)';
                      } else if (fetchStatus === 'close') {
                        isDisconnected = true;
                        discReason = `Estado: ${fetchStatus}`;
                      }
                    }
                  }
                } else {
                  isDisconnected = true;
                  discReason = `Estado "${curState}"`;
                }
              }

              if (isDisconnected) {
                dispatchResults.push({
                  phone: cleanPhone,
                  success: false,
                  error: `Instância '${cleanInstance}' está desconectada (${discReason}). Reconecte via QR Code.`
                });
                continue;
              }
            } catch {
              // Continue if state check fails
            }

            const isBrazilianMobile = cleanPhone.startsWith('55') && cleanPhone.length === 13 && cleanPhone[4] === '9';
            const altPhone = isBrazilianMobile ? `${cleanPhone.slice(0, 4)}${cleanPhone.slice(5)}` : null;
            // Try altPhone (without 9) first, then cleanPhone (with 9)
            const candidates = isBrazilianMobile && altPhone ? [altPhone, cleanPhone] : [cleanPhone];

            let sentOk = false;
            let lastErr = '';
            let finalPhone = cleanPhone;
            let lastResJson: any = {};

            for (const targetNum of candidates) {
              if (sentOk) break;

              const payloadA = {
                number: targetNum,
                text: messageText,
                options: {
                  delay: 0,
                  presence: 'composing',
                  linkPreview: false
                },
                textMessage: {
                  text: messageText
                }
              };

              const payloadB = {
                number: targetNum,
                text: messageText
              };

              for (const payload of [payloadA, payloadB]) {
                const startTime = Date.now();
                try {
                  const evoRes = await fetch(`${cleanUrl}/message/sendText/${cleanInstance}`, {
                    method: 'POST',
                    headers: {
                      'apikey': cleanApiKey,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(15000)
                  });
                  const durationMs = Date.now() - startTime;
                  const resJson = await evoRes.json().catch(() => ({}));
                  const isOk = evoRes.ok && !resJson.error;

                  await logWhatsAppCommunication({
                    provider: 'evolution',
                    action: 'ORDER_NOTIFICATION',
                    label: `Cópia Pedido #${orderNumStr} para ${targetNum} (${rec.name})`,
                    method: 'POST',
                    url: `${cleanUrl}/message/sendText/${cleanInstance}`,
                    headers: { 'apikey': cleanApiKey, 'Content-Type': 'application/json' },
                    requestPayload: payload,
                    status: evoRes.status,
                    statusText: evoRes.statusText || (isOk ? 'OK' : 'Error'),
                    isSuccess: isOk,
                    responsePayload: resJson,
                    durationMs,
                    error: isOk ? undefined : (resJson.error || resJson.message)
                  });

                  if (isOk) {
                    sentOk = true;
                    finalPhone = targetNum;
                    lastResJson = resJson;
                    break;
                  } else {
                    lastErr = Array.isArray(resJson.message)
                      ? resJson.message.join(' | ')
                      : (resJson.error || resJson.message || 'Erro na resposta do Evolution');
                  }
                } catch (dispatchErr: any) {
                  const durationMs = Date.now() - startTime;
                  await logWhatsAppCommunication({
                    provider: 'evolution',
                    action: 'ORDER_NOTIFICATION',
                    label: `Cópia Pedido #${orderNumStr} para ${targetNum} (Falha)`,
                    method: 'POST',
                    url: `${cleanUrl}/message/sendText/${cleanInstance}`,
                    headers: { 'apikey': cleanApiKey, 'Content-Type': 'application/json' },
                    requestPayload: payload,
                    status: 'ERROR',
                    statusText: dispatchErr.message || 'Falha de comunicação',
                    isSuccess: false,
                    responsePayload: { error: dispatchErr.message },
                    durationMs,
                    error: dispatchErr.message
                  });
                  lastErr = dispatchErr.message || 'Erro de comunicação ou timeout';
                }
              }
            }

            dispatchResults.push({
              phone: finalPhone,
              success: sentOk,
              response: lastResJson,
              error: sentOk ? undefined : lastErr
            });
          }
        }
      }
    } else {
      // -----------------------------------------------------------------
      // DISPATCH METHOD 2: META CLOUD API (Oficial)
      // -----------------------------------------------------------------
      let metaToken = storedConfig.accessToken || process.env.WHATSAPP_API_TOKEN;
      let metaPhoneId = storedConfig.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (metaToken && metaPhoneId) {
        for (const rec of recipients) {
          let cleanPhone = rec.phone.replace(/\D/g, '');
          if (cleanPhone) {
            if (!cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
              cleanPhone = `55${cleanPhone}`;
            }
            try {
              const metaRes = await fetch(`https://graph.facebook.com/v20.0/${metaPhoneId}/messages`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${metaToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  recipient_type: 'individual',
                  to: cleanPhone,
                  type: 'text',
                  text: { body: messageText }
                })
              });
              const resJson = await metaRes.json().catch(() => ({}));
              dispatchResults.push({
                phone: cleanPhone,
                success: metaRes.ok && !resJson.error,
                response: resJson,
                error: resJson.error?.message
              });
            } catch (dispatchErr: any) {
              dispatchResults.push({
                phone: cleanPhone,
                success: false,
                error: dispatchErr.message || 'Erro ao comunicar com a Meta API'
              });
            }
          }
        }
      }
    }

    // Save dispatch log in Firestore
    const logId = `notify_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const logDocRef = doc(db, 'whatsapp_notification_logs', logId);

    const logData = {
      id: logId,
      orderNumber: orderNumStr,
      sellerName: sellerStr,
      clientFantasyName: clientStr,
      totalValue: typeof totalValue === 'number' ? totalValue : parseFloat(String(totalValue || '0')),
      manufacturers: mfgStr,
      messageText,
      provider,
      recipientsCount: recipients.length,
      recipients: recipients.map((r) => `${r.name} (${r.phone})`),
      status: dispatchResults.length > 0
        ? dispatchResults.some((r) => r.success) ? `Enviado (${provider})` : `Falha (${provider})`
        : 'Formatado / Registrado',
      dispatchResults,
      isTest: Boolean(isTest),
      createdAt: new Date().toISOString()
    };

    await setDoc(logDocRef, logData);

    return NextResponse.json({
      success: true,
      provider,
      message: 'Notificação formatada e registrada para envio via WhatsApp.',
      recipientsNotifiedCount: recipients.length,
      recipients,
      formattedMessage: messageText,
      dispatchResults,
      logId
    });
  } catch (error: any) {
    console.error('[Notify Order API POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar notificação de pedido' }, { status: 500 });
  }
}
