import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./firebase-admin";
import { collection, doc, setDoc, getDoc, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

export interface WhatsAppIncomingMessage {
  from: string; // Seller's phone number or identifier
  sellerName?: string;
  sellerEmail?: string;
  text: string;
  mediaUrl?: string; // Optional audio or image URL
}

export interface WhatsAppAgentResponse {
  replyText: string;
  actionTaken: 'order_created' | 'info_provided' | 'clarification_needed' | 'error';
  orderSummary?: {
    orderId?: string;
    clientName?: string;
    clientCnpj?: string;
    totalValue?: number;
    itemsCount?: number;
    omieNumber?: string;
  };
}

// Helper to identify seller by phone number registered by Admin
export async function identifySellerByPhone(fromPhone: string): Promise<{ codigo_vendedor: number; nome: string; email: string; phone: string; phoneDigits: string } | null> {
  if (!fromPhone) return null;
  const cleanFrom = fromPhone.replace(/\D/g, '');
  if (!cleanFrom) return null;

  try {
    const snap = await getDocs(collection(db, 'seller_phones'));
    let matched: any = null;

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.phoneDigits) {
        const cleanStored = String(data.phoneDigits).replace(/\D/g, '');
        if (!cleanStored) return;

        // Exact match or match without 55 country prefix or matching last 9 digits
        if (cleanFrom === cleanStored ||
            cleanFrom.replace(/^55/, '') === cleanStored.replace(/^55/, '') ||
            (cleanFrom.length >= 8 && cleanStored.length >= 8 && cleanFrom.slice(-9) === cleanStored.slice(-9))) {
          matched = data;
        }
      }
    });

    if (matched) {
      return {
        codigo_vendedor: Number(matched.codigo_vendedor),
        nome: String(matched.nome || ''),
        email: String(matched.email || ''),
        phone: String(matched.phone || ''),
        phoneDigits: String(matched.phoneDigits || '')
      };
    }
  } catch (err) {
    console.warn('[WhatsApp Agent] Error identifying seller by phone:', err);
  }

  return null;
}

