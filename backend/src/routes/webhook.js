const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const { extraerDatosMensaje } = require('../services/whatsapp');
const { procesarMensaje } = require('../services/bot');

function verificarFirma(req, res, next) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.warn('[webhook] WHATSAPP_APP_SECRET no configurado — verificación de firma omitida');
    return next();
  }

  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return res.sendStatus(403);

  const esperada = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(req.rawBody)
    .digest('hex');

  try {
    const bufRecibida = Buffer.from(signature);
    const bufEsperada = Buffer.from(esperada);
    if (bufRecibida.length !== bufEsperada.length || !crypto.timingSafeEqual(bufRecibida, bufEsperada)) {
      return res.sendStatus(403);
    }
  } catch {
    return res.sendStatus(403);
  }

  next();
}

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
router.post('/', verificarFirma, async (req, res) => {
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
