import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { doc, getDoc } from 'firebase/firestore';
import { logWhatsAppCommunication } from '@/lib/whatsapp-logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipientPhone,
      phone,
      customMessage,
      message,
      provider: overrideProvider,
      // Evolution params
      evolutionServerUrl,
      evolutionApiKey,
      evolutionInstanceName,
      // Meta params
      accessToken,
      phoneNumberId
    } = body;

    // Load configuration from Firestore
    let storedConfig: any = {};
    try {
      const configSnap = await getDoc(doc(db, 'whatsapp_config', 'meta'));
      if (configSnap.exists()) {
        storedConfig = configSnap.data();
      }
    } catch (dbErr) {
      console.warn('[WhatsApp Test Send API] Error reading Firestore config:', dbErr);
    }

    const provider = overrideProvider || storedConfig.provider || 'evolution';

    // Clean phone number (must include country code, e.g., 5519995820909)
    const rawPhone = recipientPhone || phone;
    let cleanPhone = String(rawPhone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      return NextResponse.json(
        { error: 'Por favor, informe um número de telefone válido (ex: 19995820909 ou 5519995820909).' },
        { status: 400 }
      );
    }

    if (!cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
      cleanPhone = `55${cleanPhone}`;
    }

    const rawMessage = customMessage || message;
    const messageText = rawMessage || `🤖 *TESTE DE INTEGRAÇÃO B2BR WHATSAPP AGENT*

Sua integração com WhatsApp (${provider === 'evolution' ? 'Evolution API' : 'Meta Cloud API'}) está funcionando perfeitamente!

• *Data/Hora:* ${new Date().toLocaleString('pt-BR')}
• *Status:* Conectado e Operacional`;

    // -------------------------------------------------------------
    // PROVIDER 1: EVOLUTION API (QR Code / Baileys Engine)
    // -------------------------------------------------------------
    if (provider === 'evolution') {
      let serverUrl = evolutionServerUrl || storedConfig.evolutionServerUrl || process.env.EVOLUTION_API_URL;
      let apiKey = evolutionApiKey || storedConfig.evolutionApiKey || process.env.EVOLUTION_API_KEY;
      let instanceName = evolutionInstanceName || storedConfig.evolutionInstanceName || process.env.EVOLUTION_INSTANCE_NAME || 'b2br_coletor';

      if (!serverUrl || !apiKey || !instanceName) {
        return NextResponse.json(
          {
            error: 'Credenciais da Evolution API não configuradas. Por favor, preencha a URL do Servidor, a Chave de API e o Nome da Instância nas Configurações.'
          },
          { status: 400 }
        );
      }

      let cleanUrl = String(serverUrl).trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `http://${cleanUrl}`;
      }
      if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
      const cleanApiKey = String(apiKey).trim();
      const cleanInstance = String(instanceName).trim();

      // Pre-flight check: Verify instance connection state and session validity
      const statusUrl = `${cleanUrl}/instance/connectionState/${cleanInstance}`;
      try {
        const [stateRes, fetchAllRes] = await Promise.all([
          fetch(statusUrl, {
            method: 'GET',
            headers: { 'apikey': cleanApiKey },
            signal: AbortSignal.timeout(6000)
          }).catch(() => null),
          fetch(`${cleanUrl}/instance/fetchInstances`, {
            method: 'GET',
            headers: { 'apikey': cleanApiKey },
            signal: AbortSignal.timeout(6000)
          }).catch(() => null)
        ]);

        if (stateRes && stateRes.status === 404) {
          // Auto-create instance if not found
          await fetch(`${cleanUrl}/instance/create`, {
            method: 'POST',
            headers: {
              'apikey': cleanApiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              instanceName: cleanInstance,
              qrcode: true,
              integration: 'WHATSAPP-BAILEYS'
            }),
            signal: AbortSignal.timeout(6000)
          }).catch(() => {});

          return NextResponse.json(
            {
              success: false,
              error: `A instância '${cleanInstance}' foi criada na Evolution API, mas ainda NÃO está conectada ao WhatsApp!`,
              diagnosticHelp: 'Vá para a aba "WhatsApp Agent" > sub-aba "Conexão Evolution API", clique em "Escanear QR Code no Celular" e conecte seu WhatsApp.'
            },
            { status: 200 }
          );
        }

        let isRevoked = false;
        let currentState = 'close';
        if (stateRes && stateRes.ok) {
          const stateJson = await stateRes.json().catch(() => ({}));
          currentState = String(stateJson.instance?.state || stateJson.state || 'close').toLowerCase();
        }

        if (currentState !== 'open' && currentState !== 'connected') {
          if (fetchAllRes && fetchAllRes.ok) {
            const list = await fetchAllRes.json().catch(() => []);
            if (Array.isArray(list)) {
              const target = list.find((item: any) => {
                const name = item.name || item.instanceName || item.instance?.instanceName || item.instance?.name;
                return String(name).toLowerCase() === cleanInstance.toLowerCase();
              });
              if (target) {
                const discCode = target.disconnectionReasonCode;
                const discObj = String(target.disconnectionObject || '');
                const connStat = String(target.connectionStatus || '').toLowerCase();
                if (connStat !== 'open' && connStat !== 'connected') {
                  if (discCode === 401 || discObj.includes('401') || discObj.includes('device_removed') || discObj.includes('conflict') || discObj.includes('Log out')) {
                    isRevoked = true;
                  }
                }
              }
            }
          }

          return NextResponse.json(
            {
              success: false,
              error: isRevoked
                ? `A sessão do WhatsApp para a instância '${cleanInstance}' foi desvinculada no celular (código 401: device removed).`
                : `A instância '${cleanInstance}' está no status '${currentState}' (não autenticada).`,
              diagnosticHelp: 'Para voltar a enviar mensagens:\n1. Acesse a aba "WhatsApp Agent" > "Conexão Evolution API".\n2. Clique em "Escanear QR Code no Celular".\n3. Abra o WhatsApp no seu celular (Aparelhos Conectados) e escaneie o código.'
            },
            { status: 200 }
          );
        }
      } catch (checkErr: any) {
        const isTimeout = checkErr?.name === 'AbortError' || checkErr?.name === 'TimeoutError' || String(checkErr).includes('timeout');
        const isConnRefused = checkErr?.cause?.code === 'ECONNREFUSED' || String(checkErr).includes('ECONNREFUSED');

        if (isTimeout || isConnRefused) {
          return NextResponse.json(
            {
              success: false,
              error: `Servidor da Evolution API em ${cleanUrl} inacessível (Porta 8080). ${
                isTimeout ? 'Tempo limite esgotado.' : 'Conexão recusada.'
              }`,
              diagnosticHelp: '1. No Google Cloud Shell, verifique se executou o comando para liberar a porta 8080 no Firewall:\n\ngcloud compute firewall-rules create allow-evolution-8080 --allow=tcp:8080 --direction=INGRESS --priority=1000 --network=default\n\n2. Na VM, rode "sudo docker ps" para garantir que o container evolution-api está Up.'
            },
            { status: 200 }
          );
        }
      }

      // Step 2: Format destination numbers
      const isBrazilianMobile = cleanPhone.startsWith('55') && cleanPhone.length === 13 && cleanPhone[4] === '9';
      const altPhone = isBrazilianMobile ? `${cleanPhone.slice(0, 4)}${cleanPhone.slice(5)}` : null;

      // In Brazil, WhatsApp JIDs for business or legacy accounts are 12 digits (without the 9).
      // We try altPhone (12 digits) first, then cleanPhone (13 digits), with a fast 6s timeout per candidate.
      const candidates = isBrazilianMobile && altPhone ? [altPhone, cleanPhone] : [cleanPhone];

      const sendUrl = `${cleanUrl}/message/sendText/${cleanInstance}`;
      let lastError: any = null;
      let successfulResponse: any = null;
      let usedPhone = cleanPhone;

      for (const targetNum of candidates) {
        if (successfulResponse) break;

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

        const payloadVariants = [payloadA, payloadB];

        for (const payload of payloadVariants) {
          const startTime = Date.now();
          try {
            const evoResponse = await fetch(sendUrl, {
              method: 'POST',
              headers: {
                'apikey': cleanApiKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload),
              signal: AbortSignal.timeout(15000)
            });

            const durationMs = Date.now() - startTime;
            const rawEvoText = await evoResponse.text().catch(() => '');
            let evoJson: any = {};
            try {
              evoJson = JSON.parse(rawEvoText);
            } catch {
              evoJson = { error: rawEvoText.includes('<!doctype') ? 'Servidor retornou resposta HTML em vez de JSON. Verifique IP e porta 8080.' : rawEvoText };
            }

            const isReqOk = evoResponse.ok && !evoJson.error;

            await logWhatsAppCommunication({
              provider: 'evolution',
              action: 'SEND_MESSAGE',
              label: `Disparo de Teste para ${targetNum}`,
              method: 'POST',
              url: sendUrl,
              headers: { 'apikey': cleanApiKey, 'Content-Type': 'application/json' },
              requestPayload: payload,
              status: evoResponse.status,
              statusText: evoResponse.statusText || (isReqOk ? 'OK' : 'Error'),
              isSuccess: isReqOk,
              responsePayload: evoJson,
              durationMs,
              error: isReqOk ? undefined : (evoJson.error || evoJson.message || rawEvoText)
            });

            if (isReqOk) {
              successfulResponse = evoJson;
              usedPhone = targetNum;
              break;
            } else {
              if (Array.isArray(evoJson.message)) {
                lastError = evoJson.message.join(' | ');
              } else if (typeof evoJson.message === 'object' && evoJson.message !== null) {
                lastError = JSON.stringify(evoJson.message);
              } else {
                lastError = evoJson.message || evoJson.error || rawEvoText || `HTTP ${evoResponse.status}`;
              }
            }
          } catch (candidateErr: any) {
            const durationMs = Date.now() - startTime;
            const isTimeout = candidateErr?.name === 'AbortError' || candidateErr?.name === 'TimeoutError' || String(candidateErr).includes('timeout');
            const isConnRefused = candidateErr?.cause?.code === 'ECONNREFUSED' || String(candidateErr).includes('ECONNREFUSED');
            
            await logWhatsAppCommunication({
              provider: 'evolution',
              action: 'SEND_MESSAGE',
              label: `Disparo de Teste para ${targetNum} (Falha de Rede)`,
              method: 'POST',
              url: sendUrl,
              headers: { 'apikey': cleanApiKey, 'Content-Type': 'application/json' },
              requestPayload: payload,
              status: isTimeout ? 'TIMEOUT' : (isConnRefused ? 'ECONNREFUSED' : 'ERROR'),
              statusText: isTimeout ? 'Timeout de 15s' : (isConnRefused ? 'Conexão Recusada (8080)' : candidateErr.message),
              isSuccess: false,
              responsePayload: { error: candidateErr.message || String(candidateErr) },
              durationMs,
              error: candidateErr.message || String(candidateErr),
              diagnosticHelp: isTimeout ? 'A Evolution API não respondeu a tempo (timeout 15s).' : (isConnRefused ? 'Porta 8080 fechada ou container desligado.' : undefined)
            });

            lastError = candidateErr;
          }
        }
      }

      if (successfulResponse) {
        return NextResponse.json({
          success: true,
          provider: 'evolution',
          message: `Mensagem de teste enviada com sucesso via Evolution API (para ${usedPhone})!`,
          evolutionResponse: successfulResponse,
          recipientPhone: usedPhone
        });
      }

      const isTimeout = lastError?.name === 'AbortError' || lastError?.name === 'TimeoutError' || String(lastError).includes('timeout') || String(lastError).includes('aborted');
      if (isTimeout) {
        return NextResponse.json(
          {
            success: false,
            error: `O envio de teste expirou aguardando resposta da Evolution API em ${cleanUrl}.`,
            diagnosticHelp: 'Dica de Resolução:\n1. Certifique-se de que o WhatsApp no seu celular está conectado à internet.\n2. Verifique se o QR Code foi escaneado e se a instância exibe o status "Conectado".'
          },
          { status: 200 }
        );
      }

      const isConnRefused = lastError?.cause?.code === 'ECONNREFUSED' || String(lastError).includes('ECONNREFUSED');
      if (isConnRefused) {
        return NextResponse.json(
          {
            success: false,
            error: `Conexão recusada no servidor Evolution API (${cleanUrl}:8080).`,
            diagnosticHelp: '1. Verifique se a VM no GCP está rodando.\n2. Execute "sudo docker ps" na VM para garantir que o container evolution-api está Up.\n3. Certifique-se de que a porta 8080 foi liberada no Firewall do Google Cloud.'
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Erro ao disparar mensagem via Evolution API (${cleanUrl}): ${String(lastError?.message || lastError || 'Erro no envio')}`,
          diagnosticHelp: 'Verifique se a sua instância da Evolution API está conectada com o QR Code escaneado e se o número de telefone está correto.'
        },
        { status: 200 }
      );
    }

    // -------------------------------------------------------------
    // PROVIDER 2: META CLOUD API (Oficial Meta)
    // -------------------------------------------------------------
    let finalToken = accessToken ? String(accessToken).trim() : (storedConfig.accessToken || process.env.WHATSAPP_API_TOKEN);
    let finalPhoneId = phoneNumberId ? String(phoneNumberId).trim() : (storedConfig.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID);

    if (!finalToken) {
      return NextResponse.json(
        {
          error: 'Token de Acesso da Meta não configurado. Por favor, preencha o campo "Token de Acesso (Access Token)" nas configurações.'
        },
        { status: 400 }
      );
    }

    if (!finalPhoneId) {
      return NextResponse.json(
        {
          error: 'ID do Número do Telefone (Phone Number ID) não configurado. Preencha este campo nas configurações Meta.'
        },
        { status: 400 }
      );
    }

    const url = `https://graph.facebook.com/v20.0/${finalPhoneId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${finalToken}`,
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

    const metaResponseBody = await response.json();

    if (!response.ok || metaResponseBody.error) {
      const errInfo = metaResponseBody.error || {};
      const errCode = errInfo.code || response.status;
      const errMessage = errInfo.message || 'Erro desconhecido retornado pela Meta';

      let diagnosticHelp = '';
      if (errCode === 190) {
        diagnosticHelp = 'Seu Token de Acesso expirou ou é inválido.';
      } else if (errCode === 100 || errCode === 131030) {
        diagnosticHelp = 'Número de telefone de destino não permitido ou inválido no Meta Developers.';
      }

      return NextResponse.json(
        {
          success: false,
          provider: 'meta',
          error: `Erro Meta API (Código ${errCode}): ${errMessage}`,
          metaError: errInfo,
          diagnosticHelp
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: 'meta',
      message: 'Mensagem de teste enviada com sucesso via Meta Cloud API!',
      metaResponse: metaResponseBody,
      recipientPhone: cleanPhone
    });
  } catch (error: any) {
    console.error('[WhatsApp Test Send API Error]:', error);
    return NextResponse.json({ error: error.message || 'Erro interno ao disparar mensagem' }, { status: 500 });
  }
}
