const express = require('express');
const router = express.Router();
const { extraerDatosMensaje } = require('../services/whatsapp');
const { procesarMensaje } = require('../services/bot');

// GET: Meta verifica el webhook con este endpoint
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// POST: Recibe mensajes entrantes de WhatsApp
router.post('/', async (req, res) => {
  // Meta requiere 200 inmediato para no reintentar el envío
  res.sendStatus(200);

  const datos = extraerDatosMensaje(req.body);
  if (!datos) return;

  try {
    await procesarMensaje(datos.telefono, datos.nombre, datos.texto);
  } catch (error) {
    console.error('Error procesando mensaje:', error.message);
  }
});

module.exports = router;
