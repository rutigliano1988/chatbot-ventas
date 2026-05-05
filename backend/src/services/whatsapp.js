const axios = require('axios');

const GRAPH_URL = 'https://graph.facebook.com/v18.0';

async function enviarMensaje(telefono, texto) {
  await axios.post(
    `${GRAPH_URL}/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to: telefono,
      type: 'text',
      text: { body: texto }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// Extrae los datos relevantes del payload que envía Meta al webhook
function extraerDatosMensaje(payload) {
  try {
    const value = payload?.entry?.[0]?.changes?.[0]?.value;
    const mensaje = value?.messages?.[0];

    if (!mensaje || mensaje.type !== 'text') return null;

    return {
      telefono: mensaje.from,
      texto: mensaje.text.body.trim(),
      nombre: value.contacts?.[0]?.profile?.name || null
    };
  } catch {
    return null;
  }
}

module.exports = { enviarMensaje, extraerDatosMensaje };
