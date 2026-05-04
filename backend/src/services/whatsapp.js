const axios = require('axios');

const BASE_URL = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}`;

// Enviar mensaje de texto simple
async function enviarMensaje(numeroDestino, texto) {
  // TODO: Implementar envio real
  console.log(`Enviando a ${numeroDestino}: ${texto}`);
}

// Enviar menu de opciones
async function enviarMenu(numeroDestino, nombreNegocio) {
  const mensaje = `Hola, bienvenido a ${nombreNegocio}. Que necesitas?\n\n1️⃣ Ver horarios y ubicacion\n2️⃣ Hacer una reserva\n3️⃣ Ver servicios/menu\n4️⃣ Otra consulta`;
  return enviarMensaje(numeroDestino, mensaje);
}

module.exports = { enviarMensaje, enviarMenu };
