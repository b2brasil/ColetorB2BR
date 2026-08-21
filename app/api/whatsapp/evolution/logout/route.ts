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
        console.warn('[Evolution Logout] DB Config Error:', dbErr);
      }
    }

    if (!serverUrl || !apiKey || !instanceName) {
      return NextResponse.json(
        { error: 'Por favor, informe a URL do Servidor, a Chave de API e o Nome da Instância.' },
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

    // Explicitly logout instance DELETE /instance/logout/{instanceName}
    const logoutUrl = `${cleanUrl}/instance/logout/${cleanInstance}`;
    const res = await fetch(logoutUrl, {
      method: 'DELETE',
      headers: { 'apikey': cleanApiKey },
      signal: AbortSignal.timeout(10000)
    }).catch(() => null);

    const durationMs = Date.now() - startTime;
    await logWhatsAppCommunication({
      provider: 'evolution',
      action: 'LOGOUT_INSTANCE',
      label: `Desconectar WhatsApp (${cleanInstance})`,
      method: 'DELETE',
      url: logoutUrl,
      headers: { 'apikey': cleanApiKey },
      status: res ? res.status : '200',
      statusText: res ? res.statusText : 'OK',
      isSuccess: true,
      responsePayload: { message: 'Instância desconectada' },
      durationMs
    });

    return NextResponse.json({
      success: true,
      message: 'Instância desconectada com sucesso!'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Erro ao desconectar instância: ${error.message || 'Servidor indisponível'}` },
      { status: 500 }
    );
  }
}
