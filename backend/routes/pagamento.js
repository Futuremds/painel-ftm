const express = require('express');
const axios = require('axios');
const router = express.Router();
const { ObjectId } = require('mongodb');
const User = require('../models/User');

const PAGARME_TOKEN = process.env.PAGARME_TOKEN;

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Rota para criar cobrança Pix
router.post('/pix', async (req, res) => {
  const { quantidadeTokens, userId } = req.body;
  const valor = quantidadeTokens * 4; // R$4,00 por token

  if (valor < 20) {
    return res.status(400).json({ error: 'Valor mínimo de R$20,00' });
  }

  // Buscar dados reais do usuário
  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar usuário', details: err.message });
  }

  // Extrair DDD e número do telefone
  let areaCode = '31';
  let number = '999999999';
  if (user.telefone && user.telefone.length >= 10) {
    const telefoneNumeros = user.telefone.replace(/\D/g, '');
    areaCode = telefoneNumeros.substring(0, 2);
    number = telefoneNumeros.substring(2);
  }

  try {
    const response = await axios.post(
      'https://api.pagar.me/core/v5/orders',
      {
        items: [
          {
            amount: valor * 100, // em centavos
            description: 'Compra de tokens',
            quantity: 1
          }
        ],
        customer: {
          name: user.nome,
          type: 'individual',
          document: user.cpf.replace(/\D/g, ''), // garante que só vai número!
          email: user.email,
          phones: {
            mobile_phone: {
              country_code: '55',
              area_code: areaCode,
              number: number
            }
          }
        },
        payments: [
          {
            payment_method: 'pix',
            pix: {
              expires_in: 3600 // expira em 1 hora
            }
          }
        ]
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(PAGARME_TOKEN + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Resposta Pagar.me:', JSON.stringify(response.data, null, 2));
    if (
      response.data &&
      response.data.charges &&
      response.data.charges[0]
    ) {
      const charge = response.data.charges[0];
      console.log('Charge:', JSON.stringify(charge, null, 2));
      if (charge.last_transaction) {
        console.log('last_transaction:', JSON.stringify(charge.last_transaction, null, 2));
      } else {
        console.error('last_transaction não encontrado na charge!');
      }
      if (
        charge.last_transaction &&
        ((charge.last_transaction.qr_codes && charge.last_transaction.qr_codes[0]) || charge.last_transaction.qr_code)
      ) {
        // Se existir o array qr_codes, usa ele. Se não, usa os campos diretos.
        const pixInfo = charge.last_transaction.qr_codes && charge.last_transaction.qr_codes[0]
          ? {
              qr_code: charge.last_transaction.qr_codes[0].qr_code,
              qr_code_url: charge.last_transaction.qr_codes[0].url
            }
          : {
              qr_code: charge.last_transaction.qr_code,
              qr_code_url: charge.last_transaction.qr_code_url
            };
        const orderId = response.data.id;
        // Salva a relação orderId <-> userId e quantidadeTokens
        const db = req.app.locals.db;
        await db.collection('pix_orders').insertOne({
          order_id: orderId,
          user_id: userId,
          quantidadeTokens,
          status: 'pending',
          createdAt: new Date()
        });
        res.json({
          success: true,
          pix: {
            qr_code: pixInfo.qr_code,
            qr_code_url: pixInfo.qr_code_url,
            order_id: orderId
          }
        });
      } else {
        console.error('QR Code Pix não encontrado na resposta do Pagar.me! Estrutura last_transaction:', JSON.stringify(charge.last_transaction, null, 2));
        return res.status(500).json({ error: 'QR Code Pix não encontrado na resposta do Pagar.me', details: charge.last_transaction });
      }
    } else {
      console.error('Resposta inesperada do Pagar.me:', JSON.stringify(response.data, null, 2));
      return res.status(500).json({ error: 'Resposta inesperada do Pagar.me', details: response.data });
    }
  } catch (err) {
    console.error('Erro ao criar cobrança Pix:', err.response?.data || err.message, err.response?.status);
    res.status(500).json({ error: 'Erro ao criar cobrança Pix', details: err.response?.data || err.message });
  }
});

// Webhook para liberar tokens automaticamente
router.post('/webhook', async (req, res) => {
  try {
    console.log('--- Recebido webhook do Pagar.me ---');
    console.log('Tipo do body:', typeof req.body, 'Conteúdo:', req.body);
    console.log('Método:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    const event = req.body;
    if (event.type === 'order.paid') {
      const orderId = event.data.id;
      const db = req.app.locals.db;
      // Busca a relação orderId <-> userId e quantidadeTokens
      const order = await db.collection('pix_orders').findOne({ order_id: orderId });
      if (order && order.status !== 'paid') {
        // Credita os tokens ao usuário
        await db.collection('users').updateOne(
          { _id: new ObjectId(order.user_id) },
          { $inc: { tokens: order.quantidadeTokens } }
        );
        // Atualiza status do pedido
        await db.collection('pix_orders').updateOne(
          { order_id: orderId },
          { $set: { status: 'paid', paidAt: new Date() } }
        );
        console.log(`Tokens liberados para o usuário ${order.user_id} (order: ${orderId})`);
      }
    }
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Erro no webhook:', err);
    res.status(500).json({ error: 'Erro no webhook', details: err.message });
  }
});

// Rota para checar status do pagamento Pix
router.get('/status/:orderId', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const order = await db.collection('pix_orders').findOne({ order_id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ status: 'not_found' });
    }
    res.json({ status: order.status });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

module.exports = router;
