import {NextRequest, NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';

// Standard fallback data set conforming to the requested mockup views
const SEEDED_CLIENTS = [
  {
    cnpj: '12.345.678/0001-90',
    name: 'Horizon Peak Resorts',
    razao_social: 'HORIZON PEAK RESORTS & GOLF LTDA',
    city: 'Rio de Janeiro',
    lastOrder: '2 dias atrás',
    status: 'IN STOCK',
    description: 'Resort de alta performance com alto consumo de bebidas premium.',
    endereco: 'Rua General Osório',
    endereco_numero: '500',
    complemento: 'Bloco B - Recepção',
    bairro: 'Ipanema',
    cep: '22041-010',
    estado: 'RJ',
    email: 'compras@horizonpeak.com.br',
    telefone: '(21) 3222-1100',
    rede: 'Crema',
    tags: [{ tag: 'cliente' }]
  },
  {
    cnpj: '98.765.432/0001-21',
    name: 'The Brass Tap Bistro',
    razao_social: 'COPPER & BRASS RESTAURANTE LTDA',
    city: 'São Paulo',
    lastOrder: '1 semana atrás',
    status: 'LOW STOCK',
    description: 'Bistrô gastronômico com foco em cervejas artesanais.',
    endereco: 'Alameda Lorena',
    endereco_numero: '1432',
    complemento: 'Andar Térreo',
    bairro: 'Cerqueira César',
    cep: '01424-001',
    estado: 'SP',
    email: 'financeiro@brasstapbistro.com.br',
    telefone: '(11) 3088-9922',
    tags: [{ tag: 'cliente' }]
  },
  {
    cnpj: '45.678.901/0002-15',
    name: 'Azure Marina Grill',
    razao_social: 'AZURE MARINA GOURMET E EVENTOS S/A',
    city: 'Florianópolis',
    lastOrder: 'Nunca Comprado',
    status: 'OUT OF STOCK',
    description: 'Restaurante na marina com alta visibilidade de branding.',
    endereco: 'Avenida Beira Mar Norte',
    endereco_numero: '2300',
    complemento: 'Quiosque 12',
    bairro: 'Centro',
    cep: '88015-700',
    estado: 'SC',
    email: 'suprimentos@azuremarina.com',
    telefone: '(48) 3224-8844',
    tags: [{ tag: 'lead' }]
  },
  {
    cnpj: '33.221.109/0001-55',
    name: 'Gourmet Central Market',
    razao_social: 'CENTRAL DE ALIMENTOS GOURMET LTDA',
    city: 'Belo Horizonte',
    lastOrder: '4 dias atrás',
    status: 'IN STOCK',
    description: 'Hortifruti gourmet e mercado boutique premium.',
    endereco: 'Avenida Getúlio Vargas',
    endereco_numero: '1420',
    complemento: 'Loja 3',
    bairro: 'Funcionários',
    cep: '30112-021',
    estado: 'MG',
    email: 'recebimento@gourmetcentral.com.br',
    telefone: '(31) 3222-7744',
    tags: [{ tag: 'cliente' }]
  }
];

const SEEDED_PRODUCTS = [
  {
    sku: 'MAL-50D-112',
    name: 'Mountain Ale Draft 50L',
    category: 'Beer',
    unitPrice: 185.00,
    description: 'Barril de chopp artesanal encorpado tipo ale com notas florais.',
    inventory: 45,
    avatar: 'https://picsum.photos/seed/beer1/100/100',
    codigo: '201211',
    ean: '7891000101234',
    marca: 'Kaiser',
    unidade: 'UN',
    url_imagem: 'https://picsum.photos/seed/beer1/100/100',
    fabricante: 'Kaiser'
  },
  {
    sku: 'BR-9921-IPA',
    name: 'Hops Heaven IPA',
    category: 'Beer',
    unitPrice: 24.50,
    description: 'Notas intensas de lúpulo e frutas cítricas. Pacote de 12 unidades x 330ml.',
    inventory: 154,
    avatar: 'https://picsum.photos/seed/beer2/100/100',
    codigo: '201212',
    ean: '7891000101241',
    marca: 'Heineken',
    unidade: 'FD',
    url_imagem: 'https://picsum.photos/seed/beer2/100/100',
    fabricante: 'Heineken'
  },
  {
    sku: 'TNC-C24-PRM',
    name: 'Premium Tonic Case (24x)',
    category: 'Soda',
    unitPrice: 24.50,
    description: 'Caixa com 24 unidades de água tônica premium com gás intenso.',
    inventory: 120,
    avatar: 'https://picsum.photos/seed/tonic/100/100',
    codigo: '201213',
    ean: '7891000101258',
    marca: 'Antarctica',
    unidade: 'CX',
    url_imagem: 'https://picsum.photos/seed/tonic/100/100',
    fabricante: 'Antarctica'
  },
  {
    sku: 'WT-1100-LZ',
    name: 'Zest Sparkling Water',
    category: 'Water',
    unitPrice: 18.75,
    description: 'Água mineral gaseificada com infusão natural de limão siciliano. Caixa com 24x500ml.',
    inventory: 98,
    avatar: 'https://picsum.photos/seed/water/100/100',
    codigo: '201214',
    ean: '7891000101265',
    marca: 'Crystal',
    unidade: 'CX',
    url_imagem: 'https://picsum.photos/seed/water/100/100',
    fabricante: 'Crystal'
  },
  {
    sku: 'JCE-CMX-ORG',
    name: 'Organic Citrus Mix Case',
    category: 'Soda',
    unitPrice: 32.00,
    description: 'Suco cítrico 100% orgânico em gerrafas de vidro. Cesta com 12 gerrafas.',
    inventory: 64,
    avatar: 'https://picsum.photos/seed/juice/100/100',
    codigo: '201215',
    ean: '7891000101272',
    marca: 'Del Valle',
    unidade: 'FD',
    url_imagem: 'https://picsum.photos/seed/juice/100/100',
    fabricante: 'Duelo'
  },
  {
    sku: 'SD-4450-CL',
    name: 'Retro Cane Cola',
    category: 'Soda',
    unitPrice: 22.00,
    description: 'Refrigerante artesanal de cola purificada com açúcar de cana nativo. Garrafas de vidro 12x355ml.',
    inventory: 0, // Out of Stock
    avatar: 'https://picsum.photos/seed/cola/100/100',
    codigo: '201216',
    ean: '7891000101289',
    marca: 'Coca-Cola',
    unidade: 'FD',
    url_imagem: 'https://picsum.photos/seed/cola/100/100',
    fabricante: 'Duelo'
  }
];

// Simple memory cache to guarantee rapid responses and avoid browser / platform timeout (504 Gateway errors)
interface CachedData {
  timestamp: number;
  appKey: string;
  appSecret: string;
  responsePayload: any;
  rawClients?: any[];
}

let omieMemoryCache: CachedData | null = null;
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes TTL

let cachedContaCorrenteId: number | null = null;
let cachedCategoryCode: string | null = null;
let cachedPaymentTerms: { code: string; description: string }[] | null = null;
let cachedCenariosImpostos: { codigo: number; descricao: string; padrao?: boolean }[] | null = null;

// Robust Rate-Limiting Retry Helper for Omie APIs (especially to solve MISUSE_API_PROCESS / HTTP 500 / 429 / Timeouts)
const fetchOmieWithRetry = async (url: string, init: RequestInit, maxRetries = 2, delayMs = 300, timeoutMs = 15000): Promise<Response> => {
  let attempt = 0;
  while (true) {
    attempt++;
    
    // Create a new AbortController for this specific attempt to avoid signal pollution across retries
    const attemptController = new AbortController();
    
    // If the parent passed a signal, listen to it to abort this attempt too
    const parentSignal = init.signal;
    let onParentAbort: (() => void) | null = null;
    if (parentSignal) {
      if (parentSignal.aborted) {
        throw new Error('This operation was aborted');
      }
      onParentAbort = () => {
        attemptController.abort();
      };
      parentSignal.addEventListener('abort', onParentAbort);
    }

    // Individual attempt timeout guard
    const timeoutId = setTimeout(() => {
      attemptController.abort(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    try {
      // Fetch with our fresh attempt signal
      const res = await fetch(url, {
        ...init,
        signal: attemptController.signal
      });
      
      clearTimeout(timeoutId);
      if (parentSignal && onParentAbort) {
        parentSignal.removeEventListener('abort', onParentAbort);
      }

      if (res.ok) {
        const clonedForFault = res.clone();
        try {
          const text = await clonedForFault.text();
          const isFault = text.includes("MISUSE_API_PROCESS") || 
                          text.includes("Limite de requisições por segundo excedido") || 
                          text.includes("excesso de requisições") ||
                          text.includes("SOAP-ENV:Client-500") ||
                          text.includes("SOAP-ERROR") ||
                          text.includes("SOAP-ENV:Server");
          if (isFault && attempt < maxRetries) {
            await new Promise(r => setTimeout(r, delayMs * attempt));
            continue;
          }
        } catch {}
        return res;
      }
      
      if (res.status >= 500 || res.status === 429) {
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, delayMs * attempt));
          continue;
        }
      }
      
      return res;
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (parentSignal && onParentAbort) {
        parentSignal.removeEventListener('abort', onParentAbort);
      }

      // If the parent signal was the one aborted, we should not retry because the caller canceled everything
      if (parentSignal && parentSignal.aborted) {
        throw e;
      }

      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delayMs * attempt));
        continue;
      }
      throw e;
    }
  }
};

