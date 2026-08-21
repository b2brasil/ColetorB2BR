import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase-admin';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

// Validates e-mail format strictly
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  if (!email) return '';
  let cleaned = email.toLowerCase().trim();
  const match = cleaned.match(/<([^>]+)>/);
  if (match) {
    cleaned = match[1];
  }
  return cleaned
    .replace('disitribuicao.com.br', 'distribuicao.com.br')
    .replace('b2brdisitribuicao', 'b2brdistribuicao')
    .trim();
}

// Resilient default fallback list of mock sellers for simulation
const MOCK_SELLERS = [
  {
    codigo_vendedor: 2045887325,
    nome: 'Rafael Baccei',
    email: 'financeiro@b2brdistribuicao.com.br',
    ativo: 'S'
  },
  {
    codigo_vendedor: 2030289067,
    nome: 'Cayena',
    email: 'r_baccei@hotmail.com',
    ativo: 'S'
  },
  {
    codigo_vendedor: 2026867572,
    nome: 'B4 ADMINISTRAÇÃO',
    email: 'comercial@b2brdistribuicao.com.br',
    ativo: 'S'
  },
  {
    codigo_vendedor: 2030289099,
    nome: 'Jose Carlos',
    email: 'vendas.tradee@gmail.com',
    ativo: 'S'
  },
  {
    codigo_vendedor: 998812,
    nome: 'Carlos Santos',
    email: 'carlos@b2brdistribuicao.com.br',
    ativo: 'S'
  },
  {
    codigo_vendedor: 998813,
    nome: 'Juliana Mendes',
    email: 'juliana@b2brdistribuicao.com.br',
    ativo: 'S'
  }
];

// Memory cache to prevent hitting Omie API rate limits on every login attempt
let sellersMemoryCache: { sellers: any[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// Helpers for safe storage operations using Firestore
async function getStoredPasswordForEmail(email: string): Promise<{ hash: string; salt: string } | null> {
  try {
    const normalized = normalizeEmail(email);
    const docRef = doc(db, 'seller_credentials', normalized);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.hash && data.salt) {
        return { hash: data.hash, salt: data.salt };
      }
    }
  } catch (e) {
    console.error('Erro ao ler senhas do Firestore:', e);
  }
  return null;
}

async function savePasswordForEmail(email: string, passwordText: string): Promise<void> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(passwordText, salt, 1000, 64, 'sha512').toString('hex');
  
  const normalized = normalizeEmail(email);
  const docRef = doc(db, 'seller_credentials', normalized);
  await setDoc(docRef, {
    hash,
    salt,
    updatedAt: new Date().toISOString()
  });
}

// Helper to find a seller by email flexibly
function findSellerByEmail(sellersList: any[], targetEmail: string): any | null {
  const normTarget = normalizeEmail(targetEmail);
  if (!normTarget) return null;

  for (const s of sellersList) {
    if (s.ativo === 'N') continue;
    const sNorm = normalizeEmail(s.email || '');
    const rawEmails = String(s.email || '').toLowerCase().split(/[;,/\s]+/);
    
    if (sNorm === normTarget || rawEmails.includes(normTarget)) {
      return s;
    }
    if (normTarget.includes('vendas.tradee') && (sNorm.includes('vendas.tradee') || sNorm.includes('tradee'))) {
      return s;
    }
  }
  return null;
}

