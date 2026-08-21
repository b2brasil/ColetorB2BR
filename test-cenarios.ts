async function testCenarios() {
  const rawAppKey = process.env.OMIE_APP_KEY || '';
  const rawAppSecret = process.env.OMIE_APP_SECRET || '';
  const appKey = rawAppKey.trim().replace(/^["']|["']$/g, '');
  const appSecret = rawAppSecret.trim().replace(/^["']|["']$/g, '');

  if (!appKey || !appSecret) {
    console.log('No credentials!');
    return;
  }

  const variations = [
    { cNome: "Venda" },
    { cNome: "venda" },
    { cNome: "VENDA" },
    { cNome: "Vendas" }
  ];

  for (const v of variations) {
    const payload = {
      call: 'ListarCenarios',
      app_key: appKey,
      app_secret: appSecret,
      param: [v]
    };

    try {
      const res = await fetch('https://app.omie.com.br/api/v1/geral/cenarios/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log(`Payload: ${JSON.stringify(v)} -> Status: ${res.status}`);
      const data = await res.json() as any;
      if (res.status === 200) {
        console.log('Success payload:', JSON.stringify(v));
        console.log('Data keys:', Object.keys(data));
        console.log('Response data:', JSON.stringify(data));
      } else {
        console.log('Error Payload:', JSON.stringify(data));
      }
    } catch (err: any) {
      console.log('Error:', err.message);
    }
  }
}

testCenarios();
