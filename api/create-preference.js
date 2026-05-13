export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lives } = req.body;

  // Validar paquetes permitidos (precios en USD para Mercado Pago)
  const PACKS = {
    1:  { price: 0.99,  title: '1 vida extra — Palabrero' },
    5:  { price: 2.99,  title: '5 vidas — Palabrero' },
    15: { price: 5.99,  title: '15 vidas — Palabrero' },
  };

  const pack = PACKS[lives];
  if (!pack) {
    return res.status(400).json({ error: 'Pack inválido' });
  }

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: pack.title,
            quantity: 1,
            currency_id: 'USD',
            unit_price: pack.price,
          }
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/success?lives=${lives}`,
          failure: `${process.env.NEXT_PUBLIC_URL}/`,
          pending: `${process.env.NEXT_PUBLIC_URL}/`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook`,
      }),
    });

    const data = await response.json();

    if (data.id) {
      return res.status(200).json({
        preferenceId: data.id,
        initPoint: data.init_point,      // producción
        sandboxUrl: data.sandbox_init_point, // pruebas
      });
    } else {
      console.error('MP error:', data);
      return res.status(500).json({ error: 'Error creando preferencia' });
    }

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}