const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Notificar al dueno sobre nueva reserva
async function notificarNuevaReserva(emailDueno, datosReserva) {
  // TODO: Enviar email con los detalles de la reserva
  console.log('Notificando reserva a:', emailDueno, datosReserva);
}

// Notificar al dueno sobre una consulta sin respuesta
async function notificarConsulta(emailDueno, datosConsulta) {
  // TODO: Enviar email con la pregunta del cliente
  console.log('Notificando consulta a:', emailDueno, datosConsulta);
}

module.exports = { notificarNuevaReserva, notificarConsulta };
