import { NextRequest, NextResponse } from 'next/server';
import { processWhatsAppMessage } from '@/lib/whatsapp-agent';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.message || body.text || '';
    const sellerName = body.sellerName || 'Jose Carlos';
    const from = body.from || '5511999887766';

    if (!text.trim()) {
      return NextResponse.json({ error: 'Mensagem em branco' }, { status: 400 });
    }

    const result = await processWhatsAppMessage({
      from,
      sellerName,
      text
    });

    return NextResponse.json({
      success: true,
      reply: result.replyText,
      actionTaken: result.actionTaken,
      orderSummary: result.orderSummary
    });
  } catch (err: any) {
    console.error('[WhatsApp Agent API Error]:', err);
    return NextResponse.json({ error: err.message || 'Erro ao processar mensagem do WhatsApp' }, { status: 500 });
  }
}
