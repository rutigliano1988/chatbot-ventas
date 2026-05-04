const express = require('express');
const router = express.Router();
// TODO: const webhookController = require('../controllers/webhook');

// GET: Meta verifica el webhook con este endpoint
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// POST: Recibe mensajes entrantes de WhatsApp
router.post('/', (req, res) => {
  // TODO: Procesar mensaje y enviar al bot
  console.log('Mensaje recibido:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

module.exports = router;
