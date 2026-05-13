export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  // Solo procesamos pagos aprobados
  if (type === 'payment') {
    try {
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        }
      );

      const payment = await paymentResponse.json();

      if (payment.status === 'approved') {
        // Acá en el futuro podés guardar en base de datos
        console.log('Pago aprobado:', payment.id, payment.transaction_amount);
      }

    } catch (err) {
      console.error('Webhook error:', err);
    }
  }

  // MP requiere 200 inmediato
  return res.status(200).json({ received: true });
}