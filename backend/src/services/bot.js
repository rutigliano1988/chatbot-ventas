// Motor principal del chatbot
// Procesa el mensaje del cliente y decide que hacer

async function procesarMensaje(numeroCliente, mensajeTexto, configNegocio) {
  const mensaje = mensajeTexto.trim().toLowerCase();

  // TODO: Analizar la intencion del mensaje
  // 1 o "horarios" -> responder con horarios
  // 2 o "reserva" -> iniciar flujo de reserva
  // 3 o "menu" -> responder con servicios/menu
  // Otro -> guardar como consulta y notificar al dueno

  console.log(`Mensaje de ${numeroCliente}: ${mensaje}`);
  return { tipo: 'pendiente', respuesta: 'TODO: implementar logica del bot' };
}

module.exports = { procesarMensaje };