export async function fetchOmieCenariosImpostos(
  appKey: string, 
  appSecret: string, 
  forceRefresh = false
): Promise<{ codigo: number; descricao: string; padrao?: boolean }[]> {
  if (!forceRefresh && cachedCenariosImpostos && cachedCenariosImpostos.length > 0) {
    return cachedCenariosImpostos;
  }

  const endpoints = [
    'https://app.omie.com.br/api/v1/produtos/cenarios/',
    'https://app.omie.com.br/api/v1/geral/cenarios/',
    'https://app.omie.com.br/api/v1/produtos/cenariotributario/',
    'https://app.omie.com.br/api/v1/vendas/cenarios/'
  ];

  for (const endpoint of endpoints) {
    try {
      const payload = {
        call: 'ListarCenarios',
        app_key: appKey.trim().replace(/^["']|["']$/g, ''),
        app_secret: appSecret.trim().replace(/^["']|["']$/g, ''),
        param: [{ pagina: 1, registros_por_pagina: 100 }]
      };

      const res = await fetchOmieWithRetry(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 1, 200, 8000);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const list = data.cenarios_cadastro || 
                     data.cenarios || 
                     data.lista_cenarios || 
                     data.cenarios_impostos || 
                     data.cadastros || 
                     data.registros || 
                     [];

        if (Array.isArray(list) && list.length > 0) {
          const parsed = list.map((item: any) => {
            const rawCod = item.codigo_cenario || item.ncodigo || item.nCodigo || item.codigo || item.cCodigo || 0;
            const rawDesc = item.descricao || item.cdescricao || item.cDescricao || item.nome || item.cNome || `Cenário Fiscal ${rawCod}`;
            const isPadrao = item.padrao === 'S' || item.cpadrao === 'S' || item.cPadrao === 'S';
            const isInativo = item.inativo === 'S' || item.cinativo === 'S' || item.cInativo === 'S';
            return {
              codigo: Number(rawCod),
              descricao: String(rawDesc).trim(),
              padrao: isPadrao,
              inativo: isInativo
            };
          }).filter((c: any) => c.codigo > 0 && !c.inativo);

          if (parsed.length > 0) {
            console.log(`[Omie Cenários de Impostos] Sincronizados com sucesso do endpoint ${endpoint} (${parsed.length} cenários):`, parsed.map(p => `${p.descricao} [${p.codigo}]`).join(', '));
            cachedCenariosImpostos = parsed;
            return parsed;
          }
        }
      }
    } catch (e: any) {
      console.warn(`[Omie Cenários] Consulta no endpoint ${endpoint} não retornou lista:`, e.message);
    }
  }

  return [];
}

export async function GET(req: NextRequest) {
  const routeStartTime = Date.now();
  const action = req.nextUrl.searchParams.get('action');

  if (action === 'cenarios') {
    const rawAppKey = process.env.OMIE_APP_KEY || '';
    const rawAppSecret = process.env.OMIE_APP_SECRET || '';
    const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
    const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');
    const forceRefresh = req.nextUrl.searchParams.get('refresh') === 'true';

    if (!appKey || !appSecret) {
      return NextResponse.json({
        status: 'success',
        cenarios: [
          { codigo: 1, descricao: 'Venda Padrão (Simulado)', padrao: true }
        ]
      });
    }

    try {
      const cenarios = await fetchOmieCenariosImpostos(appKey, appSecret, forceRefresh);
      return NextResponse.json({
        status: 'success',
        cenarios: cenarios.length > 0 ? cenarios : [
          { codigo: 0, descricao: 'Cenário Fiscal Padrão Omie ERP (Automático)', padrao: true }
        ]
      });
    } catch (e: any) {
      return NextResponse.json({ status: 'error', message: e.message, cenarios: [] });
    }
  }

  if (action === 'characteristics') {
    const rawAppKey = process.env.OMIE_APP_KEY || '';
    const rawAppSecret = process.env.OMIE_APP_SECRET || '';
    const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
    const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');
    const codigo = Number(req.nextUrl.searchParams.get('codigo'));

    if (!appKey || !appSecret || !codigo) {
      // If mock or missing client code, return a mocked / empty characteristic
      return NextResponse.json({ rede: codigo === 12345 || codigo === 2027106726 || codigo === 12.34567800019 ? "Crema" : "" });
    }

    try {
      const payload = {
        call: 'ConsultarCaractCliente',
        app_key: appKey,
        app_secret: appSecret,
        param: [{
          codigo_cliente_omie: codigo,
          codigo_cliente_integracao: ""
        }]
      };

      const res = await fetch('https://app.omie.com.br/api/v1/geral/clientes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Omie characteristics response structure:', JSON.stringify(data));
        
        let caracteristicas = data.caracteristicas || [];
        if (!caracteristicas.length && data.caracteristicas_cliente) {
          caracteristicas = data.caracteristicas_cliente;
        }
        
        const redeCaract = caracteristicas.find((c: any) => 
          String(c.campo || '').toLowerCase().trim() === 'rede'
        );
        return NextResponse.json({ rede: redeCaract ? redeCaract.conteudo : "" });
      } else {
        console.warn('Omie API characteristics request returned non-OK status:', res.status);
      }
    } catch (e) {
      console.error('Error fetching characteristics:', e);
    }
    return NextResponse.json({ rede: "" });
  }

  if (action === 'logo') {
    const rawAppKey = process.env.OMIE_APP_KEY || '';
    const rawAppSecret = process.env.OMIE_APP_SECRET || '';
    const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
    const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');

    const OMIE_LOGO_URL = 'https://cdn.omie.com.br/repository/89307d9d98cb3612f53b175ebba53b1b/ce6447aff9064a82895ccf496d1d72eb/omie___logo_branca__conv.png?response-content-type=image%2Fpng&AWSAccessKeyId=AKIA4INFFOTW64RNC5N7&Expires=1782475538&Signature=PiPyvYkni0eGXES7EXUUZZJGY64%3D';

    if (!appKey || !appSecret) {
      return NextResponse.json({ url: OMIE_LOGO_URL, status: 'mock' });
    }

    // Fuzzy logo locator helper in response structure
    const findLogoUrlFuzzy = (obj: any): string | null => {
      if (!obj) return null;
      if (typeof obj === 'string') {
        const lowerStr = obj.toLowerCase();
        if ((obj.startsWith('http://') || obj.startsWith('https://')) && 
            (lowerStr.includes('logo') || lowerStr.includes('brand') || lowerStr.includes('image') || lowerStr.includes('foto') || lowerStr.includes('notafiscal') || lowerStr.includes('omie'))) {
          return obj;
        }
        return null;
      }
      if (typeof obj === 'object') {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const val = obj[key];
            if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
              const kLower = key.toLowerCase();
              if (kLower.includes('logo') || kLower.includes('url') || kLower.includes('image') || kLower.includes('imagem') || kLower.includes('foto')) {
                return val;
              }
            }
            const deepMatch = findLogoUrlFuzzy(val);
            if (deepMatch) return deepMatch;
          }
        }
      }
      return null;
    };

    try {
      // Try calling GetUrlLogo of produtos/notafiscalutil endpoint
      const payloadWithParam = {
        call: 'GetUrlLogo',
        app_key: appKey,
        app_secret: appSecret,
        param: [
          {
            nCodEmpr: 0,
            cCodEmprInt: ''
          }
        ]
      };

      let logoUrlFound = '';
      let rawData: any = null;

      const res = await fetch('https://app.omie.com.br/api/v1/produtos/notafiscalutil/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadWithParam),
        signal: AbortSignal.timeout(3000)
      }).catch(() => null);

      if (res && res.ok) {
        rawData = await res.json().catch(() => ({}));
        logoUrlFound = rawData?.cUrlLogo || findLogoUrlFuzzy(rawData) || '';
      }

      // If it failed or could not parse, try different parameter structures for elasticity
      if (!logoUrlFound) {
        const payloadNoParam = {
          call: 'GetUrlLogo',
          app_key: appKey,
          app_secret: appSecret,
          param: []
        };
        const resAlt = await fetch('https://app.omie.com.br/api/v1/produtos/notafiscalutil/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadNoParam),
          signal: AbortSignal.timeout(3000)
        }).catch(() => null);
        if (resAlt && resAlt.ok) {
          const rawDataAlt = await resAlt.json().catch(() => ({}));
          logoUrlFound = rawDataAlt?.cUrlLogo || findLogoUrlFuzzy(rawDataAlt) || '';
          if (logoUrlFound) {
            rawData = rawDataAlt;
          }
        }
      }

      return NextResponse.json({
        status: logoUrlFound ? 'success' : 'fallback',
        url: logoUrlFound || OMIE_LOGO_URL,
        raw: rawData
      });

    } catch (e: any) {
      console.warn('[Omie GetUrlLogo Fallback]:', e.message);
      return NextResponse.json({ status: 'fallback', url: OMIE_LOGO_URL });
    }
  }

  if (action === 'sync-orders') {
    const rawAppKey = process.env.OMIE_APP_KEY || '';
    const rawAppSecret = process.env.OMIE_APP_SECRET || '';
    const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
    const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');
    const vendedorEmail = req.nextUrl.searchParams.get('vendedor') || '';

    if (!appKey || !appSecret) {
      return NextResponse.json({ status: 'success', mode: 'mock', orders: [] });
    }

    try {
      let resolvedVendedorCodigo: number | undefined = undefined;
      const normalizeEmail = (e: string) => {
        if (!e) return '';
        return e.toLowerCase().trim()
          .replace('disitribuicao.com.br', 'distribuicao.com.br')
          .replace('b2brdisitribuicao', 'b2brdistribuicao');
      };

      const sellersPayload = {
        call: 'ListarVendedores',
        app_key: appKey,
        app_secret: appSecret,
        param: [{ pagina: 1, registros_por_pagina: 100 }]
      };

      const sellersRes = await fetch('https://app.omie.com.br/api/v1/geral/vendedores/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellersPayload)
      });

      if (sellersRes.ok) {
        const sellersData = await sellersRes.json();
        const sellersList = sellersData.vendedoresCadastro || sellersData.cadastro || sellersData.vendedores || [];
        if (Array.isArray(sellersList)) {
          const activeSellers = sellersList.map((item: any) => ({
            codigo_vendedor: Number(item.codigo || item.codigo_vendedor || item.cod_vendedor || 0),
            email: normalizeEmail(item.email || ''),
            inativo: item.inativo === 'S'
          })).filter((s) => s.codigo_vendedor > 0 && !s.inativo);

          const normTarget = normalizeEmail(vendedorEmail);
          const matchedByEmail = activeSellers.find(s => {
            if (!s.email) return false;
            return s.email === normTarget || s.email.includes(normTarget) || (normTarget.includes('vendas.tradee') && s.email.includes('tradee'));
          });
          if (matchedByEmail) {
            resolvedVendedorCodigo = matchedByEmail.codigo_vendedor;
          } else if (activeSellers.length > 0) {
            resolvedVendedorCodigo = activeSellers[0].codigo_vendedor;
          }
        }
      }

      if (!resolvedVendedorCodigo) {
        if (normalizeEmail(vendedorEmail).includes('vendas.tradee')) {
          resolvedVendedorCodigo = 2030289099;
        } else {
          resolvedVendedorCodigo = 2045887325; // Default active Omie seller fallback
        }
      }

      const clientMap = new Map<number, any>();
      if (omieMemoryCache && Array.isArray(omieMemoryCache.rawClients)) {
        for (const c of omieMemoryCache.rawClients) {
          const d = c.dados_cadastrais || {};
          const code = c.codigo_cliente_omie || c.codigo_cliente || d.codigo_cliente_omie || d.codigo_cliente;
          if (code) {
            clientMap.set(Number(code), {
              cnpj: c.cnpj_cpf || d.cnpj_cpf || '',
              name: String(c.nome_fantasia || d.nome_fantasia || c.razao_social || d.razao_social || 'Cliente ERP').trim(),
              city: c.cidade_descricao || d.cidade_descricao || c.cidade || d.cidade || ''
            });
          }
        }
      } else {
        try {
          const resClients = await fetch('https://app.omie.com.br/api/v1/geral/clientes/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              call: 'ListarClientes',
              app_key: appKey,
              app_secret: appSecret,
              param: [{ pagina: 1, registros_por_pagina: 100 }]
            })
          });
          if (resClients.ok) {
            const dClients = await resClients.json();
            const list = dClients.clientes_cadastro || [];
            for (const c of list) {
              const d = c.dados_cadastrais || {};
              const code = c.codigo_cliente_omie || c.codigo_cliente || d.codigo_cliente_omie || d.codigo_cliente;
              if (code) {
                clientMap.set(Number(code), {
                  cnpj: c.cnpj_cpf || d.cnpj_cpf || '',
                  name: String(c.nome_fantasia || d.nome_fantasia || c.razao_social || d.razao_social || 'Cliente ERP').trim(),
                  city: c.cidade_descricao || d.cidade_descricao || c.cidade || d.cidade || ''
                });
              }
            }
          }
        } catch (err) {
          console.error('[Sync Orders] Fallback clients list error:', err);
        }
      }

      const dDe = new Date();
      dDe.setMonth(dDe.getMonth() - 6);
      const dateDeStr = `${String(dDe.getDate()).padStart(2, '0')}/${String(dDe.getMonth() + 1).padStart(2, '0')}/${dDe.getFullYear()}`;
      
      const dAte = new Date();
      dAte.setDate(dAte.getDate() + 1);
      const dateAteStr = `${String(dAte.getDate()).padStart(2, '0')}/${String(dAte.getMonth() + 1).padStart(2, '0')}/${dAte.getFullYear()}`;

      let allOmieOrders: any[] = [];
      let currentPage = 1;
      let totalPages = 1;
      const startTime = Date.now();

      do {
        if (Date.now() - startTime > 20000) {
          console.warn('[Sync Orders] Stopping pagination early to prevent timeout.');
          break;
        }

        const ordersPayload = {
          call: 'ListarPedidos',
          app_key: appKey,
          app_secret: appSecret,
          param: [
            {
              pagina: currentPage,
              registros_por_pagina: 100,
              filtrar_por_data_de: dateDeStr,
              filtrar_por_data_ate: dateAteStr
            }
          ]
        };

        const resOrders = await fetch('https://app.omie.com.br/api/v1/produtos/pedido/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ordersPayload)
        });

        if (!resOrders.ok) {
          console.error(`[Sync Orders] Error fetching page ${currentPage}: status ${resOrders.status}`);
          break;
        }

        const dataOrders = await resOrders.json();
        if (dataOrders.faultstring) {
          console.error(`[Sync Orders] Fault on page ${currentPage}: ${dataOrders.faultstring}`);
          break;
        }

        const pageList = dataOrders.pedido_venda_produto || [];
        if (pageList.length === 0) {
          break;
        }

        allOmieOrders = allOmieOrders.concat(pageList);
        totalPages = dataOrders.total_de_paginas || 1;
        currentPage++;
      } while (currentPage <= totalPages && currentPage <= 5);

      const filteredMappedOrders = allOmieOrders
        .filter((order: any) => {
          const sellerCodeInOrder = order.informacoes_adicionais?.codVend;
          return sellerCodeInOrder && Number(sellerCodeInOrder) === resolvedVendedorCodigo;
        })
        .map((order: any) => {
          const cab = order.cabecalho || {};
          const info = order.infoCadastro || {};
          const tot = order.total_pedido || {};
          const obs = order.observacoes || {};

          const orderId = `ORD-OMIE-${cab.codigo_pedido || Math.random().toString(36).substring(7)}`;
          const clientCode = Number(cab.codigo_cliente || 0);
          const mappedClient = clientMap.get(clientCode) || {
            cnpj: '00.000.000/0000-00',
            name: 'Cliente Omie ERP',
            city: 'Matriz'
          };

          const isCancelado = info.cancelado === 'S';
          const isFaturado = info.faturado === 'S' || cab.etapa === '70' || cab.etapa === '80';
          const orderStatus = isCancelado ? 'Cancelado' : (isFaturado ? 'Faturado' : 'Ativo');

          const parseOmieDate = (dStr: string, hStr: string) => {
            if (!dStr) return new Date().toISOString();
            const parts = dStr.split('/');
            if (parts.length === 3) {
              const day = parts[0];
              const month = parts[1];
              const year = parts[2];
              const time = hStr || '12:00:00';
              return `${year}-${month}-${day}T${time}.000Z`;
            }
            return new Date().toISOString();
          };

          const parseDeliveryDate = (dStr: string) => {
            if (!dStr) return new Date().toISOString().split('T')[0];
            const parts = dStr.split('/');
            if (parts.length === 3) {
              return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dStr;
          };

          const itemsList = (order.det || []).map((dItem: any) => {
            const p = dItem.produto || {};
            return {
              sku: String(p.codigo_produto || p.codigo_produto_integracao || ''),
              name: String(p.descricao || 'Produto').trim(),
              qty: Number(p.quantidade || 0),
              price: Number(p.valor_unitario || 0)
            };
          });

          return {
            id: orderId,
            vendedor: vendedorEmail,
            clientName: mappedClient.name,
            clientCnpj: mappedClient.cnpj,
            clientCity: mappedClient.city,
            items: itemsList,
            deliveryDate: parseDeliveryDate(cab.data_previsao),
            deliveryInstructions: String(obs.obs_venda || '').trim(),
            cobraDescarga: String(obs.obs_venda || '').toLowerCase().includes('cobra descarga: sim') ? 'Sim' : 'Não',
            dataAgendada: String(obs.obs_venda || '').toLowerCase().includes('data agendada: sim') ? 'Sim' : 'Não',
            paymentTerm: 'Sincronizado via ERP',
            total: Number(tot.valor_total_pedido || tot.valor_mercadorias || 0),
            transmittedAt: parseOmieDate(info.dInc, info.hInc),
            mode: 'live',
            status: orderStatus,
            omieId: String(cab.codigo_pedido || ''),
            orderNumber: String(cab.numero_pedido || '')
          };
        });

      return NextResponse.json({
        status: 'success',
        mode: 'live',
        orders: filteredMappedOrders
      });

    } catch (e: any) {
      console.error('[Sync Orders] Error:', e.message);
      return NextResponse.json({ status: 'error', message: e.message });
    }
  }

  if (action === 'order-status') {
    const rawAppKey = process.env.OMIE_APP_KEY || '';
    const rawAppSecret = process.env.OMIE_APP_SECRET || '';
    const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
    const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');
    const codigo_pedido = Number(req.nextUrl.searchParams.get('codigo_pedido') || 0);
    const numero_pedido = req.nextUrl.searchParams.get('numero_pedido') || '';
    const codigo_pedido_integracao = req.nextUrl.searchParams.get('codigo_pedido_integracao') || '';

    if (!appKey || !appSecret) {
      // Mock mode: generate dynamic status
      const statuses = [
        { code: '10', label: '10 - Em Faturamento' },
        { code: '20', label: '20 - Aprovado Financeiro' },
        { code: '30', label: '30 - Separação de Estoque' },
        { code: '40', label: '40 - Faturado (NF-e Emitida)' },
        { code: '50', label: '50 - Despachado por Transportadora' },
        { code: '60', label: '60 - Entregue com Canhoto' }
      ];
      const orderNumRaw = Number(String(numero_pedido || '0').replace(/\D/g, '')) || 0;
      const index = (orderNumRaw || Math.abs(codigo_pedido || codigo_pedido_integracao.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0))) % statuses.length;
      const chosen = statuses[index];
      const mockNf = chosen.code === '40' ? String(102400 + (orderNumRaw % 10000)) : undefined;

      return NextResponse.json({
        status: 'success',
        mode: 'mock',
        status_pedido: chosen.code === '40' ? 'Faturado' : 'Ativo',
        etapa_pedido: chosen.code,
        descr_etapa: chosen.label,
        numero_nfe: mockNf
      });
    }

    try {
      let statusData: any = null;

      // 1. Try StatusPedido first with valid param (codigo_pedido or codigo_pedido_integracao)
      const statusParamObj: any = {};
      if (codigo_pedido) {
        statusParamObj.codigo_pedido = Number(codigo_pedido);
      } else if (codigo_pedido_integracao) {
        statusParamObj.codigo_pedido_integracao = codigo_pedido_integracao;
      }

      if (statusParamObj.codigo_pedido || statusParamObj.codigo_pedido_integracao) {
        const payload = {
          call: 'StatusPedido',
          app_key: appKey,
          app_secret: appSecret,
          param: [statusParamObj]
        };

        const resStatus = await fetch('https://app.omie.com.br/api/v1/produtos/pedido/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (resStatus.ok) {
          const rawDataStatus = await resStatus.json();
          const d = rawDataStatus?.pedido_status || rawDataStatus;
          if (d && !d.faultstring && (d.etapa || d.etapa_pedido)) {
            statusData = d;
          }
        }
      }

      // 2. If StatusPedido failed or wasn't available, call ConsultarPedido
      if (!statusData) {
        const fallbackPayload = {
          call: 'ConsultarPedido',
          app_key: appKey,
          app_secret: appSecret,
          param: [{
            codigo_pedido: codigo_pedido ? Number(codigo_pedido) : undefined,
            codigo_pedido_integracao: codigo_pedido_integracao || undefined,
            numero_pedido: numero_pedido ? String(numero_pedido) : undefined
          }]
        };

        const res = await fetch('https://app.omie.com.br/api/v1/produtos/pedido/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fallbackPayload)
        });

        if (res.ok) {
          const rawData = await res.json();
          const d = rawData?.pedido_venda_produto || rawData;
          if (d && d.cabecalho) {
            // We got the order details! Now, let's use the real codigo_pedido to get StatusPedido details (especially ListaNfe)
            const realCodigoPedido = d.cabecalho.codigo_pedido;
            if (realCodigoPedido) {
              const secondStatusPayload = {
                call: 'StatusPedido',
                app_key: appKey,
                app_secret: appSecret,
                param: [{ codigo_pedido: Number(realCodigoPedido) }]
              };

              const resSecondStatus = await fetch('https://app.omie.com.br/api/v1/produtos/pedido/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(secondStatusPayload)
              });

              if (resSecondStatus.ok) {
                const rawSecond = await resSecondStatus.json();
                const secondD = rawSecond?.pedido_status || rawSecond;
                if (secondD && !secondD.faultstring && (secondD.etapa || secondD.etapa_pedido)) {
                  statusData = secondD;
                }
              }
            }

            // If we still don't have statusData, we can build a fallback statusData from the ConsultarPedido data
            if (!statusData) {
              statusData = {
                etapa: d.cabecalho.etapa || '',
                cancelada: d.infoCadastro?.cancelado || 'N',
                faturada: d.infoCadastro?.faturado || 'N',
                // fallback nf extraction
                numero_nfe: d.cabecalho?.numero_nfe || d.cabecalho?.numero_nf || d.notaFiscal?.numero_nf || d.notaFiscal?.numero_nfe
              };
            }
          }
        }
      }

      // 3. Process statusData to build the response
      if (statusData) {
        let numero_nfe = '';
        if (statusData.numero_nfe) numero_nfe = String(statusData.numero_nfe);
        else if (statusData.numero_nf) numero_nfe = String(statusData.numero_nf);
        else if (statusData.cabecalho?.numero_nfe) numero_nfe = String(statusData.cabecalho.numero_nfe);
        else if (statusData.cabecalho?.numero_nf) numero_nfe = String(statusData.cabecalho.numero_nf);
        else if (statusData.notaFiscal?.numero_nf) numero_nfe = String(statusData.notaFiscal.numero_nf);
        else if (Array.isArray(statusData.ListaNfe) && statusData.ListaNfe.length > 0 && statusData.ListaNfe[0]?.numero_nfe) numero_nfe = String(statusData.ListaNfe[0].numero_nfe);
        else if (Array.isArray(statusData.lista_nfe) && statusData.lista_nfe.length > 0 && statusData.lista_nfe[0]?.numero_nfe) numero_nfe = String(statusData.lista_nfe[0].numero_nfe);

        const etapa = statusData.etapa_pedido || statusData.etapa || '';
        const isCancelado = statusData.cancelada === 'S' || statusData.status_pedido?.toLowerCase() === 'cancelado' || statusData.descr_etapa?.toLowerCase().includes('cancelado');
        const isFaturado = statusData.faturada === 'S' || etapa === '40';
        const status_pedido = isCancelado ? 'Cancelado' : (isFaturado ? 'Faturado' : 'Ativo');

        let descr = 'Ativo';
        if (etapa === '10' || etapa === '20' || etapa === '30') descr = 'Aguardando faturamento';
        else if (etapa === '40') descr = 'Faturado';
        else if (etapa === '50' || etapa === '60') descr = 'Entregue';

        if (isCancelado) {
          descr = 'Pedido Cancelado';
        }

        return NextResponse.json({
          status: 'success',
          mode: 'live',
          status_pedido,
          etapa_pedido: etapa,
          descr_etapa: descr,
          numero_nfe: numero_nfe || undefined
        });
      }
    } catch (e: any) {
      console.error('Error in fetching Omie order status:', e.message);
    }

    return NextResponse.json({
      status: 'error',
      message: 'Não foi possível consultar os detalhes do pedido no Omie no momento.'
    });
  }

  const omitRealValue = req.nextUrl.searchParams.get('mock') === 'true';
  
  const rawAppKey = process.env.OMIE_APP_KEY || '';
  const rawAppSecret = process.env.OMIE_APP_SECRET || '';

  // Standardize the keys: trim spaces and strip any wrapper quotes like "key" or 'key'
  const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
  const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');

  const isConfigured = !!(appKey && appSecret) && !omitRealValue;

  if (isConfigured) {
    const forceRefresh = req.nextUrl.searchParams.get('refresh') === 'true' || req.nextUrl.searchParams.get('clearCache') === 'true';
    if (forceRefresh) {
      console.log('[Omie Cache] Force refresh requested - invalidating memory and scenario caches');
      omieMemoryCache = null;
      cachedContaCorrenteId = null;
      cachedCategoryCode = null;
      cachedPaymentTerms = null;
      cachedCenariosImpostos = null;
    } else if (omieMemoryCache && (Date.now() - omieMemoryCache.timestamp < CACHE_TTL_MS) && omieMemoryCache.appKey === appKey && omieMemoryCache.appSecret === appSecret) {
      console.log('Returning cached Omie ERP data (TTL valid)');
      return NextResponse.json(omieMemoryCache.responsePayload);
    }
  }

  const diagnostics: any = {
    hasKey: !!rawAppKey,
    hasSecret: !!rawAppSecret,
    keyLength: rawAppKey.length,
    secretLength: rawAppSecret.length,
    cleanKeyLength: appKey.length,
    cleanSecretLength: appSecret.length,
    keyPrefix: appKey ? `${appKey.substring(0, 3)}...` : '',
    secretPrefix: appSecret ? `${appSecret.substring(0, 3)}...` : '',
    clientsAPICall: 'ListarClientes',
    clientsFetchOk: false,
    clientsStatus: 0,
    clientsError: '',
    clientsCount: 0,
    productsAPICall: 'ListarProdutos',
    productsFetchOk: false,
    productsStatus: 0,
    productsError: '',
    productsCount: 0,
    usingSandboxFallback: !isConfigured,
    connectionError: ''
  };

  if (!isConfigured) {
    const filteredSeededClients = SEEDED_CLIENTS.filter((c: any) => {
      const itemTags = c.tags;
      if (Array.isArray(itemTags)) {
        return itemTags.some((t: any) => {
          if (typeof t === 'string') return t.toLowerCase().trim() === 'cliente';
          if (t && typeof t === 'object' && t.tag) return String(t.tag).toLowerCase().trim() === 'cliente';
          return false;
        });
      }
      return false;
    });

    return NextResponse.json({
      status: 'success',
      mode: 'mock',
      integration: {
        gateway: 'Locaweb Go',
        connected: false,
        note: 'Utilizando dados simulados B2BR. Insira OMIE_APP_KEY e OMIE_APP_SECRET no painel de Configurações do AI Studio para ativar.'
      },
      clients: filteredSeededClients,
      products: SEEDED_PRODUCTS,
      paymentTerms: [
        "Boleto - 30 Dias Líquidos",
        "Boleto - 15 Dias Líquidos",
        "Pagamento na Entrega (DDA)",
        "Sinal de Entrada 50% / 50% na Saída"
      ],
      diagnostics
    });
  }

  const defaultFilteredClients = SEEDED_CLIENTS.filter((c: any) => {
    const itemTags = c.tags;
    if (Array.isArray(itemTags)) {
      return itemTags.some((t: any) => {
        if (typeof t === 'string') return t.toLowerCase().trim() === 'cliente';
        if (t && typeof t === 'object' && t.tag) return String(t.tag).toLowerCase().trim() === 'cliente';
        return false;
      });
    }
    return false;
  });

  let clients = defaultFilteredClients;
  let rawClientsCollected: any[] = [];
  let products = SEEDED_PRODUCTS;
  let connectionError = '';
  const logMsg = 'Omie ERP API conectado com sucesso!';

  // Helper function to make resilient Omie JSON-RPC calls with a robust timeout (default 20 seconds)
  async function attemptOmieCall(endpoints: string[], callMethod: string, baseParam: any, timeoutMs = 20000) {
    let lastError = '';
    
    // De-duplicate endpoints
    const uniqueEndpoints = Array.from(new Set(endpoints));
    // Single clean parameters argument
    const param = { ...baseParam };

    for (const endpoint of uniqueEndpoints) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(new Error(`Parent request timed out after ${timeoutMs}ms`)), timeoutMs); // Guard rails to prevent API-level hanging
      
      try {
        const payload = {
          call: callMethod,
          app_key: appKey,
          app_secret: appSecret,
          param: [param]
        };

        const res = await fetchOmieWithRetry(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        }, 2, 300, Math.min(timeoutMs - 2000, 15000));

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && data.faultstring) {
            lastError = `Fault on ${endpoint}: ${data.faultstring}`;
          } else {
            return {
              ok: true,
              status: res.status,
              data,
              endpoint,
              paramUsed: param
            };
          }
        } else {
          const text = await res.text().catch(() => 'No response body');
          lastError = `HTTP ${res.status} on ${endpoint}: ${text}`;
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = `Exception on ${endpoint}: ${err.message}`;
      }
    }

    return {
      ok: false,
      error: lastError
    };
  }

  // 1. Fetch Clientes, Produtos and Formas in Parallel to avoid browser network timeout
  const clientEndpoints = [
    'https://app.omie.com.br/api/v1/geral/clientes/'
  ];
  const productEndpoints = [
    'https://app.omie.com.br/api/v1/geral/produtos/'
  ];
  const formasEndpoints = [
    'https://app.omie.com.br/api/v1/produtos/formaspagvendas/',
    'https://app.omie.com.br/api/v1/vendas/formaspag/',
    'https://app.omie.com.br/api/v1/produtos/formaspag/',
    'https://app.omie.com.br/api/v1/geral/formas/'
  ];

  let [initialClientsResult, initialProductsResult, initialFormasResult] = await Promise.all([
    attemptOmieCall(clientEndpoints, 'ListarClientes', {
      pagina: 1,
      registros_por_pagina: 100
    }),
    attemptOmieCall(productEndpoints, 'ListarProdutos', {
      pagina: 1,
      registros_por_pagina: 100,
      exibir_caracteristicas: 'S',
      filtrar_apenas_omiepdv: 'N'
    }),
    attemptOmieCall(formasEndpoints, 'ListarFormasPagVendas', {
      pagina: 1,
      registros_por_pagina: 100
    })
  ]);

  let isClientsResumido = false;
  let clientsResult = initialClientsResult;
  // Fallback to ListarClientesResumido if primary ListarClientes fails
  if (!clientsResult.ok) {
    isClientsResumido = true;
    diagnostics.clientsAPICall = 'ListarClientesResumido';
    clientsResult = await attemptOmieCall(clientEndpoints, 'ListarClientesResumido', {
      pagina: 1,
      registros_por_pagina: 100
    });
  }

  // Mapeamento dos clientes em caso de sucesso (com suporte a paginação completa)
  if (clientsResult.ok && clientsResult.data) {
    let clientsList = clientsResult.data.clientes_cadastro || clientsResult.data.clientes_cadastro_resumido || [];
    diagnostics.clientsStatus = clientsResult.status || 200;
    diagnostics.clientsFetchOk = true;

    // Buscar paginas remanescentes se total_de_paginas > 1
    const totalClientPages = Number(clientsResult.data.total_de_paginas || 1);
    if (totalClientPages > 1) {
      const methodToCall = isClientsResumido ? 'ListarClientesResumido' : 'ListarClientes';
      const endpointsToUse = clientEndpoints;

      // Buscar até um teto de 100 páginas para garantir que todos os clientes (até 50.000) sejam carregados com segurança
      const maxPagesToFetch = Math.min(totalClientPages, 100); 
      for (let p = 2; p <= maxPagesToFetch; p++) {
        // Guard checking if we are approaching timeout to prevent 504 gateway timeout
        if (Date.now() - routeStartTime > 50000) {
          console.warn('[Omie Client Pagination] Approaching execution timeout, stopping pagination early.');
          break;
        }

        // Pausa de 300ms para respeitar o limite de taxa do Omie de requisições
        await new Promise((resolve) => setTimeout(resolve, 300));
        let pr = await attemptOmieCall(endpointsToUse, methodToCall, {
          pagina: p,
          registros_por_pagina: 100
        });

        // Se falhar no método principal ListarClientes, tenta o fallback com ListarClientesResumido para a página p
        if (!pr.ok && methodToCall === 'ListarClientes') {
          await new Promise((resolve) => setTimeout(resolve, 500));
          pr = await attemptOmieCall(endpointsToUse, 'ListarClientesResumido', {
            pagina: p,
            registros_por_pagina: 100
          });
        }
        if (pr.ok && pr.data) {
          const listOnPage = pr.data.clientes_cadastro || pr.data.clientes_cadastro_resumido || [];
          if (Array.isArray(listOnPage)) {
            clientsList = clientsList.concat(listOnPage);
          }
        } else {
          console.warn(`[Omie Client Pagination] Falha ao carregar pagina ${p}:`, pr.error || 'Erro desconhecido');
        }
      }
    }

    if (clientsList && Array.isArray(clientsList) && clientsList.length > 0) {
      rawClientsCollected = clientsList;
      const decodeHtml = (str: string) => {
        return String(str || '')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
      };

      // Filtrar para trazer somente clientes com a tag "cliente"
      const filteredOmieClients = clientsList.filter((item: any) => {
        const d = item.dados_cadastrais || {};
        const itemTags = item.tags || d.tags;
        if (Array.isArray(itemTags)) {
          return itemTags.some((t: any) => {
            if (typeof t === 'string') return t.toLowerCase().trim() === 'cliente';
            if (t && typeof t === 'object' && t.tag) return String(t.tag).toLowerCase().trim() === 'cliente';
            return false;
          });
        }
        return false;
      });

      diagnostics.clientsCount = filteredOmieClients.length;
      clients = filteredOmieClients.map((item: any) => {
        const d = item.dados_cadastrais || {};
        const clientOmieId = item.codigo_cliente_omie || item.codigo_cliente || item.codigo_cliente_integracao ||
                             d.codigo_cliente_omie || d.codigo_cliente || d.codigo_cliente_integracao;
        
        const cnpj = item.cnpj_cpf || d.cnpj_cpf || '00.000.000/0000-00';
        const name = decodeHtml(item.nome_fantasia || d.nome_fantasia || item.razao_social || d.razao_social || 'Cliente Fornecido pelo ERP');
        const razao_social = decodeHtml(item.razao_social || d.razao_social || item.nome_fantasia || d.nome_fantasia || 'Razão Social não informada');
        const city = item.cidade_descricao || d.cidade_descricao || item.cidade || d.cidade || 'Matriz';
        const b = item.bairro || d.bairro || 'Centro';
        
        return {
          cnpj,
          name,
          razao_social,
          city,
          lastOrder: 'Sincronizado via Omie',
          status: 'IN STOCK',
          description: `Bairro: ${b}. Cód: ${clientOmieId || ''}`,
          codigo_cliente_omie: clientOmieId,
          endereco: item.endereco || d.endereco || '',
          endereco_numero: item.endereco_numero || d.endereco_numero || '',
          complemento: item.complemento || d.complemento || '',
          bairro: b,
          cep: item.cep || d.cep || '',
          estado: item.estado || d.estado || item.uf || d.uf || '',
          email: item.email || d.email || '',
          telefone: item.telefone1_numero ? (item.telefone1_ddd ? `(${item.telefone1_ddd}) ${item.telefone1_numero}` : item.telefone1_numero) : 
                    (d.telefone1_numero ? (d.telefone1_ddd ? `(${d.telefone1_ddd}) ${d.telefone1_numero}` : d.telefone1_numero) : 
                    item.telefone || d.telefone || ''),
          tags: item.tags || d.tags || [{ tag: 'cliente' }]
        };
      });
    } else {
      diagnostics.clientsError = 'Retornou com sucesso, mas a lista de clientes veio vazia.';
    }
  } else {
    diagnostics.clientsError = clientsResult.error || 'Erro desconhecido ao carregar clientes.';
    connectionError = `Clientes: ${diagnostics.clientsError}`;
  }

  // 2. Map and paginate Produtos in case of success
  let productsResult = initialProductsResult;
  if (productsResult.ok && productsResult.data) {
    let productsList = productsResult.data.produto_servico_cadastro || [];
    diagnostics.productsStatus = productsResult.status || 200;
    diagnostics.productsFetchOk = true;

    // Buscar paginas remanescentes se total_de_paginas > 1
    const totalProductPages = Number(productsResult.data.total_de_paginas || 1);
    if (totalProductPages > 1) {
      // Buscar todas as páginas (até um teto de 100 páginas / 50.000 produtos) para garantir que todos os ativos sejam carregados
      const maxPagesToFetch = Math.min(totalProductPages, 100);
      for (let p = 2; p <= maxPagesToFetch; p++) {
        // Guard checking if we are approaching timeout to prevent 504 gateway timeout
        if (Date.now() - routeStartTime > 50000) {
          console.warn('[Omie Product Pagination] Approaching execution timeout, stopping pagination early.');
          break;
        }

        // Pausa de 300ms para respeitar o limite de taxa de requisições concorrentes da API Omie (máx. 4 reqs/sec)
        await new Promise((resolve) => setTimeout(resolve, 300));
        let pr = await attemptOmieCall(productEndpoints, 'ListarProdutos', {
          pagina: p,
          registros_por_pagina: 100,
          exibir_caracteristicas: 'S',
          filtrar_apenas_omiepdv: 'N'
        }, 15000);

        // Fallback resiliente: se der timeout ou erro ao buscar com características na página p, tentar sem exibir_caracteristicas
        if (!pr.ok) {
          console.warn(`[Omie Product Pagination] Tentativa primária na página ${p} falhou (${pr.error}). Tentando fallback simplificado...`);
          await new Promise((resolve) => setTimeout(resolve, 500));
          pr = await attemptOmieCall(productEndpoints, 'ListarProdutos', {
            pagina: p,
            registros_por_pagina: 100,
            filtrar_apenas_omiepdv: 'N'
          }, 15000);
        }

        if (pr.ok && pr.data) {
          const listOnPage = pr.data.produto_servico_cadastro || [];
          if (Array.isArray(listOnPage)) {
            productsList = productsList.concat(listOnPage);
          }
        } else {
          console.warn(`[Omie Product Pagination] Falha ao carregar pagina ${p}:`, pr.error || 'Erro desconhecido');
        }
      }
    }

    if (productsList && Array.isArray(productsList) && productsList.length > 0) {
      diagnostics.productsCount = productsList.length;
      
      // Inject raw structure of the first few products into diagnostics to inspect their characteristics
      diagnostics.rawProductDetails = productsList.slice(0, 10).map((p: any) => ({
        descricao: p.descricao,
        marca: p.marca,
        codigo: p.codigo_produto || p.codigo,
        caracteristicas: p.caracteristicas,
        caracteristicas_produto: p.caracteristicas_produto,
        caractProduto: p.caractProduto,
        recomenda_lead: p.recomenda_lead
      }));

      const seenSkus = new Set<string>();
      products = productsList
        .filter((item: any) => item && item.inativo !== 'S' && item.ativo !== 'N')
        .map((item: any, index: number) => {
        const prodCode = item.codigo_produto || item.codigo;
        const prodIntegrationCode = item.codigo_produto_integracao;
        
        let fabricante = '';

        // Robust extraction of product characteristics (Fabricante) via standard fields and fallback mechanisms
        const caracteristicasList = item.caracteristicas || 
                                    item.caracteristicas_produto || 
                                    item.caracteristicasProduto || 
                                    item.caractProduto || 
                                    item.caracteristica || 
                                    (item.recomenda_lead && item.recomenda_lead.caracteristicas) ||
                                    [];

        const fabricanteObj = Array.isArray(caracteristicasList) ? caracteristicasList.find((c: any) => {
          if (!c) return false;
          const nome = String(c.cNomeCaract || c.cNomeCarac || c.nome || c.campo || c.cNome || c.cnomecaract || '').toLowerCase().trim();
          return nome === 'fabricante' || nome.includes('fabricante');
        }) : null;

        fabricante = fabricanteObj 
          ? (fabricanteObj.cConteudo || fabricanteObj.conteudo || fabricanteObj.valor || fabricanteObj.cConteudoCarac || fabricanteObj.cconteudo) 
          : (item.marca || 'Duelo');

        // Robust parsing of Omie image URL from different possible schema formats
        let rawOmieImage = item.url_imagem || 
          (item.imagens && Array.isArray(item.imagens) && item.imagens[0] && (item.imagens[0].url_imagem || item.imagens[0].url_da_imagem || item.imagens[0].caminho_imagem)) ||
          (item.imagens_produto && Array.isArray(item.imagens_produto) && item.imagens_produto[0] && (item.imagens_produto[0].url_imagem || item.imagens_produto[0].url_da_imagem)) ||
          (item.anexos && Array.isArray(item.anexos) && item.anexos[0] && (item.anexos[0].cUrl || item.anexos[0].url || item.anexos[0].cLink)) ||
          item.caminho_imagem || 
          item.imagem_url || 
          (typeof item.foto === 'string' ? item.foto : '') ||
          '';

        let omieImageUrl = '';
        if (rawOmieImage && typeof rawOmieImage === 'string') {
          let trimmed = rawOmieImage.trim();
          if (trimmed.startsWith('http://')) {
            trimmed = trimmed.replace('http://', 'https://');
          }
          omieImageUrl = trimmed;
        }

        const trimmedIntegration = String(item.codigo_produto_integracao || '').trim();
        const trimmedCodigo = String(item.codigo || '').trim();
        const internalId = String(item.codigo_produto || '').trim();

        // Safe candidate selection excluding common placeholders
        const placeholders = ['sku-erp', 's/c', 's/n', 'n/a', '0', 'undefined', 'null', 'generico', 'geral', 'produto', ''];
        let candidateSku = 'SKU-ERP';

        if (trimmedIntegration && !placeholders.includes(trimmedIntegration.toLowerCase())) {
          candidateSku = trimmedIntegration;
        } else if (trimmedCodigo && !placeholders.includes(trimmedCodigo.toLowerCase())) {
          candidateSku = trimmedCodigo;
        } else if (internalId && !placeholders.includes(internalId.toLowerCase())) {
          candidateSku = internalId;
        }

        // Deduplicate and fallback
        let resolvedSku = candidateSku;
        if (placeholders.includes(candidateSku.toLowerCase()) || seenSkus.has(candidateSku)) {
          let fallback = candidateSku;
          if (placeholders.includes(candidateSku.toLowerCase())) {
            fallback = internalId && !placeholders.includes(internalId.toLowerCase()) ? internalId : 'SKU-ERP';
          }
          resolvedSku = `${fallback}-${index}`;
        }
        
        let uniqCounter = 1;
        while (seenSkus.has(resolvedSku)) {
          resolvedSku = `${candidateSku}-${index}-${uniqCounter}`;
          uniqCounter++;
        }
        
        seenSkus.add(resolvedSku);

        return {
          sku: resolvedSku,
          name: item.descricao || 'Produto ERP',
          category: item.descricao_familia || item.familia_descricao || 'Geral',
          unitPrice: item.valor_unitario || 19.90,
          description: item.descricao_detalhada || item.descricao || 'Sincronizado automaticamente do ERP Omie.',
          inventory: item.quantidade_estoque !== undefined && item.quantidade_estoque !== null ? item.quantidade_estoque : 100,
          avatar: `https://picsum.photos/seed/${item.codigo_produto || 'default_p'}/100/100`,
          codigo_produto: item.codigo_produto,
          codigo: item.codigo || String(item.codigo_produto || ''),
          ean: item.codigo_barras || item.ean || '',
          marca: item.marca || 'Sem Marca',
          unidade: item.unidade || 'UN',
          url_imagem: omieImageUrl,
          fabricante,
          cfop: item.cfop || '',
          peso_bruto: item.peso_bruto !== undefined && item.peso_bruto !== null ? Number(item.peso_bruto) : 0,
          peso_liq: item.peso_liq !== undefined && item.peso_liq !== null ? Number(item.peso_liq) : 0,
          peso: item.peso_bruto ? Number(item.peso_bruto) : (item.peso_liq ? Number(item.peso_liq) : 0)
        };
      });
    } else {
      diagnostics.productsError = 'Retornou com sucesso, mas a lista de produtos veio vazia.';
    }
  } else {
    diagnostics.productsError = productsResult.error || 'Erro desconhecido ao carregar produtos.';
    const prodErr = `Produtos: ${diagnostics.productsError}`;
    connectionError = connectionError ? `${connectionError} | ${prodErr}` : prodErr;
  }

  // 3. Formas de Pagamento fallback logic
  let paymentTerms = [
    "Boleto - 30 Dias Líquidos",
    "Boleto - 15 Dias Líquidos",
    "Pagamento na Entrega (DDA)",
    "Sinal de Entrada 50% / 50% na Saída"
  ];

  diagnostics.formasAPICall = 'ListarFormasPagVendas';
  diagnostics.formasFetchOk = false;

  let formasResult = initialFormasResult;

  // Fallbacks for payment terms sequentially
  if (!formasResult.ok) {
    diagnostics.formasAPICall = 'ListarFormasPag';
    formasResult = await attemptOmieCall(formasEndpoints, 'ListarFormasPag', {
      pagina: 1,
      registros_por_pagina: 100,
      apenas_receitas: 'S'
    });
  }

  if (!formasResult.ok) {
    diagnostics.formasAPICall = 'ListarFormasPagCompras';
    formasResult = await attemptOmieCall(formasEndpoints, 'ListarFormasPagCompras', {
      pagina: 1,
      registros_por_pagina: 100
    });
  }

  if (formasResult.ok && formasResult.data) {
    diagnostics.formasFetchOk = true;
    const formasList = formasResult.data.cadastros ||
                       formasResult.data.forma_pagamento_cadastro || 
                       formasResult.data.formas_pagamento || 
                       formasResult.data.forma_pagamento || 
                       formasResult.data.registros || 
                       [];
    if (Array.isArray(formasList) && formasList.length > 0) {
      cachedPaymentTerms = formasList
        .map((f: any) => {
          const code = String(f.cCodigo || f.codigo || f.codigo_parcela || f.codigo_forma_pagamento || '').trim();
          const desc = String(f.cDescricao || f.descricao || f.nome || f.ds_forma_pagamento || '').trim();
          return { code, description: desc };
        })
        .filter((item) => item.code && item.description);

      const mapped = cachedPaymentTerms.map(item => item.description);
      if (mapped.length > 0) {
        paymentTerms = mapped;
      }
    }
  } else {
    diagnostics.formasError = formasResult.error || 'Erro ao carregar formas de pagamento.';
  }

  // 4. Cenários de Impostos do Omie ERP
  let cenariosImpostos: { codigo: number; descricao: string; padrao?: boolean }[] = [];
  if (isConfigured) {
    try {
      const forceRefresh = req.nextUrl.searchParams.get('refresh') === 'true' || req.nextUrl.searchParams.get('clearCache') === 'true';
      cenariosImpostos = await fetchOmieCenariosImpostos(appKey, appSecret, forceRefresh);
    } catch (e: any) {
      console.warn('[Omie Cenários] Error loading tax scenarios during main GET:', e.message);
    }
  }

  // Final validation, response formulation and caching
  const hasValidExchange = (diagnostics.clientsFetchOk && diagnostics.clientsCount > 0) || 
                           (diagnostics.productsFetchOk && diagnostics.productsCount > 0);
  const isErroneous = !!connectionError && !hasValidExchange;
  
  diagnostics.connectionError = connectionError;

  if (isErroneous && omieMemoryCache) {
    console.log('GET failed but found cached data. Utilizing cached data due to Omie rate limit / lock.');
    const fallbackPayload = {
      ...omieMemoryCache.responsePayload,
      integration: {
        gateway: 'Locaweb Go Secure Proxy - Resiliente (Cache de Contingência)',
        connected: true,
        note: 'Nota: A API do Omie retornou limite de consumo excedido (MISUSE_API_PROCESS). Exibindo dados em cache estável de contingência.'
      }
    };
    return NextResponse.json(fallbackPayload);
  }

  const finalPayload = {
    status: 'success',
    mode: isErroneous ? 'fallback' : 'live',
    integration: {
      gateway: 'Locaweb Go Secure Proxy - Resiliente',
      connected: !isErroneous,
      note: connectionError || logMsg
    },
    clients: clients.length > 0 ? clients : defaultFilteredClients,
    products: products.length > 0 ? products : SEEDED_PRODUCTS,
    paymentTerms,
    cenariosImpostos: cenariosImpostos.length > 0 ? cenariosImpostos : [
      { codigo: 0, descricao: 'Cenário Fiscal Padrão Omie ERP (Automático)', padrao: true }
    ],
    diagnostics
  };

  if (!isErroneous && hasValidExchange) {
    omieMemoryCache = {
      timestamp: Date.now(),
      appKey,
      appSecret,
      responsePayload: finalPayload,
      rawClients: rawClientsCollected
    };
  }

  return NextResponse.json(finalPayload);
}

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();
    const rawAppKey = process.env.OMIE_APP_KEY || '';
    const rawAppSecret = process.env.OMIE_APP_SECRET || '';
    
    // Standardize keys: trim spaces and strip any wrapper quotes
    const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
    const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');

    const isLive = !!(appKey && appSecret);
    const orderNumber = `ORD-2026-${Math.floor(Math.random() * 90000) + 10000}`;

    const formatDateToOmie = (dateStr: string): string => {
      if (!dateStr) return '';
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
      const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
      }
      return dateStr;
    };

    if (!isLive) {
      // Simulating successful local transaction with descriptive receipt
      const mockOmieOrderNumber = String(Math.floor(Math.random() * 850) + 1200);
      const mockOmieId = Math.floor(Math.random() * 9000000) + 2024000000;
      return NextResponse.json({
        status: 'success',
        mode: 'mock',
        orderNumber: mockOmieOrderNumber,
        omieId: mockOmieId,
        clientOrderNumber: orderNumber,
        transmittedAt: new Date().toISOString(),
        details: {
          clientName: orderData.client?.name || 'Cliente Geral',
          totalAmount: orderData.total || 0,
          itemsCount: orderData.items?.length || 0
        },
        payloadSent: {
          note: 'Payload de simulação montado em conformidade com o formato JSON-RPC do Omie ERP.'
        }
      });
    }

    // Resolving client's database Omie ID resiliently
    const descriptionText = orderData.client?.description || '';
    const codMatch = descriptionText.match(/Cód:\s*(\d+)/i);
    let resolvedClientOmieId = codMatch ? Number(codMatch[1]) : 0;

    if (!resolvedClientOmieId && orderData.client) {
      resolvedClientOmieId = Number(orderData.client.codigo_cliente_omie) || 
                             Number(orderData.client.codigo_cliente) || 
                             Number(orderData.client.codigo_cliente_integracao) || 
                             0;
    }

    const normalizeString = (str: string): string => {
      return String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    };

    const cleanInputCnpj = (val: string) => String(val || '').replace(/\D/g, '');

    const formatInputCnpj = (val: string) => {
      const clean = cleanInputCnpj(val);
      if (clean.length !== 14) return val;
      return `${clean.substring(0, 2)}.${clean.substring(2, 5)}.${clean.substring(5, 8)}/${clean.substring(8, 12)}-${clean.substring(12, 14)}`;
    };

    // Helper function to search client in a raw list of clients with normalization
    const findClientInRawList = (list: any[], cnpj: string, name: string): any => {
      if (!Array.isArray(list) || list.length === 0) return null;
      const inputCnpj = cleanInputCnpj(cnpj);
      const normInputName = normalizeString(name);

      if (inputCnpj) {
        const found = list.find((item: any) => {
          const d = item.dados_cadastrais || {};
          const itemCnpj = cleanInputCnpj(item.cnpj_cpf || d.cnpj_cpf || '');
          return itemCnpj === inputCnpj;
        });
        if (found) return found;
      }

      if (normInputName) {
        const found = list.find((item: any) => {
          const d = item.dados_cadastrais || {};
          const normFName = normalizeString(item.nome_fantasia || d.nome_fantasia || '');
          const normRSocial = normalizeString(item.razao_social || d.razao_social || '');
          return normFName === normInputName || 
                 normRSocial === normInputName || 
                 normFName.includes(normInputName) || 
                 normRSocial.includes(normInputName) ||
                 normInputName.includes(normFName) ||
                 normInputName.includes(normRSocial);
        });
        if (found) return found;
      }
      return null;
    };


    // Robust Real-time Lookup by custom JSON filter
    const performRealtimeClientLookup = async (paramFilter: any, callMethod: string = 'ListarClientes'): Promise<number> => {
      const endpoint = 'https://app.omie.com.br/api/v1/geral/clientes/';
      try {
        const payload = {
          call: callMethod,
          app_key: appKey.trim().replace(/^["']|["']$/g, ''),
          app_secret: appSecret.trim().replace(/^["']|["']$/g, ''),
          param: [{
            pagina: 1,
            registros_por_pagina: 10,
            clientes_cadastro: [paramFilter],
            ...((callMethod === 'ListarClientesResumido') ? { clientes_cadastro_resumido: [paramFilter] } : {})
          }]
        };
        const res = await fetchOmieWithRetry(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.clientes_cadastro || data.clientes_cadastro_resumido || [];
          if (list.length > 0) {
            const item = list[0];
            const d = item.dados_cadastrais || {};
            const matchedId = Number(
              item.codigo_cliente_omie || 
              d.codigo_cliente_omie || 
              item.codigo_cliente || 
              d.codigo_cliente || 
              item.codigo_cliente_integracao || 
              d.codigo_cliente_integracao || 
              0
            );
            if (matchedId) {
              console.log(`[Omie Client Search] Direct API lookup matched via ${callMethod}: ${matchedId}`);
              return matchedId;
            }
          }
        }
      } catch (e: any) {
        console.error(`[Omie Client Search] Direct API lookup error on ${callMethod}:`, e.message);
      }
      return 0;
    };

    // Helper function to search client page-by-page resiliently without causing XML schema issues
    const performSequentialPagesClientLookup = async (cnpjString: string, nameString: string): Promise<number> => {
      const targetCnpj = cleanInputCnpj(cnpjString);
      const normInputName = normalizeString(nameString);
      const endpoints = ['https://app.omie.com.br/api/v1/geral/clientes/'];
      
      console.log(`[Omie Client Search] Beginning sequential page scan for CNPJ: ${cnpjString} / Name: ${nameString}`);

      for (let page = 1; page <= 15; page++) {
        for (const endpoint of endpoints) {
          try {
            // First try ListarClientes
            let payload = {
              call: 'ListarClientes',
              app_key: appKey,
              app_secret: appSecret,
              param: [{
                pagina: page,
                registros_por_pagina: 300
              }]
            };

            let res = await fetchOmieWithRetry(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            let data: any = {};
            if (res.ok) {
              data = await res.json();
            } else {
              // Try fallback to ListarClientesResumido
              payload.call = 'ListarClientesResumido';
              res = await fetchOmieWithRetry(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              if (res.ok) {
                data = await res.json();
              }
            }

            if (res.ok && data) {
              const list = data.clientes_cadastro || data.clientes_cadastro_resumido || [];
              if (list.length === 0) {
                return 0; // No more clients
              }

              // Search this page's list
              const match = list.find((item: any) => {
                const d = item.dados_cadastrais || {};
                
                // Track CNPJ
                const itemCnpj = cleanInputCnpj(item.cnpj_cpf || d.cnpj_cpf || '');
                if (targetCnpj && itemCnpj === targetCnpj) {
                  return true;
                }

                // Track Names (normalized comparison handles accents perfectly!)
                const normFName = normalizeString(item.nome_fantasia || d.nome_fantasia || '');
                const normRSocial = normalizeString(item.razao_social || d.razao_social || '');
                if (normInputName && (normFName === normInputName || normRSocial === normInputName || normFName.includes(normInputName) || normRSocial.includes(normInputName) || normInputName.includes(normFName) || normInputName.includes(normRSocial))) {
                  return true;
                }

                return false;
              });

              if (match) {
                const d = match.dados_cadastrais || {};
                const matchedId = Number(
                  match.codigo_cliente_omie || 
                  d.codigo_cliente_omie || 
                  match.codigo_cliente || 
                  d.codigo_cliente || 
                  match.codigo_cliente_integracao || 
                  d.codigo_cliente_integracao || 
                  0
                );
                if (matchedId) {
                  console.log(`[Omie Client Search] Matched client in sequential scan on page ${page} with ID ${matchedId}`);
                  return matchedId;
                }
              }

              // If page has less than 500 records, there are no more pages
              if (list.length < 500) {
                return 0;
              }
            }
          } catch (e: any) {
            console.error(`[Omie Client Search] Sequential lookup exception on page ${page}:`, e.message);
          }
        }
        // Wait 150ms before requesting next page to respect rate limit of 4 reqs/sec
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      return 0;
    };

    // Resilient Real-time sequential lookup strategies
    if (!resolvedClientOmieId && orderData.client) {
      const name = orderData.client.name ? String(orderData.client.name).trim() : '';
      const cnpj = orderData.client.cnpj ? String(orderData.client.cnpj).trim() : '';
      const rawCnpj = cleanInputCnpj(cnpj);

      console.log(`[Omie Client Lookup] Starting resilient lookup strategies for "${name}" (CNPJ: ${cnpj})...`);

      // 1. Memory Cache scan with normalization (0 API calls - perform FIRST)
      if (omieMemoryCache && Array.isArray(omieMemoryCache.rawClients)) {
        console.log(`[Omie Client Lookup] Scanning local memory cache...`);
        const cachedItem = findClientInRawList(omieMemoryCache.rawClients, cnpj, name);
        if (cachedItem) {
          const d = cachedItem.dados_cadastrais || {};
          resolvedClientOmieId = Number(
            cachedItem.codigo_cliente_omie || 
            d.codigo_cliente_omie || 
            cachedItem.codigo_cliente || 
            d.codigo_cliente || 
            cachedItem.codigo_cliente_integracao || 
            d.codigo_cliente_integracao || 
            0
          );
        }
      }

      // 2. Direct Realtime Lookup by CNPJ (Only 1 API call - if cache missed)
      if (!resolvedClientOmieId && rawCnpj) {
        console.log(`[Omie Client Lookup] Cache missed. Fetching by CNPJ...`);
        resolvedClientOmieId = await performRealtimeClientLookup({ cnpj_cpf: rawCnpj }, 'ListarClientes');
      }

      // 3. Direct Realtime Lookup by Name (Only 1 API call - if CNPJ lookup missed)
      if (!resolvedClientOmieId && name) {
        console.log(`[Omie Client Lookup] Fetching by Name...`);
        resolvedClientOmieId = await performRealtimeClientLookup({ nome_fantasia: name }, 'ListarClientes');
      }

      // 4. Fallback search by Razao Social (Only 1 API call)
      if (!resolvedClientOmieId && name) {
        resolvedClientOmieId = await performRealtimeClientLookup({ razao_social: name }, 'ListarClientes');
      }

      if (resolvedClientOmieId) {
        console.log(`[Omie Client Lookup] Successful live resolution of customer "${name}". Obtained ID: ${resolvedClientOmieId}`);
      } else {
        console.warn(`[Omie Client Lookup] Failed to find active profile for customer "${name}" (CNPJ: ${cnpj}) on Omie.`);
      }
    }

    const obsCobraDescarga = orderData.cobraDescarga || 'Não';
    const obsDataAgendada = orderData.dataAgendada || 'Não';
    const rawDeliveryInstructions = orderData.deliveryInstructions || '';
    
    const termName = orderData.paymentTerm || 'Boleto - 30 Dias Líquidos';
    const combinedInstructions = [
      `Condição de Pagamento: ${termName}`,
      `Cliente cobra descarga: ${obsCobraDescarga}`,
      `Entrega com data agendada: ${obsDataAgendada}`,
      rawDeliveryInstructions ? `Observações: ${rawDeliveryInstructions}` : ''
    ].filter(Boolean).join(' | ');

    // Map payment terms string to standard Omie installment codes (codigo_parcelas)
    let resolvedCodigoParcela = '000';
    if (!cachedPaymentTerms) {
      console.log('[Omie Payment Solver] Fetching payment forms from Omie to build dynamic map...');
      try {
        const payload = {
          call: 'ListarFormasPagVendas',
          app_key: appKey.trim().replace(/^["']|["']$/g, ''),
          app_secret: appSecret.trim().replace(/^["']|["']$/g, ''),
          param: [{ pagina: 1, registros_por_pagina: 100 }]
        };
        const res = await fetchOmieWithRetry('https://app.omie.com.br/api/v1/produtos/formaspagvendas/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json() as any;
          const list = data.cadastros || data.forma_pagamento_cadastro || data.formas_pagamento || data.forma_pagamento || data.registros || [];
          if (Array.isArray(list) && list.length > 0) {
            cachedPaymentTerms = list
              .map((f: any) => {
                const code = String(f.cCodigo || f.codigo || f.codigo_parcela || f.codigo_forma_pagamento || '').trim();
                const desc = String(f.cDescricao || f.descricao || f.nome || f.ds_forma_pagamento || '').trim();
                return { code, description: desc };
              })
              .filter((item) => item.code && item.description);
            console.log(`[Omie Payment Solver] Successfully cached ${cachedPaymentTerms.length} payment terms.`);
          }
        }
      } catch (e: any) {
        console.error('[Omie Payment Solver] Failed to fetch payment conditions dynamically:', e.message);
      }
    }

    if (cachedPaymentTerms && cachedPaymentTerms.length > 0) {
      // Find matching payment term
      const normalizedTerm = termName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      
      const extractNumbers = (str: string): number[] => {
        const matches = str.match(/\d+/g);
        return matches ? matches.map(Number) : [];
      };

      const termNumbers = extractNumbers(normalizedTerm);

      // Phase 1: Exact string match
      let match = cachedPaymentTerms.find((t) => {
        const normDesc = t.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return normDesc === normalizedTerm;
      });

      // Phase 2: Stricter sequence of numbers matching (e.g. "14/21/28" matches "14/21/28 dias" but NOT "7/14/21/28/35/42")
      if (!match && termNumbers.length > 0) {
        match = cachedPaymentTerms.find((t) => {
          const normDesc = t.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const descNumbers = extractNumbers(normDesc);
          if (descNumbers.length === termNumbers.length) {
            return descNumbers.every((num, idx) => num === termNumbers[idx]);
          }
          return false;
        });
      }

      // Phase 3: Substring matching as fallback
      if (!match) {
        match = cachedPaymentTerms.find((t) => {
          const normDesc = t.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          return normDesc.includes(normalizedTerm) || normalizedTerm.includes(normDesc);
        });
      }

      if (match) {
        resolvedCodigoParcela = match.code;
        console.log(`[Omie Payment Solver] Stricter matched term "${termName}" to code "${resolvedCodigoParcela}" (${match.description})`);
      } else {
        // Broad search: if description starts with/contains numbers, match code ending with or containing it
        const firstNum = termName.match(/\b\d+\b/);
        if (firstNum) {
          const numStr = firstNum[0];
          // Try to see if there's a payment term ending in this number or similar
          const subsetMatch = cachedPaymentTerms.find((t) => {
            const normDesc = t.description.toLowerCase();
            return normDesc.includes(numStr) || t.code.includes(numStr);
          });
          if (subsetMatch) {
            resolvedCodigoParcela = subsetMatch.code;
            console.log(`[Omie Payment Solver] Sub-matched term "${termName}" with number ${numStr} to code "${resolvedCodigoParcela}" (${subsetMatch.description})`);
          } else {
            // Check standard codes in this account
            if (numStr === '30' && cachedPaymentTerms.some(t => t.code === 'T54')) resolvedCodigoParcela = 'T54';
            else if (numStr === '15' && cachedPaymentTerms.some(t => t.code === 'A15')) resolvedCodigoParcela = 'A15';
            else if (numStr === '28' && cachedPaymentTerms.some(t => t.code === 'A28')) resolvedCodigoParcela = 'A28';
            else if (numStr === '14' && cachedPaymentTerms.some(t => t.code === 'L0M')) resolvedCodigoParcela = 'L0M';
            else if (numStr === '42' && cachedPaymentTerms.some(t => t.code === 'J4A')) resolvedCodigoParcela = 'J4A';
          }
        }
      }
    }

    if (resolvedCodigoParcela !== '000' && cachedPaymentTerms) {
      const exists = cachedPaymentTerms.some(t => t.code === resolvedCodigoParcela);
      if (!exists) {
        console.warn(`[Omie Payment Solver] Code "${resolvedCodigoParcela}" was guessed but is not registered in Omie. Reverting to "000".`);
        resolvedCodigoParcela = '000';
      }
    }

    // Resolvendo conta corrente "Omie.CASH" dinamicamente
    let resolvedContaCorrenteId = 2024780826; // Default fallback in case of absolute failure
    if (cachedContaCorrenteId) {
      resolvedContaCorrenteId = cachedContaCorrenteId;
      console.log(`[Omie CC Resolver] Using cached ContaCorrenteId: ${resolvedContaCorrenteId}`);
    } else {
      try {
        const contaPayload = {
          call: 'ListarContasCorrentes',
          app_key: appKey.trim().replace(/^["']|["']$/g, ''),
          app_secret: appSecret.trim().replace(/^["']|["']$/g, ''),
          param: [{ pagina: 1, registros_por_pagina: 100 }]
        };
        const contaRes = await fetchOmieWithRetry('https://app.omie.com.br/api/v1/geral/contacorrente/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contaPayload)
        });
        if (contaRes.ok) {
          const contaData = await contaRes.json();
          const contas = contaData.ListarContasCorrentes || contaData.registros || [];
          const matchCASH = contas.find((acc: any) => acc && String(acc.descricao || '').trim().toLowerCase().includes('cash'));
          const matchBanco = contas.find((acc: any) => acc && !String(acc.descricao || '').toLowerCase().includes('caixa'));
          const anyAccount = contas[0];
          
          const selectedCC = matchCASH || matchBanco || anyAccount;
          if (selectedCC) {
            resolvedContaCorrenteId = Number(selectedCC.nCodCC || selectedCC.codigo_conta_corrente || resolvedContaCorrenteId);
            cachedContaCorrenteId = resolvedContaCorrenteId;
            console.log(`[Omie CC Resolver] Resolved and cached ContaCorrenteId: ${resolvedContaCorrenteId}`);
          }
        }
      } catch (e) {
        console.error('Erro ao resolver conta Omie.CASH dinamicamente:', e);
      }
    }

    // Resolvendo categoria de receita/venda dinamicamente
    let resolvedCategoryCode = "1.01.03"; // Default fallback
    if (cachedCategoryCode) {
      resolvedCategoryCode = cachedCategoryCode;
      console.log(`[Omie Category Resolver] Using cached category: ${resolvedCategoryCode}`);
    } else {
      try {
        const catPayload = {
          call: 'ListarCategorias',
          app_key: appKey.trim().replace(/^["']|["']$/g, ''),
          app_secret: appSecret.trim().replace(/^["']|["']$/g, ''),
          param: [{ pagina: 1, registros_por_pagina: 100 }]
        };
        const catRes = await fetchOmieWithRetry('https://app.omie.com.br/api/v1/geral/categorias/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catPayload)
        });
        if (catRes.ok) {
          const catData = await catRes.json();
          const cats = catData.categoria_cadastro || catData.ListarCategorias || catData.registros || [];
          // Filtrar apenas categorias de receitas que estejam ativas (conta_inativa !== 'S') e que não sejam apenas totalizadoras (totalizadora !== 'S')
          const activeCats = cats.filter((c: any) => c && c.conta_inativa !== 'S' && c.totalizadora !== 'S');
          
          // Em Omie, categorias de Receita (Vendas) começam habitualmente com o dígito "1" (plano de contas padrão: 1 = Receitas, 2 = Despesas)
          // Buscamos prioritariamente algo ativo que contenha "venda" ou "mercadoria" ou comece com "1."
          const matchVenda = activeCats.find((c: any) => c && String(c.descricao || '').toLowerCase().includes('venda') && String(c.codigo || '').startsWith('1'));
          const matchReceita = activeCats.find((c: any) => c && String(c.codigo || '').startsWith('1'));
          const anyCat = activeCats[0] || cats[0];
          
          const selectedCat = matchVenda || matchReceita || anyCat;
          if (selectedCat) {
            resolvedCategoryCode = String(selectedCat.codigo || resolvedCategoryCode);
            cachedCategoryCode = resolvedCategoryCode;
            console.log(`[Omie Category Resolver] Resolved and cached active category for faturamento: "${selectedCat.descricao}" (${resolvedCategoryCode})`);
          }
        }
      } catch (e) {
        console.error('Erro ao resolver categoria de vendas dinamicamente:', e);
      }
    }

    if (!resolvedClientOmieId) {
      throw new Error(`Não foi possível mapear o ID interno do Cliente selecionado no seu Omie. Por favor, certifique-se de que o cliente ${orderData.client?.name || ''} possui o cadastro válido e ativo no painel Omie.`);
    }

    // Resolving salesperson (vendedor_codigo) dynamically to prevent invalid code failures
    let resolvedVendedorCodigo: number | undefined = orderData.vendedor_codigo ? Number(orderData.vendedor_codigo) : undefined;
    
    // Check if the current code is a mock/dummy code (i.e. not configured in the actual Omie ERP system)
    const isMockSellerCode = resolvedVendedorCodigo && [998812, 998813, 998814].includes(resolvedVendedorCodigo);
    
    const normalizeEmail = (e: string) => {
      if (!e) return '';
      return e.toLowerCase().trim()
        .replace('disitribuicao.com.br', 'distribuicao.com.br')
        .replace('b2brdisitribuicao', 'b2brdistribuicao');
    };

    try {
      console.log(`[Omie Seller Resolver] Resolving salesperson for email: "${orderData.vendedor}" and code: ${resolvedVendedorCodigo}`);
      const sellersPayload = {
        call: 'ListarVendedores',
        app_key: appKey.trim().replace(/^["']|["']$/g, ''),
        app_secret: appSecret.trim().replace(/^["']|["']$/g, ''),
        param: [{ pagina: 1, registros_por_pagina: 100 }]
      };
      const sellersRes = await fetchOmieWithRetry('https://app.omie.com.br/api/v1/geral/vendedores/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellersPayload)
      });
      
      if (sellersRes.ok) {
        const sellersData = await sellersRes.json();
        const sellersList = sellersData.vendedoresCadastro || sellersData.cadastro || sellersData.vendedores || [];
        if (Array.isArray(sellersList) && sellersList.length > 0) {
          const activeSellers = sellersList.map((item: any) => ({
            codigo_vendedor: Number(item.codigo || item.codigo_vendedor || item.cod_vendedor || 0),
            nome: String(item.nome || item.colaborador || item.nome_vendedor || 'Vendedor Omie').trim(),
            email: normalizeEmail(item.email),
            inativo: item.inativo === 'S'
          })).filter((s) => s.codigo_vendedor > 0 && !s.inativo);

          if (activeSellers.length > 0) {
            // Strategy 1: Match by email (case-insensitive and normalized)
            const matchedByEmail = activeSellers.find(s => s.email && s.email === normalizeEmail(orderData.vendedor || ''));
            if (matchedByEmail) {
              resolvedVendedorCodigo = matchedByEmail.codigo_vendedor;
              console.log(`[Omie Seller Resolver] Found exact seller match in Omie ERP for email "${orderData.vendedor}": Code ${resolvedVendedorCodigo}`);
            } else if (isMockSellerCode || !activeSellers.some(s => s.codigo_vendedor === resolvedVendedorCodigo)) {
              // Strategy 2: If the current code is mock or wasn't found in native Omie sellers list, fall back to the first available active seller in the ERP
              // Prioritize any seller with @b2brdistribuicao.com.br, or else the first one
              const b2brSeller = activeSellers.find(s => s.email && s.email.endsWith('@b2brdistribuicao.com.br')) || activeSellers[0];
              resolvedVendedorCodigo = b2brSeller.codigo_vendedor;
              console.log(`[Omie Seller Resolver] Seller "${orderData.vendedor}" with code ${orderData.vendedor_codigo} is a mock/unregistered ID. Falling back to active ERP seller "${b2brSeller.nome}" (${b2brSeller.email}): Code ${resolvedVendedorCodigo}`);
            }
          }
        }
      }
    } catch (e) {
      console.error('[Omie Seller Resolver] Error querying sellers list:', e);
    }

    // Resolving Cenário de Impostos / Fiscal Scenario from Omie ERP - Padrão fixo: "Venda"
    let resolvedCenarioImpostos: number | undefined = undefined;
    if (orderData.codigo_cenario_impostos && Number(orderData.codigo_cenario_impostos) > 0) {
      resolvedCenarioImpostos = Number(orderData.codigo_cenario_impostos);
    } else {
      try {
        const availableCenarios = await fetchOmieCenariosImpostos(appKey, appSecret);
        // Prioridade 1: Cenário explicitamente com a descrição "Venda" / "Vendas"
        const vendaCenario = availableCenarios.find(c => c.descricao.trim().toLowerCase() === 'venda') ||
                             availableCenarios.find(c => c.descricao.trim().toLowerCase().startsWith('venda')) ||
                             availableCenarios.find(c => c.descricao.trim().toLowerCase().includes('venda'));
        
        // Prioridade 2: Cenário padrão configurado no ERP
        const defaultCenario = vendaCenario || availableCenarios.find(c => c.padrao) || (availableCenarios.length > 0 ? availableCenarios[0] : null);
        if (defaultCenario) {
          resolvedCenarioImpostos = defaultCenario.codigo;
          console.log(`[Omie Tax Scenario] Cenário padrão "Venda" auto-aplicado no pedido: "${defaultCenario.descricao}" (Código: ${resolvedCenarioImpostos})`);
        }
      } catch (e) {
        console.warn('[Omie Tax Scenario] Erro ao resolver cenário padrão "Venda":', e);
      }
    }

    // Creating a real Omie Sales Order via JSON-RPC
    const omiePayload = {
      call: 'IncluirPedido',
      app_key: appKey.trim().replace(/^["']|["']$/g, ''),
      app_secret: appSecret.trim().replace(/^["']|["']$/g, ''),
      param: [
        {
          cabecalho: {
            codigo_cliente: resolvedClientOmieId,
            data_previsao: formatDateToOmie(orderData.deliveryDate) || formatDateToOmie(new Date().toISOString().split('T')[0]),
            etapa: '10', // Primeiros passos / Novo pedido
            codigo_parcela: resolvedCodigoParcela,
            codigo_pedido_integracao: orderNumber,
            numero_pedido: orderNumber,
            quantidade_itens: orderData.items.length,
            ...(resolvedCenarioImpostos ? { codigo_cenario_impostos: resolvedCenarioImpostos } : {})
          },
          det: orderData.items.map((item: any, idx: number) => {
            const rawCode = item.codigo_produto || item.codigo || item.sku;
            const isNumeric = typeof rawCode === 'number' || (typeof rawCode === 'string' && !isNaN(Number(rawCode)) && String(rawCode).trim() !== '');
            const resolvedCode = isNumeric ? Number(rawCode) : rawCode;

            // Omie expects unit weights in inf_adic.peso_bruto and inf_adic.peso_liquido.
            // Omie ERP automatically multiplies the unit weight by det.produto.quantidade on order creation.
            const unitGrossWeight = item.peso_bruto !== undefined && item.peso_bruto !== null && !isNaN(Number(item.peso_bruto)) && Number(item.peso_bruto) > 0
              ? Number(item.peso_bruto)
              : (item.peso !== undefined && item.peso !== null && !isNaN(Number(item.peso)) ? Number(item.peso) : 0);

            const unitNetWeight = item.peso_liq !== undefined && item.peso_liq !== null && !isNaN(Number(item.peso_liq)) && Number(item.peso_liq) > 0
              ? Number(item.peso_liq)
              : (item.peso_liquido !== undefined && item.peso_liquido !== null && !isNaN(Number(item.peso_liquido)) ? Number(item.peso_liquido) : unitGrossWeight);

            // Importante: NÃO forçar CFOP '5.102' fixo.
            // Se o item tiver um CFOP específico e customizado que NÃO seja o default legado '5.102', enviamos.
            // Caso contrário, omitimos o campo 'cfop' no produto, permitindo que o Omie ERP aplique dinamicamente
            // as alíquotas e o CFOP correto (ex: 5.405 ST, 6.102/6.405 interestadual, etc.) do Cenário de Impostos atualizado!
            const customCfop = item.cfop && typeof item.cfop === 'string' && item.cfop.trim() !== '' && item.cfop.trim() !== '5.102' && item.cfop.trim() !== '5102'
              ? item.cfop.trim()
              : undefined;

            return {
              ide: {
                codigo_item_integracao: `ITEM-${idx + 1}`
              },
              inf_adic: {
                peso_bruto: unitGrossWeight,
                peso_liquido: unitNetWeight
              },
              produto: {
                ...(customCfop ? { cfop: customCfop } : {}),
                ...(isNumeric 
                  ? { codigo_produto: resolvedCode } 
                  : { codigo_produto_integracao: String(resolvedCode) }
                ),
                descricao: item.name,
                quantidade: item.qty,
                tipo_desconto: 'V',
                unidade: item.unidade || 'UN',
                valor_desconto: 0,
                valor_unitario: item.price
              }
            };
          }),
          frete: {
            modalidade: orderData.freightModality || "0"
          },
          informacoes_adicionais: {
            codigo_categoria: resolvedCategoryCode,
            codigo_conta_corrente: resolvedContaCorrenteId,
            consumidor_final: "N",
            enviar_email: "N",
            ...(resolvedVendedorCodigo ? { codVend: Number(resolvedVendedorCodigo) } : {}),
            ...(resolvedCenarioImpostos ? { codigo_cenario_impostos: resolvedCenarioImpostos } : {})
          },
          observacoes: {
            obs_venda: combinedInstructions || 'Entrega padrão via B2BR Order Collector'
          }
        }
      ]
    };

    // The single valid endpoint for Omie Sales Orders
    const targetEndpoint = 'https://app.omie.com.br/api/v1/produtos/pedido/';

    let lastPostError = '';
    let responseData: any = null;
    let postOk = false;

    try {
      const omieRes = await fetchOmieWithRetry(targetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(omiePayload)
      });

      if (omieRes.ok) {
        const resData = await omieRes.json();
        if (resData && resData.faultstring) {
          lastPostError = `${resData.faultstring} (Error ${resData.faultcode || 'JSON-RPC Fault'})`;
        } else {
          responseData = resData;
          postOk = true;
        }
      } else {
        // High-fidelity extraction of validation messages from Omie HTTP errors
        let errorDetails = '';
        try {
          const errorJson = await omieRes.clone().json();
          if (errorJson && errorJson.faultstring) {
            errorDetails = `${errorJson.faultstring} (Código: ${errorJson.faultcode || 'N/A'})`;
          } else {
            errorDetails = JSON.stringify(errorJson);
          }
        } catch {
          errorDetails = await omieRes.text().catch(() => 'Erro indefinido de status HTTP');
        }
        lastPostError = `HTTP ${omieRes.status} em ${targetEndpoint}: ${errorDetails}`;
      }
    } catch (err: any) {
      lastPostError = `Exceção de conexão em rede: ${err.message}`;
    }

    if (postOk && responseData) {
      return NextResponse.json({
        status: 'success',
        mode: 'live',
        orderNumber: String(responseData.numero_pedido || orderNumber),
        omieId: responseData.codigo_pedido || 'OMIE-ID-PENDENTE',
        clientOrderNumber: orderNumber,
        transmittedAt: new Date().toISOString(),
        cenarioImpostos: resolvedCenarioImpostos,
        details: {
          clientName: orderData.client?.name || 'Cliente Sincronizado',
          totalAmount: orderData.total || 0,
          itemsCount: orderData.items?.length || 0
        }
      });
    } else {
      throw new Error(`Detecção de inconsistência na integração Omie: ${lastPostError}`);
    }

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      note: 'Exception encountered while submitting to Omie.',
      message: error.message,
      fallbackNumber: `ORD-FALLBACK-${Math.floor(Math.random() * 9000) + 1000}`
    }, { status: 500 });
  }
}
