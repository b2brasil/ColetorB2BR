import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { doc, getDoc } from 'firebase/firestore';
import { logWhatsAppCommunication } from '@/lib/whatsapp-logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    let { serverUrl, apiKey, instanceName } = body;

    if (!serverUrl || !apiKey || !instanceName) {
      try {
        const configSnap = await getDoc(doc(db, 'whatsapp_config', 'meta'));
        if (configSnap.exists()) {
          const cfg = configSnap.data();
          if (!serverUrl) serverUrl = cfg.evolutionServerUrl;
          if (!apiKey) apiKey = cfg.evolutionApiKey;
          if (!instanceName) instanceName = cfg.evolutionInstanceName;
        }
      } catch (dbErr) {
        console.warn('[Evolution Status] DB Config Error:', dbErr);
      }
    }

    if (!serverUrl || !apiKey || !instanceName) {
      return NextResponse.json(
        { error: 'Por favor, informe a URL do Servidor, a Chave de API e o Nome da Instância da Evolution API.' },
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

    // Check status via Evolution API GET /instance/connectionState/{instanceName}
    const statusUrl = `${cleanUrl}/instance/connectionState/${cleanInstance}`;
    let res: Response;
    try {
      res = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'apikey': cleanApiKey
        },
        signal: AbortSignal.timeout(25000)
      });
    } catch (fetchErr: any) {
      const durationMs = Date.now() - startTime;
      const isTimeout = fetchErr?.name === 'AbortError' || fetchErr?.name === 'TimeoutError' || String(fetchErr).includes('timeout') || String(fetchErr).includes('aborted');
      const isConnRefused = fetchErr?.cause?.code === 'ECONNREFUSED' || String(fetchErr).includes('ECONNREFUSED');

      await logWhatsAppCommunication({
        provider: 'evolution',
        action: 'CHECK_STATUS',
        label: `Verificação de Status (${cleanInstance})`,
        method: 'GET',
        url: statusUrl,
        headers: { 'apikey': cleanApiKey },
        status: isTimeout ? 'TIMEOUT' : (isConnRefused ? 'ECONNREFUSED' : 'ERROR'),
        statusText: isTimeout ? 'Timeout de 25s' : (isConnRefused ? 'Conexão Recusada (8080)' : fetchErr.message),
        isSuccess: false,
        responsePayload: { error: fetchErr.message || String(fetchErr) },
        durationMs,
        error: fetchErr.message || String(fetchErr)
      });

      if (isTimeout || isConnRefused) {
        return NextResponse.json(
          {
            success: false,
            error: `Não foi possível alcançar a Evolution API em ${cleanUrl}. ${
              isTimeout 
                ? 'Tempo limite esgotado (Timeout de 25s na porta 8080).' 
                : 'Conexão recusada na porta 8080.'
            } Verifique se a VM do Google Cloud está ligada, se o container Docker está rodando e se a regra de Firewall da porta 8080 foi liberada no GCP.`,
            isConnRefused: true,
            isTimeout,
            ip: cleanUrl
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao conectar com o servidor Evolution API (${cleanUrl}): ${fetchErr.message || 'Servidor inacessível'}`,
          isConnRefused: true
        },
        { status: 200 }
      );
    }

    const durationMs = Date.now() - startTime;
    const rawText = await res.text().catch(() => '');
    let resJson: any = {};
    try {
      resJson = JSON.parse(rawText);
    } catch {
      resJson = { message: rawText.includes('<!doctype') ? 'Servidor retornou resposta HTML em vez de JSON. Verifique IP e porta 8080.' : rawText };
    }

    await logWhatsAppCommunication({
      provider: 'evolution',
      action: 'CHECK_STATUS',
      label: `Verificação de Status (${cleanInstance})`,
      method: 'GET',
      url: statusUrl,
      headers: { 'apikey': cleanApiKey },
      status: res.status,
      statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
      isSuccess: res.ok,
      responsePayload: resJson,
      durationMs
    });

    // If instance is not found (404), attempt to create instance automatically
    if (res.status === 404 || (resJson.error && String(resJson.error).includes('not found'))) {
      const createUrl = `${cleanUrl}/instance/create`;
      try {
        const createRes = await fetch(createUrl, {
          method: 'POST',
          headers: {
            'apikey': cleanApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            instanceName: cleanInstance,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
            syncFullHistory: false
          })
        });
        const createJson = await createRes.json().catch(() => ({}));

        if (createRes.ok || createJson.instance) {
          return NextResponse.json({
            success: true,
            created: true,
            state: 'connecting',
            message: 'Instância criada com sucesso no servidor Evolution API! Pronto para conectar QR Code.',
            evolutionResponse: createJson
          });
        }
      } catch (createErr: any) {
        // Silent catch on auto-create attempt
      }
    }

    // Double-check ground truth via GET /instance/fetchInstances
    let fetchInstancesData: any = null;
    try {
      const fetchAllRes = await fetch(`${cleanUrl}/instance/fetchInstances`, {
        method: 'GET',
        headers: { 'apikey': cleanApiKey },
        signal: AbortSignal.timeout(5000)
      });
      if (fetchAllRes.ok) {
        const list = await fetchAllRes.json().catch(() => []);
        if (Array.isArray(list)) {
          fetchInstancesData = list.find((item: any) => {
            const name = item.name || item.instanceName || item.instance?.instanceName || item.instance?.name;
            return String(name).toLowerCase() === cleanInstance.toLowerCase();
          });
        }
      }
    } catch {}

    const socketState = String(
      resJson.instance?.state ||
      resJson.instance?.status ||
      resJson.state ||
      resJson.status ||
      resJson.connectionState?.state ||
      resJson.connectionState ||
      (res.ok ? 'unknown' : 'disconnected')
    ).toLowerCase();

    let owner = resJson.instance?.ownerJid || resJson.instance?.owner || resJson.ownerJid || resJson.owner;
    let discCode: number | null = null;
    let discObj = '';

    if (fetchInstancesData) {
      if (fetchInstancesData.ownerJid) owner = fetchInstancesData.ownerJid;
      discCode = fetchInstancesData.disconnectionReasonCode;
      discObj = String(fetchInstancesData.disconnectionObject || '');
    }

    // A session is revoked if disconnection reason is 401, device_removed, conflict, or logged out
    const isRevoked = discCode === 401 || discObj.includes('401') || discObj.includes('device_removed') || discObj.includes('conflict') || discObj.includes('Log out');

    // ONLY truly connected if active socket is 'open' and session has NOT been revoked
    let state = 'close';
    if (isRevoked) {
      state = 'close';
    } else if (socketState === 'open' || socketState === 'connected') {
      state = 'open';
    } else if (socketState === 'connecting') {
      state = 'connecting';
    }

    const isConnected = state === 'open';

    return NextResponse.json({
      success: res.ok,
      state,
      connected: isConnected,
      isRevoked,
      owner: isConnected ? (owner || null) : null,
      message: isConnected 
        ? 'Instância conectada e pronta para envio!' 
        : (isRevoked 
            ? 'O WhatsApp foi desconectado no aparelho (sessão desvinculada). Clique em "Escanear QR Code no Celular" para reconectar.' 
            : (state === 'connecting'
                ? 'Aguardando leitura do QR Code no aplicativo do WhatsApp no celular.'
                : 'Instância desconectada. Clique em "Escanear QR Code no Celular" para conectar.')),
      evolutionResponse: resJson
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Erro ao conectar com servidor Evolution API: ${error.message || 'Servidor inacessível'}` },
      { status: 500 }
    );
  }
}
