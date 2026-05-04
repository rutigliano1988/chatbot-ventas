const { google } = require('googleapis');

// Verificar disponibilidad en una fecha y hora
async function verificarDisponibilidad(auth, fecha, hora, duracionMinutos = 90) {
  // TODO: Consultar Google Calendar y verificar si hay espacio
  console.log(`Verificando disponibilidad: ${fecha} ${hora}`);
  return true;
}

// Crear una reserva en Google Calendar
async function crearReserva(auth, datos) {
  // datos: { nombre, telefono, fecha, hora, personas, observaciones }
  // TODO: Crear evento en Google Calendar
  console.log('Creando reserva:', datos);
}

// Cancelar una reserva
async function cancelarReserva(auth, eventoId) {
  // TODO: Eliminar o cancelar evento de Google Calendar
  console.log('Cancelando reserva:', eventoId);
}

module.exports = { verificarDisponibilidad, crearReserva, cancelarReserva };
