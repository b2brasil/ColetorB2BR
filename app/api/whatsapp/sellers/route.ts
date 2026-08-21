import { NextRequest, NextResponse } from 'next/server';
import { getOmieSellers, normalizeEmail } from '@/app/api/auth/route';
import { db } from '@/lib/firebase-admin';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sellers = await getOmieSellers();
    
    // Fetch stored phone mappings from Firestore
    const phonesMap: Record<string, { phone: string; phoneDigits: string; updatedAt?: string }> = {};

    try {
      const snap = await getDocs(collection(db, 'seller_phones'));
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.codigo_vendedor) {
          phonesMap[String(data.codigo_vendedor)] = {
            phone: data.phone || '',
            phoneDigits: data.phoneDigits || '',
            updatedAt: data.updatedAt
          };
        }
      });
    } catch (dbErr) {
      console.warn('[WhatsApp Sellers API] Failed to fetch seller_phones from Firestore:', dbErr);
    }

    const result = sellers.map((s) => {
      const phoneData = phonesMap[String(s.codigo_vendedor)] || { phone: '', phoneDigits: '' };
      return {
        ...s,
        phone: phoneData.phone,
        phoneDigits: phoneData.phoneDigits,
        updatedAt: phoneData.updatedAt
      };
    });

    return NextResponse.json({ sellers: result });
  } catch (error: any) {
    console.error('[WhatsApp Sellers API GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar lista de vendedores' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codigo_vendedor, phone, userEmail } = body;

    if (!codigo_vendedor) {
      return NextResponse.json({ error: 'Código do vendedor é obrigatório.' }, { status: 400 });
    }

    // Verify Admin permission or Self permission
    const normalizedUser = normalizeEmail(userEmail || '');
    if (!normalizedUser) {
      return NextResponse.json({ error: 'E-mail do usuário não fornecido.' }, { status: 400 });
    }

    const sellers = await getOmieSellers();
    const seller = sellers.find((s) => Number(s.codigo_vendedor) === Number(codigo_vendedor));

    if (!seller) {
      return NextResponse.json({ error: 'Vendedor não encontrado na base do Omie ERP.' }, { status: 404 });
    }

    const normalizedSellerEmail = normalizeEmail(seller.email || '');
    const isAdmin = normalizedUser === 'financeiro@b2brdistribuicao.com.br';
    const isSelf = normalizedUser === normalizedSellerEmail;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Você só pode alterar o número de celular vinculado à sua própria conta de vendedor.' },
        { status: 403 }
      );
    }

    const cleanPhone = String(phone || '').trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');

    const docId = `seller_${codigo_vendedor}`;
    const docRef = doc(db, 'seller_phones', docId);

    await setDoc(docRef, {
      codigo_vendedor: Number(codigo_vendedor),
      nome: seller.nome,
      email: seller.email,
      phone: cleanPhone,
      phoneDigits,
      updatedAt: new Date().toISOString(),
      updatedBy: normalizedUser
    });

    return NextResponse.json({
      success: true,
      message: `Telefone do vendedor ${seller.nome} vinculado com sucesso!`,
      sellerPhone: {
        codigo_vendedor: Number(codigo_vendedor),
        nome: seller.nome,
        email: seller.email,
        phone: cleanPhone,
        phoneDigits
      }
    });

  } catch (error: any) {
    console.error('[WhatsApp Sellers API POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Erro ao salvar vínculo de telefone' }, { status: 500 });
  }
}