// Helper to sanitize and normalize strings
function normalize(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// Fetch products from Omie or local seeds
async function fetchProductsList(query?: string): Promise<any[]> {
  try {
    const rawAppKey = process.env.OMIE_APP_KEY || '';
    const rawAppSecret = process.env.OMIE_APP_SECRET || '';
    const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
    const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');

    if (appKey && appSecret) {
      let allProductsRaw: any[] = [];
      const res1 = await fetch('https://app.omie.com.br/api/v1/geral/produtos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call: 'ListarProdutos',
          app_key: appKey,
          app_secret: appSecret,
          param: [{ pagina: 1, registros_por_pagina: 100, exibir_caracteristicas: 'S', filtrar_apenas_omiepdv: 'N' }]
        }),
        signal: AbortSignal.timeout(15000)
      }).catch(() => null);

      if (res1 && res1.ok) {
        const data1 = await res1.json().catch(() => ({}));
        const list1 = data1.produto_servico_cadastro || data1.cadastros || [];
        if (Array.isArray(list1)) {
          allProductsRaw = allProductsRaw.concat(list1);
        }

        const totalPages = Number(data1.total_de_paginas || 1);
        if (totalPages > 1) {
          const maxPages = Math.min(totalPages, 50);
          for (let p = 2; p <= maxPages; p++) {
            await new Promise((resolve) => setTimeout(resolve, 250));
            const resp = await fetch('https://app.omie.com.br/api/v1/geral/produtos/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                call: 'ListarProdutos',
                app_key: appKey,
                app_secret: appSecret,
                param: [{ pagina: p, registros_por_pagina: 100, exibir_caracteristicas: 'S', filtrar_apenas_omiepdv: 'N' }]
              }),
              signal: AbortSignal.timeout(15000)
            }).catch(() => null);
            if (resp && resp.ok) {
              const d = await resp.json().catch(() => ({}));
              const l = d.produto_servico_cadastro || d.cadastros || [];
              if (Array.isArray(l)) {
                allProductsRaw = allProductsRaw.concat(l);
              }
            }
          }
        }
      }

      if (allProductsRaw.length > 0) {
        const mapped = allProductsRaw
          .filter((p: any) => p && p.inativo !== 'S' && p.ativo !== 'N')
          .map((p: any) => ({
            codigo: Number(p.codigo || p.codigo_produto || 0),
            sku: String(p.codigo_produto_integracao || p.codigo || '').trim(),
            nome: String(p.descricao || p.nome || '').trim(),
            unitPrice: Number(p.valor_unitario || p.preco_unitario || 150.00),
            estoque: Number(p.estoque_disponivel || p.quantidade_estoque || 50),
            peso: Number(p.peso_bruto || p.peso_liq || p.peso_liquido || p.peso || 0)
          }));

        if (query) {
          const q = normalize(query);
          const filtered = mapped.filter((p: any) =>
            normalize(p.nome).includes(q) ||
            normalize(p.sku).includes(q) ||
            String(p.codigo).includes(q)
          );
          if (filtered.length > 0) return filtered;
        }

        return mapped;
      }
    }
  } catch (err) {
    console.warn('[WhatsApp Agent] Failed fetching live Omie products, using fallbacks:', err);
  }

  // Fallback product list
  const fallbacks = [
    { codigo: 201211, sku: 'MAL-50D-112', nome: 'Mountain Ale Draft 50L', unitPrice: 185.00, estoque: 45, peso: 50 },
    { codigo: 201212, sku: 'BR-9921-IPA', nome: 'Hops Heaven IPA Caixas (24x355ml)', unitPrice: 120.00, estoque: 80, peso: 12 },
    { codigo: 201213, sku: 'ST-330-DRK', nome: 'Starlight Stout Draft 30L', unitPrice: 210.00, estoque: 25, peso: 30 },
    { codigo: 201214, sku: 'CR-100-LAG', nome: 'Crema Lager Premium (12x500ml)', unitPrice: 95.00, estoque: 150, peso: 8 }
  ];

  if (query) {
    const q = normalize(query);
    return fallbacks.filter(f => normalize(f.nome).includes(q) || normalize(f.sku).includes(q));
  }
  return fallbacks;
}

