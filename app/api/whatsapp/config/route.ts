import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const configDocRef = doc(db, 'whatsapp_config', 'meta');
    const docSnap = await getDoc(configDocRef);

    let config = {
      provider: 'evolution', // 'evolution' | 'meta'
      evolutionServerUrl: process.env.EVOLUTION_API_URL || '',
      evolutionApiKey: process.env.EVOLUTION_API_KEY || '',
      evolutionInstanceName: process.env.EVOLUTION_INSTANCE_NAME || 'b2br_coletor',
      accessToken: process.env.WHATSAPP_API_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      wabaId: process.env.WHATSAPP_WABA_ID || '',
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'b2br_coletor_wa_token',
      updatedAt: null,
      updatedBy: null
    };

    if (docSnap.exists()) {
      const data = docSnap.data();
      config = {
        provider: data.provider || config.provider,
        evolutionServerUrl: data.evolutionServerUrl || config.evolutionServerUrl,
        evolutionApiKey: data.evolutionApiKey || config.evolutionApiKey,
        evolutionInstanceName: data.evolutionInstanceName || config.evolutionInstanceName,
        accessToken: data.accessToken || config.accessToken,
        phoneNumberId: data.phoneNumberId || config.phoneNumberId,
        wabaId: data.wabaId || config.wabaId,
        verifyToken: data.verifyToken || config.verifyToken,
        updatedAt: data.updatedAt || null,
        updatedBy: data.updatedBy || null
      };
    }

    const maskedMetaToken = config.accessToken
      ? `${config.accessToken.substring(0, 8)}...${config.accessToken.slice(-6)}`
      : '';

    const maskedEvolutionKey = config.evolutionApiKey
      ? `${config.evolutionApiKey.substring(0, 6)}...${config.evolutionApiKey.slice(-4)}`
      : '';

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        hasAccessToken: Boolean(config.accessToken),
        hasPhoneNumberId: Boolean(config.phoneNumberId),
        hasEvolutionConfig: Boolean(config.evolutionServerUrl && config.evolutionApiKey && config.evolutionInstanceName),
        maskedMetaToken,
        maskedEvolutionKey
      }
    });
  } catch (error: any) {
    console.error('[WhatsApp Config GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar configurações do WhatsApp' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      provider,
      evolutionServerUrl,
      evolutionApiKey,
      evolutionInstanceName,
      accessToken,
      phoneNumberId,
      wabaId,
      verifyToken,
      userEmail
    } = body;

    const configDocRef = doc(db, 'whatsapp_config', 'meta');
    const docSnap = await getDoc(configDocRef);
    const existingData = docSnap.exists() ? docSnap.data() : {};

    let cleanServerUrl = evolutionServerUrl !== undefined ? String(evolutionServerUrl).trim() : (existingData.evolutionServerUrl || '');
    if (cleanServerUrl && cleanServerUrl.endsWith('/')) {
      cleanServerUrl = cleanServerUrl.slice(0, -1);
    }

    const updatedData = {
      provider: provider || existingData.provider || 'evolution',
      evolutionServerUrl: cleanServerUrl,
      evolutionApiKey: evolutionApiKey !== undefined ? String(evolutionApiKey).trim() : (existingData.evolutionApiKey || ''),
      evolutionInstanceName: evolutionInstanceName !== undefined ? String(evolutionInstanceName).trim() : (existingData.evolutionInstanceName || 'b2br_coletor'),
      accessToken: accessToken !== undefined ? String(accessToken).trim() : (existingData.accessToken || ''),
      phoneNumberId: phoneNumberId !== undefined ? String(phoneNumberId).trim() : (existingData.phoneNumberId || ''),
      wabaId: wabaId !== undefined ? String(wabaId).trim() : (existingData.wabaId || ''),
      verifyToken: verifyToken !== undefined ? String(verifyToken).trim() : (existingData.verifyToken || 'b2br_coletor_wa_token'),
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'financeiro@b2brdistribuicao.com.br'
    };

    await setDoc(configDocRef, updatedData, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Configurações de integração com WhatsApp salvas com sucesso!'
    });
  } catch (error: any) {
    console.error('[WhatsApp Config POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Erro ao salvar configurações do WhatsApp' }, { status: 500 });
  }
}
