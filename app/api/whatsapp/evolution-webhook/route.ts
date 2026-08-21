import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('[Evolution Webhook Payload Received]:', JSON.stringify(body).slice(0, 300));

    // Handle incoming message event from Evolution API
    // Evolution API payload format for 'MESSAGES_UPSERT' or 'SEND_MESSAGE'
    const eventType = body.event || body.type;
    const messageData = body.data || body;

    // We only process incoming text messages from clients (not sent by us / key.fromMe === false)
    const isFromMe = messageData.key?.fromMe || body.fromMe;
    if (isFromMe) {
      return NextResponse.json({ status: 'ignored_from_me' });
    }

    const remoteJid = messageData.key?.remoteJid || body.remoteJid || messageData.from;
    const senderPhone = remoteJid ? String(remoteJid).replace(/\D/g, '') : '';
    const messageText =
      messageData.message?.conversation ||
      messageData.message?.extendedTextMessage?.text ||
      messageData.body ||
      '';

    if (!senderPhone || !messageText.trim()) {
      return NextResponse.json({ status: 'ignored_no_content' });
    }

    // Save interaction in Firestore for audit / Agent history
    const logId = `evo_msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await setDoc(doc(db, 'whatsapp_agent_interactions', logId), {
      id: logId,
      senderPhone,
      messageText,
      eventType: eventType || 'MESSAGES_UPSERT',
      provider: 'evolution',
      rawPayload: body,
      receivedAt: new Date().toISOString()
    });

    return NextResponse.json({
      status: 'success',
      received: true,
      senderPhone,
      messageText,
      logId
    });
  } catch (error: any) {
    console.error('[Evolution Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar Webhook Evolution' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    message: 'Webhook Evolution API do B2BR Coletor operacional.',
    endpoint: '/api/whatsapp/evolution-webhook'
  });
}
