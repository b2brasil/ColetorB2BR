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
        console.warn('[Evolution Restart] DB Config Error:', dbErr);
      }
    }

    if (!serverUrl || !apiKey || !instanceName) {
      return NextResponse.json(
        { error: 'Parâmetros incompletos para reiniciar a instância.' },
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

    // Call /instance/restart/{instanceName} with PUT, POST, or GET
    const restartUrl = `${cleanUrl}/instance/restart/${cleanInstance}`;
    let res: Response | null = null;
    let resJson: any = {};

    // Try PUT first (Evolution v2 standard)
    try {
      res = await fetch(restartUrl, {
        method: 'PUT',
        headers: { 'apikey': cleanApiKey },
        signal: AbortSignal.timeout(10000)
      });
      resJson = await res.json().catch(() => ({}));
    } catch {}

    // Fallback to POST if PUT failed or returned non-200
    if (!res || !res.ok) {
      try {
        res = await fetch(restartUrl, {
          method: 'POST',
          headers: { 'apikey': cleanApiKey },
          signal: AbortSignal.timeout(10000)
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) resJson = json;
      } catch {}
    }

    // Fallback to GET if still non-200
    if (!res || !res.ok) {
      try {
        res = await fetch(restartUrl, {
          method: 'GET',
          headers: { 'apikey': cleanApiKey },
          signal: AbortSignal.timeout(10000)
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) resJson = json;
      } catch {}
    }

    const durationMs = Date.now() - startTime;
    const isSuccess = Boolean(res && res.ok);

    await logWhatsAppCommunication({
      provider: 'evolution',
      action: 'RESTART_INSTANCE',
      label: `Reiniciar Instância (${cleanInstance})`,
      method: (res ? 'PUT' : 'POST'),
      url: restartUrl,
      headers: { 'apikey': cleanApiKey },
      status: res ? res.status : 'ERROR',
      statusText: res ? res.statusText : 'Falha na requisição',
      isSuccess,
      responsePayload: resJson,
      durationMs
    });

    return NextResponse.json({
      success: isSuccess,
      message: isSuccess ? 'Instância reiniciada com sucesso na Evolution API!' : 'Não foi possível reiniciar a instância.',
      evolutionResponse: resJson
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    await logWhatsAppCommunication({
      provider: 'evolution',
      action: 'RESTART_INSTANCE',
      label: 'Reiniciar Instância (Exceção)',
      method: 'POST',
      url: `${body?.serverUrl || ''}/instance/restart/${body?.instanceName || ''}`,
      status: 'ERROR',
      statusText: err.message,
      isSuccess: false,
      responsePayload: { error: err.message },
      durationMs,
      error: err.message
    });

    return NextResponse.json({
      success: false,
      error: `Falha ao solicitar reinício da instância: ${err.message || 'Erro de rede'}`
    });
  }
}
