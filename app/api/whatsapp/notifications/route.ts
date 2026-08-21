import { NextRequest, NextResponse } from 'next/server';
import { getOmieSellers, normalizeEmail } from '@/app/api/auth/route';
import { db } from '@/lib/firebase-admin';
import { collection, getDocs, doc, setDoc, query, orderBy, limit } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sellers = await getOmieSellers();

    // Map stored recipient preferences from Firestore
    const recipientMap: Record<number, { receive_order_copy: boolean; phone: string; updatedAt?: string }> = {};

    try {
      const snap = await getDocs(collection(db, 'whatsapp_order_recipients'));
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.codigo_vendedor) {
          recipientMap[Number(data.codigo_vendedor)] = {
            receive_order_copy: Boolean(data.receive_order_copy),
            phone: data.phone || '',
            updatedAt: data.updatedAt
          };
        }
      });
    } catch (dbErr) {
      console.warn('[WhatsApp Notifications API] Warning reading whatsapp_order_recipients:', dbErr);
    }

    // Also merge stored phone numbers from seller_phones
    const phoneMap: Record<number, string> = {};
    try {
      const phoneSnap = await getDocs(collection(db, 'seller_phones'));
      phoneSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.codigo_vendedor && data.phone) {
          phoneMap[Number(data.codigo_vendedor)] = data.phone;
        }
      });
    } catch (dbErr) {
      console.warn('[WhatsApp Notifications API] Warning reading seller_phones:', dbErr);
    }

    // Combine sellers with recipient status
    const formattedSellers = sellers.map((s) => {
      const code = Number(s.codigo_vendedor);
      const recipientData = recipientMap[code];
      const phone = recipientData?.phone || phoneMap[code] || s.phone || '';
      
      // Default admin to receive copy if not explicitly set
      const isDefaultAdmin = normalizeEmail(s.email || '') === 'financeiro@b2brdistribuicao.com.br';
      const receiveCopy = recipientData !== undefined
        ? recipientData.receive_order_copy
        : isDefaultAdmin;

      return {
        codigo_vendedor: code,
        nome: s.nome,
        email: s.email,
        phone,
        receive_order_copy: receiveCopy,
        updatedAt: recipientData?.updatedAt || null
      };
    });

    // Fetch recent notification logs
    let logs: any[] = [];
    try {
      const logsQuery = query(collection(db, 'whatsapp_notification_logs'), orderBy('createdAt', 'desc'), limit(20));
      const logsSnap = await getDocs(logsQuery);
      logsSnap.forEach((docSnap) => {
        logs.push({ id: docSnap.id, ...docSnap.data() });
      });
    } catch (logsErr) {
      console.warn('[WhatsApp Notifications API] Warning reading notification logs:', logsErr);
    }

    return NextResponse.json({
      sellers: formattedSellers,
      logs
    });
  } catch (error: any) {
    console.error('[WhatsApp Notifications API GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar configurações' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { updates, userEmail } = body;

    const normalizedUser = normalizeEmail(userEmail || '');
    if (normalizedUser !== 'financeiro@b2brdistribuicao.com.br') {
      return NextResponse.json(
        { error: 'Apenas o usuário administrador pode alterar as configurações de notificação.' },
        { status: 403 }
      );
    }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Nenhuma atualização fornecida.' }, { status: 400 });
    }

    const sellers = await getOmieSellers();
    const now = new Date().toISOString();

    for (const item of updates) {
      const code = Number(item.codigo_vendedor);
      if (!code) continue;

      const seller = sellers.find((s) => Number(s.codigo_vendedor) === code);
      const sellerName = seller?.nome || item.nome || `Vendedor ${code}`;
      const sellerEmail = seller?.email || item.email || '';
      const phone = String(item.phone || '').trim();
      const phoneDigits = phone.replace(/\D/g, '');
      const receive_order_copy = Boolean(item.receive_order_copy);

      const docId = `recipient_${code}`;
      const docRef = doc(db, 'whatsapp_order_recipients', docId);

      await setDoc(docRef, {
        codigo_vendedor: code,
        nome: sellerName,
        email: sellerEmail,
        phone,
        phoneDigits,
        receive_order_copy,
        updatedAt: now,
        updatedBy: normalizedUser
      });

      // Also update seller_phones if phone is provided
      if (phone) {
        const phoneDocId = `seller_${code}`;
        const phoneDocRef = doc(db, 'seller_phones', phoneDocId);
        await setDoc(phoneDocRef, {
          codigo_vendedor: code,
          nome: sellerName,
          email: sellerEmail,
          phone,
          phoneDigits,
          updatedAt: now,
          updatedBy: normalizedUser
        }, { merge: true });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Configurações de notificações via WhatsApp salvas com sucesso!'
    });
  } catch (error: any) {
    console.error('[WhatsApp Notifications API POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Erro ao salvar configurações' }, { status: 500 });
  }
}