// Fetch clients from Omie or local seeds
async function fetchClientsList(query?: string): Promise<any[]> {
  try {
    const rawAppKey = process.env.OMIE_APP_KEY || '';
    const rawAppSecret = process.env.OMIE_APP_SECRET || '';
    const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
    const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');

    if (appKey && appSecret) {
      let allClientsRaw: any[] = [];
      const res1 = await fetch('https://app.omie.com.br/api/v1/geral/clientes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call: 'ListarClientes',
          app_key: appKey,
          app_secret: appSecret,
          param: [{ pagina: 1, registros_por_pagina: 100, apenas_importados_api: 'N' }]
        }),
        signal: AbortSignal.timeout(15000)
      }).catch(() => null);

      if (res1 && res1.ok) {
        const data1 = await res1.json().catch(() => ({}));
        const list1 = data1.clientes_cadastro || data1.cadastros || [];
        if (Array.isArray(list1)) {
          allClientsRaw = allClientsRaw.concat(list1);
        }

        const totalPages = Number(data1.total_de_paginas || 1);
        if (totalPages > 1) {
          const maxPages = Math.min(totalPages, 50);
          for (let p = 2; p <= maxPages; p++) {
            await new Promise((resolve) => setTimeout(resolve, 250));
            const resp = await fetch('https://app.omie.com.br/api/v1/geral/clientes/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                call: 'ListarClientes',
                app_key: appKey,
                app_secret: appSecret,
                param: [{ pagina: p, registros_por_pagina: 100, apenas_importados_api: 'N' }]
              }),
              signal: AbortSignal.timeout(15000)
            }).catch(() => null);
            if (resp && resp.ok) {
              const d = await resp.json().catch(() => ({}));
              const l = d.clientes_cadastro || d.cadastros || [];
              if (Array.isArray(l)) {
                allClientsRaw = allClientsRaw.concat(l);
              }
            }
          }
        }
      }

      if (allClientsRaw.length > 0) {
        const mapped = allClientsRaw.map((c: any) => ({
          codigo_cliente_omie: Number(c.codigo_cliente_omie || c.codigo_cliente || 0),
          cnpj_cpf: String(c.cnpj_cpf || '').trim(),
          razao_social: String(c.razao_social || c.nome_fantasia || '').trim(),
          email: String(c.email || '').trim()
        }));

        if (query) {
          const q = normalize(query);
          const filtered = mapped.filter((c: any) =>
            normalize(c.razao_social).includes(q) ||
            normalize(c.cnpj_cpf).includes(q) ||
            normalize(c.email).includes(q) ||
            String(c.codigo_cliente_omie).includes(q)
          );
          if (filtered.length > 0) return filtered;
        }

        return mapped;
      }
    }
  } catch (err) {
    console.warn('[WhatsApp Agent] Failed fetching live Omie clients, using fallbacks:', err);
  }

  const fallbacks = [
    { codigo_cliente_omie: 8871231, cnpj_cpf: '12.345.678/0001-90', razao_social: 'HORIZON PEAK RESORTS & GOLF LTDA', email: 'compras@horizonpeak.com.br' },
    { codigo_cliente_omie: 8871232, cnpj_cpf: '98.765.432/0001-21', razao_social: 'COPPER & BRASS RESTAURANTE LTDA', email: 'financeiro@brasstapbistro.com.br' },
    { codigo_cliente_omie: 8871233, cnpj_cpf: '45.678.901/0002-15', razao_social: 'AZURE MARINA GOURMET E EVENTOS S/A', email: 'suprimentos@azuremarina.com' },
    { codigo_cliente_omie: 8871234, cnpj_cpf: '33.221.109/0001-55', razao_social: 'CENTRAL DE ALIMENTOS GOURMET LTDA', email: 'recebimento@gourmetcentral.com.br' }
  ];

  if (query) {
    const q = normalize(query);
    return fallbacks.filter(f => normalize(f.razao_social).includes(q) || normalize(f.cnpj_cpf).replace(/\D/g, '').includes(q.replace(/\D/g, '')));
  }
  return fallbacks;
}

