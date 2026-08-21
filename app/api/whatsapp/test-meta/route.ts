import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    const token = body.token || process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = body.phoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const wabaId = body.wabaId || process.env.WHATSAPP_WABA_ID;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token do WhatsApp não fornecido. Insira seu Token de Acesso temporário ou permanente do Meta.'
      }, { status: 400 });
    }

    const results: Record<string, any> = {};

    // 1. Test call for 'public_profile'
    try {
      const res1 = await fetch(`https://graph.facebook.com/v20.0/me?access_token=${encodeURIComponent(token)}`);
      const data1 = await res1.json();
      results['public_profile'] = {
        endpoint: 'GET /v20.0/me',
        status: res1.status,
        ok: res1.ok,
        data: data1
      };
    } catch (err: any) {
      results['public_profile'] = { ok: false, error: err.message };
    }

    // 2. Test call for 'whatsapp_business_management'
    try {
      const targetId = wabaId || phoneId || 'me';
      const endpoint = wabaId
        ? `https://graph.facebook.com/v20.0/${wabaId}/message_templates?access_token=${encodeURIComponent(token)}`
        : phoneId
          ? `https://graph.facebook.com/v20.0/${phoneId}?fields=id,display_phone_number,verified_name&access_token=${encodeURIComponent(token)}`
          : `https://graph.facebook.com/v20.0/me?fields=id,name&access_token=${encodeURIComponent(token)}`;

      const res2 = await fetch(endpoint);
      const data2 = await res2.json();
      results['whatsapp_business_management'] = {
        endpoint,
        status: res2.status,
        ok: res2.ok,
        data: data2
      };
    } catch (err: any) {
      results['whatsapp_business_management'] = { ok: false, error: err.message };
    }

    // 3. Test call for 'business_management'
    try {
      const res3 = await fetch(`https://graph.facebook.com/v20.0/me/businesses?access_token=${encodeURIComponent(token)}`);
      const data3 = await res3.json();
      results['business_management'] = {
        endpoint: 'GET /v20.0/me/businesses',
        status: res3.status,
        ok: res3.ok,
        data: data3
      };
    } catch (err: any) {
      results['business_management'] = { ok: false, error: err.message };
    }

    return NextResponse.json({
      success: true,
      message: 'Chamadas de teste executadas com sucesso contra a Graph API da Meta!',
      results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao executar chamadas de teste'
    }, { status: 500 });
  }
}