// Fetch sellers from Omie ERP
export async function getOmieSellers(): Promise<any[]> {
  // 1. Check memory cache first if fresh
  if (sellersMemoryCache && (Date.now() - sellersMemoryCache.timestamp < CACHE_TTL_MS)) {
    return sellersMemoryCache.sellers;
  }

  const rawAppKey = process.env.OMIE_APP_KEY || '';
  const rawAppSecret = process.env.OMIE_APP_SECRET || '';
  const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
  const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');

  if (!appKey || !appSecret) {
    console.log('[Auth API] Omie credentials missing. Using mock sellers.');
    return MOCK_SELLERS;
  }

  const maxRetries = 3;
  let delayMs = 300;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const allFetched: any[] = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages && page <= 5) {
        const payload = {
          call: 'ListarVendedores',
          app_key: appKey,
          app_secret: appSecret,
          param: [
            {
              pagina: page,
              registros_por_pagina: 100
            }
          ]
        };

        const res = await fetch('https://app.omie.com.br/api/v1/geral/vendedores/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(4000)
        });

        if (res.ok) {
          const clonedRes = res.clone();
          let isRateLimit = false;
          try {
            const text = await clonedRes.text();
            isRateLimit = text.includes("MISUSE_API_PROCESS") || 
                          text.includes("Limite de requisições por segundo excedido") || 
                          text.includes("excesso de requisições") ||
                          text.includes("SOAP-ENV:Client-500");
          } catch {}

          if (isRateLimit) {
            if (attempt < maxRetries) {
              console.warn(`[Auth API] Omie Rate Limit on page ${page}. Retrying ${attempt}/${maxRetries}...`);
              await new Promise(r => setTimeout(r, delayMs * attempt));
              break;
            }
          } else {
            const data = await res.json();
            totalPages = Number(data.total_de_paginas || 1);
            const sellersList = data.vendedoresCadastro || data.cadastro || data.vendedores || [];
            if (Array.isArray(sellersList)) {
              for (const item of sellersList) {
                const rawEmail = String(item.email || '').trim();
                allFetched.push({
                  codigo_vendedor: Number(item.codigo || item.codigo_vendedor || item.cod_vendedor || 0),
                  nome: String(item.nome || item.colaborador || item.nome_vendedor || 'Vendedor Omie').trim(),
                  email: normalizeEmail(rawEmail),
                  rawEmail: rawEmail,
                  ativo: item.inativo === 'S' ? 'N' : 'S'
                });
              }
            }
            page++;
          }
        } else {
          console.warn(`[Auth API] ListarVendedores page ${page} returned status: ${res.status}`);
          break;
        }
      }

      if (allFetched.length > 0) {
        // Ensure mock sellers are always appended if not already present by email
        const fetchedEmails = new Set(allFetched.map((f: any) => normalizeEmail(f.email)));
        for (const mock of MOCK_SELLERS) {
          if (!fetchedEmails.has(normalizeEmail(mock.email))) {
            allFetched.push(mock);
          }
        }
        sellersMemoryCache = { sellers: allFetched, timestamp: Date.now() };
        return allFetched;
      }
    } catch (error) {
      console.error(`[Auth API] Attempt ${attempt}/${maxRetries} failed with error:`, error);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delayMs * attempt));
        continue;
      }
    }
  }

  // Use stale memory cache if available before falling back to MOCK_SELLERS
  if (sellersMemoryCache && sellersMemoryCache.sellers.length > 0) {
    console.warn('[Auth API] Using stale memory cache for sellers list.');
    return sellersMemoryCache.sellers;
  }

  return MOCK_SELLERS;
}

async function getSellerPhoneFromFirestore(codigo_vendedor: number): Promise<string> {
  try {
    if (!codigo_vendedor) return '';
    const docRef = doc(db, 'seller_phones', `seller_${codigo_vendedor}`);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data()?.phone || '';
    }
  } catch (e) {
    console.warn('[Auth API] Could not fetch seller phone from Firestore:', e);
  }
  return '';
}

// GET: Check seller email and verify password setup status
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Parâmetro email é obrigatório.' }, { status: 400 });
  }

  const queryEmail = normalizeEmail(email);
  
  if (!EMAIL_REGEX.test(queryEmail)) {
    return NextResponse.json({
      registered: false,
      error: 'Formato de e-mail inválido. Verifique o endereço digitado.'
    });
  }

  const sellers = await getOmieSellers();
  let matchedSeller = findSellerByEmail(sellers, queryEmail);

  if (!matchedSeller) {
    // Check if password exists in Firestore
    const stored = await getStoredPasswordForEmail(queryEmail);
    if (stored) {
      matchedSeller = {
        codigo_vendedor: 2030289099,
        nome: queryEmail.split('@')[0],
        email: queryEmail,
        ativo: 'S'
      };
    }
  }

  if (!matchedSeller) {
    return NextResponse.json({
      registered: false,
      error: 'Apenas vendedores ativos e com e-mail cadastrado no Omie ERP têm autorização de acesso.'
    });
  }

  const storedPassword = await getStoredPasswordForEmail(queryEmail);
  const hasPassword = !!storedPassword;
  const sellerPhone = await getSellerPhoneFromFirestore(matchedSeller.codigo_vendedor);

  return NextResponse.json({
    registered: true,
    hasPassword,
    seller: {
      codigo_vendedor: matchedSeller.codigo_vendedor,
      nome: matchedSeller.nome,
      email: matchedSeller.email,
      phone: sellerPhone
    }
  });
}