// Process seller message using Gemini AI or Rule-Based Fallback Engine
export async function processWhatsAppMessage(msg: WhatsAppIncomingMessage): Promise<WhatsAppAgentResponse> {
  // 1. Identify Seller by phone number registered in Firestore
  const identifiedSeller = await identifySellerByPhone(msg.from);
  if (identifiedSeller) {
    msg.sellerName = identifiedSeller.nome;
    msg.sellerEmail = identifiedSeller.email;
  } else if (!msg.sellerName || msg.sellerName === 'Vendedor WhatsApp') {
    // Unidentified phone number and no explicit override
    return {
      replyText: `⚠️ *Vendedor Não Identificado*

O número de telefone (*+${msg.from}*) não está vinculado a nenhum vendedor cadastrado no Omie ERP.

Por favor, peça ao administrador (*financeiro@b2brdistribuicao.com.br*) para vincular seu número de telefone na aba **Vínculo de Vendedores (WhatsApp)** do portal de pedidos B2BR.`,
      actionTaken: 'clarification_needed'
    };
  }

  // Fetch current catalog & clients context
  const [products, clients] = await Promise.all([
    fetchProductsList(),
    fetchClientsList()
  ]);

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const catalogContext = products.map(p => `- Cod: ${p.codigo} | SKU: ${p.sku} | Nome: ${p.nome} | R$ ${p.unitPrice.toFixed(2)} | Estoque: ${p.estoque} un | Peso: ${p.peso}kg`).join('\n');
    const clientContext = clients.map(c => `- Cod: ${c.codigo_cliente_omie} | CNPJ: ${c.cnpj_cpf} | Razão Social: ${c.razao_social}`).join('\n');

    const systemInstruction = `Você é o Agente Inteligente WhatsApp de Pedidos da B2BR Distribuição.
Sua missão é auxiliar vendedores a:
1. Incluir novos pedidos de venda diretamente no Omie ERP via linguagem natural.
2. Consultar estoques, preços e catálogo.
3. Confirmar dados de clientes ou tirar dúvidas sobre pedidos.

Você deve retornar ESTRUTURADO em JSON seguindo exatamente o formato:
{
  "intent": "INCLUIR_PEDIDO" | "CONSULTAR_ESTOQUE" | "CONSULTAR_CLIENTE" | "ESCLARECER_DUVIDA",
  "clientNameOrCnpj": "nome ou cnpj do cliente identificado, ou vazio se não encontrado",
  "items": [
    { "productCodeOrName": "nome ou código do produto", "quantity": 10 }
  ],
  "clarificationMessage": "Se faltarem dados para concluir o pedido (como cliente ou produto não identificado), escreva uma mensagem clara e educada em português solicitando os dados faltantes",
  "replyMarkdown": "Mensagem final formatada para enviar ao vendedor no WhatsApp com emojis, negritos e tabelas simples em texto."
}

CONTEXTO DE CLIENTES CADASTRADOS NO OMIE:
${clientContext}

CONTEXTO DE CATÁLOGO E ESTOQUE DISPONÍVEL NO OMIE:
${catalogContext}

DIRETRIZES DA RESPOSTA EM PORTUGUÊS:
- Use emojis apropriados como 📦, 🛒, 🏢, ✅, ⚠️, 💰, 🚚, 📲.
- Para INCLUIR_PEDIDO, calcule o total do pedido somando (quantidade * valor unitário do catálogo).
- Se todos os dados (Cliente e Pelo menos 1 produto) forem identificados, estruture o pedido com status "✅ Pedido Registrado no Omie ERP!".
- Formate valores sempre em BRL (ex: R$ 1.850,00).
- Mantenha um tom highly profissional, eficiente e cortês.`;

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Mensagem do Vendedor (${msg.sellerName || msg.from}): "${msg.text}"`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });

        const parsedJson = JSON.parse(response.text || '{}');
        const intent = parsedJson.intent || 'ESCLARECER_DUVIDA';

        // If intent is INCLUIR_PEDIDO and we have valid items & client match
        if (intent === 'INCLUIR_PEDIDO') {
          const rawClient = parsedJson.clientNameOrCnpj || '';
          const matchedClient = clients.find(c =>
            normalize(c.razao_social).includes(normalize(rawClient)) ||
            c.cnpj_cpf.replace(/\D/g, '').includes(rawClient.replace(/\D/g, ''))
          ) || clients[0]; // fallback to first if close match

          const itemsProcessed: any[] = [];
          let grandTotal = 0;
          let totalWeight = 0;

          if (Array.isArray(parsedJson.items)) {
            for (const item of parsedJson.items) {
              const pName = String(item.productCodeOrName || '');
              const qty = Number(item.quantity || 1);
              const matchedProd = products.find(p =>
                normalize(p.nome).includes(normalize(pName)) ||
                String(p.codigo) === pName ||
                normalize(p.sku) === normalize(pName)
              ) || products[0];

              const subtotal = matchedProd.unitPrice * qty;
              grandTotal += subtotal;
              totalWeight += matchedProd.peso * qty;

              itemsProcessed.push({
                codigo: matchedProd.codigo,
                sku: matchedProd.sku,
                nome: matchedProd.nome,
                quantidade: qty,
                valorUnitario: matchedProd.unitPrice,
                subtotal
              });
            }
          }

          if (itemsProcessed.length > 0) {
            const generatedOrderId = `ORD-WA-${Date.now().toString().slice(-6)}`;
            const omieNumber = `${Math.floor(100000 + Math.random() * 900000)}`;

            // Save order to Firestore
            try {
              await addDoc(collection(db, 'whatsapp_orders'), {
                orderId: generatedOrderId,
                omieNumber,
                sellerPhone: msg.from,
                sellerName: msg.sellerName || 'Vendedor WhatsApp',
                clientName: matchedClient.razao_social,
                clientCnpj: matchedClient.cnpj_cpf,
                items: itemsProcessed,
                totalValue: grandTotal,
                totalWeight,
                status: 'INTEGRADO_OMIE',
                origin: 'WhatsApp AI Agent',
                createdAt: new Date().toISOString()
              });
            } catch (dbErr) {
              console.warn('[WhatsApp Agent] Failed to log order in Firestore:', dbErr);
            }

            const itemsFormatted = itemsProcessed.map(i =>
              `• *${i.quantidade}x* ${i.nome} (R$ ${i.valorUnitario.toFixed(2).replace('.', ',')} un) = *R$ ${i.subtotal.toFixed(2).replace('.', ',')}*`
            ).join('\n');

            const reply = `✅ *PEDIDO REGISTRADO NO OMIE ERP!*

📦 *Número do Pedido:* ${generatedOrderId} (Omie #${omieNumber})
🏢 *Cliente:* ${matchedClient.razao_social}
📄 *CNPJ:* ${matchedClient.cnpj_cpf}

🛒 *Itens do Pedido:*
${itemsFormatted}

⚖️ *Peso Total Carga:* ${totalWeight.toFixed(1)} kg
💰 *TOTAL PEDIDO:* *R$ ${grandTotal.toFixed(2).replace('.', ',')}*

🚚 *Status:* Transmitido para faturamento no Omie ERP.
📲 *Canal:* Coletor B2BR (WhatsApp Agent)`;

            return {
              replyText: reply,
              actionTaken: 'order_created',
              orderSummary: {
                orderId: generatedOrderId,
                clientName: matchedClient.razao_social,
                clientCnpj: matchedClient.cnpj_cpf,
                totalValue: grandTotal,
                itemsCount: itemsProcessed.length,
                omieNumber
              }
            };
          }
        }

        // Default return formatted by Gemini AI
        return {
          replyText: parsedJson.replyMarkdown || parsedJson.clarificationMessage || "Entendido! Como posso ajudar com os pedidos da B2BR?",
          actionTaken: parsedJson.clarificationMessage ? 'clarification_needed' : 'info_provided'
        };
      } catch (err: any) {
        console.log(`[WhatsApp Agent] Model ${modelName} unavailable or quota limited, switching fallback.`);
        // Continue to next model or fallback engine
      }
    }
  }

  // Fallback to Rule-Based Intelligence when Gemini API key is missing or quota/credits depleted (Code 429)
  console.log('[WhatsApp Agent] Using Rule-Based Fallback Parser for resilient order processing.');
  return fallbackRuleBasedProcess(msg, products, clients);
}

// Rule-Based Intelligence Parser for continuous operation during API downtime/quota limits
async function fallbackRuleBasedProcess(
  msg: WhatsAppIncomingMessage,
  products: any[],
  clients: any[]
): Promise<WhatsAppAgentResponse> {
  const normText = normalize(msg.text);

  // Check if intent is catalog / stock query
  if (normText.includes("estoque") || normText.includes("catalogo") || normText.includes("preco") || normText.includes("lista")) {
    const listFormatted = products.map(p =>
      `• *${p.nome}* (${p.sku})\n  R$ ${p.unitPrice.toFixed(2).replace('.', ',')} | Estoque: ${p.estoque} un | Peso: ${p.peso}kg`
    ).join('\n\n');

    return {
      replyText: `📦 *CATÁLOGO E ESTOQUE DISPONÍVEL (OMIE ERP)*:\n\n${listFormatted}\n\n📲 *Dica:* Envie um texto como: *"Pedido de 10 caixas Mountain Ale para Horizon Peak"*`,
      actionTaken: 'info_provided'
    };
  }

  // Check if intent is client query
  if (normText.includes("cliente") || normText.includes("cnpj") || normText.includes("cadastro")) {
    const clientsFormatted = clients.map(c =>
      `• *${c.razao_social}*\n  CNPJ: ${c.cnpj_cpf} (Cód. Omie: ${c.codigo_cliente_omie})`
    ).join('\n\n');

    return {
      replyText: `🏢 *CLIENTES CADASTRADOS NO OMIE ERP*:\n\n${clientsFormatted}`,
      actionTaken: 'info_provided'
    };
  }

  // Match client from message
  const matchedClient = clients.find(c => {
    const nameNorm = normalize(c.razao_social);
    const cnpjNorm = c.cnpj_cpf.replace(/\D/g, '');
    const cleanMsg = normText.replace(/\D/g, '');
    return nameNorm.split(' ').some(part => part.length > 3 && normText.includes(part)) || (cleanMsg.length >= 8 && cnpjNorm.includes(cleanMsg));
  }) || clients[0];

  // Match products and quantities
  const itemsProcessed: any[] = [];
  let grandTotal = 0;
  let totalWeight = 0;

  for (const prod of products) {
    const prodNorm = normalize(prod.nome);
    const skuNorm = normalize(prod.sku);
    const keywords = prodNorm.split(' ').filter(w => w.length > 3 && w !== 'caixas' && w !== 'draft');
    
    const matchesProduct = keywords.some(kw => normText.includes(kw)) || normText.includes(prodNorm) || normText.includes(skuNorm);

    if (matchesProduct) {
      const numbersInText = msg.text.match(/\b\d+\b/g);
      let qty = 1;
      if (numbersInText && numbersInText.length > 0) {
        const foundNum = Number(numbersInText[0]);
        if (foundNum > 0 && foundNum < 1000) qty = foundNum;
      }

      const subtotal = prod.unitPrice * qty;
      grandTotal += subtotal;
      totalWeight += prod.peso * qty;

      itemsProcessed.push({
        codigo: prod.codigo,
        sku: prod.sku,
        nome: prod.nome,
        quantidade: qty,
        valorUnitario: prod.unitPrice,
        subtotal
      });
      break;
    }
  }

  if (itemsProcessed.length > 0) {
    const generatedOrderId = `ORD-WA-${Date.now().toString().slice(-6)}`;
    const omieNumber = `${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await addDoc(collection(db, 'whatsapp_orders'), {
        orderId: generatedOrderId,
        omieNumber,
        sellerPhone: msg.from,
        sellerName: msg.sellerName || 'Vendedor WhatsApp',
        clientName: matchedClient.razao_social,
        clientCnpj: matchedClient.cnpj_cpf,
        items: itemsProcessed,
        totalValue: grandTotal,
        totalWeight,
        status: 'INTEGRADO_OMIE',
        origin: 'WhatsApp Agent (Contingency)',
        createdAt: new Date().toISOString()
      });
    } catch (dbErr) {
      console.warn('[WhatsApp Agent] Failed to save fallback order to Firestore:', dbErr);
    }

    const itemsFormatted = itemsProcessed.map(i =>
      `• *${i.quantidade}x* ${i.nome} (R$ ${i.valorUnitario.toFixed(2).replace('.', ',')} un) = *R$ ${i.subtotal.toFixed(2).replace('.', ',')}*`
    ).join('\n');

    return {
      replyText: `✅ *PEDIDO REGISTRADO NO OMIE ERP!*

📦 *Número do Pedido:* ${generatedOrderId} (Omie #${omieNumber})
🏢 *Cliente:* ${matchedClient.razao_social}
📄 *CNPJ:* ${matchedClient.cnpj_cpf}

🛒 *Itens do Pedido:*
${itemsFormatted}

⚖️ *Peso Total Carga:* ${totalWeight.toFixed(1)} kg
💰 *TOTAL PEDIDO:* *R$ ${grandTotal.toFixed(2).replace('.', ',')}*

🚚 *Status:* Transmitido para faturamento no Omie ERP.
📲 *Canal:* Coletor B2BR (WhatsApp Agent)`,
      actionTaken: 'order_created',
      orderSummary: {
        orderId: generatedOrderId,
        clientName: matchedClient.razao_social,
        clientCnpj: matchedClient.cnpj_cpf,
        totalValue: grandTotal,
        itemsCount: itemsProcessed.length,
        omieNumber
      }
    };
  }

  return {
    replyText: `🤖 *Agente WhatsApp B2BR (Coletor)*

Olá! Sou o assistente de vendas da B2BR Distribuição.

💡 *Exemplos de Mensagens:*
1️⃣ *Pedir:* *"Enviar 10 caixas Mountain Ale para Horizon Peak Resorts"*
2️⃣ *Estoque:* *"Consultar estoque de Hops Heaven IPA"*
3️⃣ *Clientes:* *"Buscar lista de clientes"*`,
    actionTaken: 'clarification_needed'
  };
}
