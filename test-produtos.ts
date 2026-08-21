async function test() {
  const rawAppKey = process.env.OMIE_APP_KEY || '';
  const rawAppSecret = process.env.OMIE_APP_SECRET || '';
  const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
  const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');

  if (!appKey || !appSecret) {
    console.log('No credentials!');
    return;
  }

  const payload = {
    call: 'ListarProdutos',
    app_key: appKey,
    app_secret: appSecret,
    param: [{
      pagina: 1,
      registros_por_pagina: 10,
      exibir_caracteristicas: 'S'
    }]
  };

  try {
    const res = await fetch('https://app.omie.com.br/api/v1/geral/produtos/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log(`Status: ${res.status}`);
    const data = await res.json() as any;
    if (res.status === 200) {
      const prod = data.produto_servico_cadastro[0];
      console.log('Product Keys:', Object.keys(prod));
      console.log('Product details:', JSON.stringify(prod).substring(0, 800));
    } else {
      console.log('Error 500 payload:', JSON.stringify(data));
    }
  } catch (err: any) {
    console.log('Error:', err.message);
  }
}

test();
