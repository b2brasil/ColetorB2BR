import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { doc, getDoc } from 'firebase/firestore';
import { logWhatsAppCommunication } from '@/lib/whatsapp-logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    let { serverUrl, apiKey, instanceName, force } = body;

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
        console.warn('[Evolution Connect] DB Config Error:', dbErr);
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

    // If force is requested, clear previous session first
    if (force) {
      try {
        await fetch(`${cleanUrl}/instance/logout/${cleanInstance}`, {
          method: 'DELETE',
          headers: { 'apikey': cleanApiKey },
          signal: AbortSignal.timeout(6000)
        }).catch(() => {});
        await new Promise((r) => setTimeout(r, 600));
      } catch {}
    }

    // Fetch QR Code endpoint GET /instance/connect/{instanceName}
    const connectUrl = `${cleanUrl}/instance/connect/${cleanInstance}`;
    let res: Response;
    try {
      res = await fetch(connectUrl, {
        method: 'GET',
        headers: { 'apikey': cleanApiKey },
        signal: AbortSignal.timeout(20000)
      });
    } catch (fetchErr: any) {
      const durationMs = Date.now() - startTime;
      const isTimeout = fetchErr?.name === 'AbortError' || fetchErr?.name === 'TimeoutError' || String(fetchErr).includes('timeout') || String(fetchErr).includes('aborted');
      const isConnRefused = fetchErr?.cause?.code === 'ECONNREFUSED' || String(fetchErr).includes('ECONNREFUSED');

      await logWhatsAppCommunication({
        provider: 'evolution',
        action: 'FETCH_QR',
        label: `Obtenção de QR Code / Conexão (${cleanInstance})`,
        method: 'GET',
        url: connectUrl,
        headers: { 'apikey': cleanApiKey },
        status: isTimeout ? 'TIMEOUT' : (isConnRefused ? 'ECONNREFUSED' : 'ERROR'),
        statusText: isTimeout ? 'Timeout de 20s' : (isConnRefused ? 'Conexão Recusada (8080)' : fetchErr.message),
        isSuccess: false,
        responsePayload: { error: fetchErr.message || String(fetchErr) },
        durationMs,
        error: fetchErr.message || String(fetchErr)
      });

      if (isTimeout || isConnRefused) {
        return NextResponse.json(
          {
            success: false,
            error: `Não foi possível obter o QR Code da Evolution API (${cleanUrl}). ${
              isTimeout 
                ? 'Tempo limite esgotado (Timeout de 20s na porta 8080).' 
                : 'Conexão recusada na porta 8080.'
            } Verifique se o Docker está rodando na VM e se a regra de Firewall da porta 8080 no Google Cloud foi criada.`,
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
          error: `Erro ao conectar ao servidor Evolution API (${cleanUrl}): ${fetchErr.message || 'Servidor indisponível'}`
        },
        { status: 200 }
      );
    }

    const durationMs = Date.now() - startTime;
    let rawText = await res.text().catch(() => '');
    let resJson: any = {};
    try {
      resJson = JSON.parse(rawText);
    } catch {
      resJson = { error: rawText.includes('<!doctype') ? 'Servidor retornou resposta HTML em vez de JSON. Verifique IP e porta 8080.' : rawText };
    }

    await logWhatsAppCommunication({
      provider: 'evolution',
      action: 'FETCH_QR',
      label: `Obtenção de QR Code (${cleanInstance})`,
      method: 'GET',
      url: connectUrl,
      headers: { 'apikey': cleanApiKey },
      status: res.status,
      statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
      isSuccess: res.ok,
      responsePayload: resJson.base64 ? { ...resJson, base64: '[BASE64_IMAGE_DATA]' } : resJson,
      durationMs
    });

    let qrcodeBase64 = resJson.base64 || resJson.code || resJson.qrcode?.base64 || null;
    let pairingCode = resJson.pairingCode || resJson.code || null;

    // CRITICAL FIX: If instance is already connected, DO NOT LOG OUT! Return connected status directly.
    const isAlreadyConnected = 
      String(resJson.message || '').toLowerCase().includes('already connected') ||
      String(resJson.error || '').toLowerCase().includes('already connected') ||
      resJson.instance?.state === 'open' ||
      resJson.state === 'open';

    if (isAlreadyConnected) {
      return NextResponse.json({
        success: true,
        state: 'open',
        connected: true,
        message: 'WhatsApp já está conectado!',
        evolutionResponse: resJson
      });
    }

    const state = resJson.instance?.state || resJson.state || 'connecting';

    return NextResponse.json({
      success: true,
      state,
      qrcodeBase64,
      pairingCode,
      evolutionResponse: resJson
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Erro ao obter QR Code da Evolution API: ${error.message || 'Servidor indisponível'}` },
      { status: 500 }
    );
  }
}
