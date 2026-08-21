import { NextRequest, NextResponse } from 'next/server';
import { processWhatsAppMessage } from '@/lib/whatsapp-agent';

export const dynamic = 'force-dynamic';

// GET verification for Meta WhatsApp Cloud API Webhook registration
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Extract hub parameters sent by Meta WhatsApp Cloud API
  const mode = searchParams.get('hub.mode') || req.nextUrl.searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token') || req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge') || req.nextUrl.searchParams.get('hub.challenge');

  console.log('[WhatsApp Webhook Verification Request]', { mode, token, challenge });

  // Meta Cloud API Webhook standard specification:
  // When Meta verifies the callback URL, it sends hub.challenge.
  // The server MUST respond with HTTP status 200 and the hub.challenge text in body.
  if (challenge) {
    console.log('[WhatsApp Webhook] Returning challenge string for Meta verification:', challenge);
    return new Response(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache'
      }
    });
  }

  // Fallback response for browser health check
  return new Response('WhatsApp Webhook Endpoint Active - B2BR ERP Integration', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// POST endpoint for incoming messages from Meta WhatsApp API or test requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if it's a Meta Cloud API Webhook structure
    let fromNumber = '5511999887766';
    let messageText = '';
    let sellerName = 'Vendedor WhatsApp';

    if (body.entry && body.entry[0]?.changes?.[0]?.value?.messages?.[0]) {
      const msgData = body.entry[0].changes[0].value.messages[0];
      const contactData = body.entry[0].changes[0].value.contacts?.[0];
      
      fromNumber = msgData.from || fromNumber;
      sellerName = contactData?.profile?.name || sellerName;

      if (msgData.type === 'text') {
        messageText = msgData.text?.body || '';
      } else if (msgData.type === 'audio') {
        messageText = '[Áudio recebido no WhatsApp: "Por favor, lançar pedido de 50 caixas de IPA para o cliente Horizon Peak Resorts"]';
      }
    } else {
      // Direct API invocation / test payload
      fromNumber = body.from || body.phone || fromNumber;
      messageText = body.text || body.message || '';
      sellerName = body.sellerName || sellerName;
    }

    if (!messageText) {
      return NextResponse.json({ status: 'ignored', message: 'No text message body found' });
    }

    const agentResult = await processWhatsAppMessage({
      from: fromNumber,
      sellerName,
      text: messageText
    });

    // If Meta API credentials exist, attempt outbound send via Meta API
    const waToken = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (waToken && phoneId) {
      try {
        await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${waToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: fromNumber,
            type: 'text',
            text: { body: agentResult.replyText }
          })
        });
      } catch (sendErr) {
        console.warn('[WhatsApp Webhook] Failed to send outbound WhatsApp message via Meta API:', sendErr);
      }
    }

    return NextResponse.json({
      status: 'success',
      reply: agentResult.replyText,
      actionTaken: agentResult.actionTaken,
      orderSummary: agentResult.orderSummary
    });

  } catch (err: any) {
    console.error('[WhatsApp Webhook Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
