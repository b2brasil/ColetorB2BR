import { NextRequest, NextResponse } from 'next/server';
import { getRecentWhatsAppLogs, clearAllWhatsAppLogs, logWhatsAppCommunication } from '@/lib/whatsapp-logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const logs = await getRecentWhatsAppLogs(isNaN(limitParam) ? 50 : limitParam);

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error: any) {
    console.error('[WhatsApp Logs API GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar logs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = await logWhatsAppCommunication(body);
    return NextResponse.json({
      success: true,
      log: entry
    });
  } catch (error: any) {
    console.error('[WhatsApp Logs API POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao salvar log' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cleared = await clearAllWhatsAppLogs();
    return NextResponse.json({
      success: cleared,
      message: cleared ? 'Logs limpos com sucesso.' : 'Falha ao limpar logs.'
    });
  } catch (error: any) {
    console.error('[WhatsApp Logs API DELETE Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao limpar logs' },
      { status: 500 }
    );
  }
}