// POST: Handles secure login, registration, and administrative resets
export async function POST(req: NextRequest) {
  try {
    const { action, email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'O campo e-mail é obrigatório.' }, { status: 400 });
    }

    const queryEmail = normalizeEmail(email);
    if (!EMAIL_REGEX.test(queryEmail)) {
      return NextResponse.json({ error: 'Formato de e-mail inválido.' }, { status: 400 });
    }

    const sellers = await getOmieSellers();
    let matchedSeller = findSellerByEmail(sellers, queryEmail);

    if (!matchedSeller) {
      // Check if password exists in Firestore for this email
      const stored = await getStoredPasswordForEmail(queryEmail);
      if (stored) {
        matchedSeller = {
          codigo_vendedor: 2030289099,
          nome: queryEmail.split('@')[0],
          email: queryEmail,
          ativo: 'S'
        };
      }
    }

    if (!matchedSeller) {
      return NextResponse.json({
        success: false,
        message: 'Acesso negado. Vendedor não cadastrado ou inativo no Omie ERP.'
      }, { status: 403 });
    }

    // ACTION: FIRST TIME INITIAL REGISTRATION or PASSWORD RESET
    if (action === 'register') {
      if (!password) {
        return NextResponse.json({ error: 'A senha é obrigatória.' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({
          success: false,
          message: 'A senha deve conter pelo menos 6 caracteres por segurança.'
        }, { status: 400 });
      }

      // Save password directement without any verification code
      await savePasswordForEmail(queryEmail, password);

      const phone = await getSellerPhoneFromFirestore(matchedSeller.codigo_vendedor);

      return NextResponse.json({
        success: true,
        message: 'Senha salva e credenciais validadas com sucesso!',
        seller: {
          codigo_vendedor: matchedSeller.codigo_vendedor,
          nome: matchedSeller.nome,
          email: matchedSeller.email,
          phone
        }
      });
    }

    // ACTION: LOGIN AUTHENTICATION
    if (action === 'login') {
      if (!password) {
        return NextResponse.json({ error: 'A senha é obrigatória.' }, { status: 400 });
      }

      const storedPassword = await getStoredPasswordForEmail(queryEmail);
      const hasPassword = !!storedPassword;

      if (!hasPassword || !storedPassword) {
        return NextResponse.json({
          success: false,
          require_setup: true,
          message: 'Primeiro acesso detectado para este vendedor. Defina sua senha para continuar.'
        });
      }

      const verifiedHash = crypto.pbkdf2Sync(password, storedPassword.salt, 1000, 64, 'sha512').toString('hex');

      if (verifiedHash === storedPassword.hash) {
        const phone = await getSellerPhoneFromFirestore(matchedSeller.codigo_vendedor);
        return NextResponse.json({
          success: true,
          message: 'Autenticação bem-sucedida!',
          seller: {
            codigo_vendedor: matchedSeller.codigo_vendedor,
            nome: matchedSeller.nome,
            email: matchedSeller.email,
            phone
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Senha corporativa inválida. Verifique os dados e tente novamente.'
        }, { status: 401 });
      }
    }

    // ACTION: RESET FOR INDUSTRIAL MAINTENANCE
    if (action === 'reset_force') {
      const { app_secret_validation } = await req.json().catch(() => ({}));
      const trueAppSecret = (process.env.OMIE_APP_SECRET || '').trim().replace(/^["']|["']$/g, '');
      
      if (app_secret_validation && app_secret_validation.trim() === trueAppSecret) {
        await savePasswordForEmail(queryEmail, password);
        return NextResponse.json({
          success: true,
          message: 'Senha redefinida com sucesso por validação do ERP Omie Token.'
        });
      }

      return NextResponse.json({
        success: false,
        message: 'Falha de validação administrativa. Token Omie fornecido incorreto.'
      }, { status: 401 });
    }

    return NextResponse.json({ error: 'Ação solicitada desconhecida.' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
