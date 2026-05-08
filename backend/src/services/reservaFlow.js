const { getEstado, setEstado, limpiarEstado } = require('./conversacion');
const { Reserva, Cliente, Negocio } = require('../models');
const { enviarMensaje } = require('./whatsapp');
const { notificarReserva } = require('./notificaciones');
const { verificarDisponibilidad } = require('./googleCalendar');

const NEGOCIO_ID = parseInt(process.env.NEGOCIO_ID) || 1;

const DIAS_DISPLAY = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_KEY     = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

// ── Parsers ───────────────────────────────────────────────

function parsearFecha(texto) {
  const match = texto.trim().match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);
  if (!match) return null;

  const dia = parseInt(match[1]);
  const mes = parseInt(match[2]) - 1;
  let anio = match[3] ? parseInt(match[3]) : new Date().getFullYear();
  if (anio < 100) anio += 2000;

  const fecha = new Date(anio, mes, dia);
  if (fecha.getDate() !== dia || fecha.getMonth() !== mes) return null;

  // No acepta fechas pasadas
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha < hoy) return null;

  return fecha;
}

function parsearHora(texto) {
  const match = texto.trim().match(/^(\d{1,2})(?::(\d{2}))?(?:\s*h(?:s|r)?)?$/i);
  if (!match) return null;

  const hora = parseInt(match[1]);
  const minutos = match[2] ? parseInt(match[2]) : 0;

  if (hora < 0 || hora > 23 || minutos < 0 || minutos > 59) return null;

  return `${String(hora).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

function parsearPersonas(texto) {
  const n = parseInt(texto.trim());
  if (isNaN(n) || n < 1 || n > 30) return null;
  return n;
}

// ── Helpers ───────────────────────────────────────────────

function formatearFechaDisplay(fecha) {
  const dia = DIAS_DISPLAY[fecha.getDay()];
  const d   = String(fecha.getDate()).padStart(2, '0');
  const m   = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia} ${d}/${m}`;
}

function fechaAString(fecha) {
  const d = String(fecha.getDate()).padStart(2, '0');
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${fecha.getFullYear()}-${m}-${d}`;
}

function diaEstaAbierto(fecha, horarios) {
  if (!horarios || Object.keys(horarios).length === 0) return true;
  const key = DIAS_KEY[fecha.getDay()];
  return !!horarios[key];
}

function menuSalida() {
  return '1️⃣ Horarios  2️⃣ Reserva  3️⃣ Servicios  4️⃣ Consulta';
}

// ── Pasos del flujo ───────────────────────────────────────

async function manejarFecha(telefono, texto, negocio) {
  const fecha = parsearFecha(texto);
  if (!fecha) {
    await enviarMensaje(telefono, '❌ No entendí la fecha. Usa el formato *DD/MM*\nEjemplo: *15/06*');
    return;
  }
  if (!diaEstaAbierto(fecha, negocio.horarios)) {
    const key = DIAS_KEY[fecha.getDay()];
    const dia = key.charAt(0).toUpperCase() + key.slice(1);
    await enviarMensaje(telefono, `❌ Los ${dia}s estamos cerrados. Por favor elige otro día.`);
    return;
  }

  const estado = await getEstado(telefono);
  estado.datos.fecha        = fechaAString(fecha);
  estado.datos.fechaDisplay = formatearFechaDisplay(fecha);
  estado.paso = 'hora';
  await setEstado(telefono, estado);

  await enviarMensaje(telefono, `⏰ ¿A qué hora?\nEjemplo: *20:00*`);
}

async function manejarHora(telefono, texto, negocio) {
  const hora = parsearHora(texto);
  if (!hora) {
    await enviarMensaje(telefono, '❌ No entendí la hora. Usa el formato *HH:MM*\nEjemplo: *20:00*');
    return;
  }

  // Verificar disponibilidad en Google Calendar si está configurado
  if (negocio.googleRefreshToken && negocio.googleCalendarId) {
    try {
      const estado = await getEstado(telefono);
      const disponible = await verificarDisponibilidad(
        negocio.googleRefreshToken,
        negocio.googleCalendarId,
        estado.datos.fecha,
        hora
      );
      if (!disponible) {
        await enviarMensaje(telefono, '❌ Ese horario ya está ocupado. Por favor elegí otra hora.\nEjemplo: *21:00*');
        return;
      }
    } catch {
      // Si falla la verificación, dejamos pasar (no bloqueamos al cliente)
    }
  }

  const estado = await getEstado(telefono);
  estado.datos.hora = hora;
  estado.paso = 'personas';
  await setEstado(telefono, estado);

  await enviarMensaje(telefono, '👥 ¿Para cuántas personas?');
}

async function manejarPersonas(telefono, texto) {
  const personas = parsearPersonas(texto);
  if (!personas) {
    await enviarMensaje(telefono, '❌ Ingresá un número entre 1 y 30.');
    return;
  }

  const estado = await getEstado(telefono);
  estado.datos.personas = personas;
  estado.paso = 'observaciones';
  await setEstado(telefono, estado);

  await enviarMensaje(
    telefono,
    '📝 ¿Alguna observación especial?\n(alergias, ocasión especial, silla para bebé, etc.)\n\nSi no tienes ninguna, escribe *no*.'
  );
}

async function manejarObservaciones(telefono, texto) {
  const estado   = await getEstado(telefono);
  const t        = texto.trim().toLowerCase();
  const obs      = (t === 'no' || t === '-' || t === 'ninguna') ? null : texto.trim();

  estado.datos.observaciones = obs;
  estado.paso = 'confirmacion';
  await setEstado(telefono, estado);

  const { fechaDisplay, hora, personas } = estado.datos;
  const linea = obs ? `📝 ${obs}\n` : '';

  await enviarMensaje(
    telefono,
    `*Resumen de tu reserva:*\n\n📅 ${fechaDisplay}\n⏰ ${hora} h\n👥 ${personas} ${personas === 1 ? 'persona' : 'personas'}\n${linea}\n¿Confirmas? Responde *SI* o *NO*`
  );
}

async function manejarConfirmacion(telefono, texto, negocio, clienteId) {
  const t = texto.trim().toLowerCase();

  if (t === 'si' || t === 'sí' || t === 's') {
    const estado  = await getEstado(telefono);
    const { fecha, hora, personas, observaciones, fechaDisplay } = estado.datos;

    const reserva = await Reserva.create({
      negocioId:     NEGOCIO_ID,
      clienteId,
      fecha,
      hora,
      personas,
      observaciones: observaciones || null,
      estado:        'pendiente'
    });

    await limpiarEstado(telefono);

    await enviarMensaje(
      telefono,
      `✅ *¡Reserva confirmada!*\n\nTe esperamos el *${fechaDisplay}* a las *${hora} h*.\n\nEn breve te confirmamos por este medio.\nPara cambios escríbenos al ${negocio.telefonoNotificaciones || negocio.telefono}. 🙌`
    );

    // Notificar al dueño sin bloquear la respuesta al cliente
    const clienteObj = await Cliente.findByPk(clienteId);
    notificarReserva(negocio, clienteObj, reserva).catch(err =>
      console.error('[reservaFlow] Error notificando reserva:', err.message)
    );

  } else if (t === 'no' || t === 'n') {
    await limpiarEstado(telefono);
    await enviarMensaje(telefono, `❌ Reserva cancelada.\n\n¿En qué más puedo ayudarte?\n${menuSalida()}`);

  } else {
    await enviarMensaje(telefono, 'Responde *SI* para confirmar o *NO* para cancelar.');
  }
}

// ── API pública ───────────────────────────────────────────

async function iniciarFlujo(telefono, negocio) {
  await setEstado(telefono, { paso: 'fecha', datos: {} });
  await enviarMensaje(
    telefono,
    `📅 ¡Genial! Vamos a hacer tu reserva en *${negocio.nombre}*.\n\n¿Para qué fecha la quieres?\nEjemplo: *15/06*\n\nEscribe *cancelar* en cualquier momento para salir.`
  );
}

// Devuelve true si el mensaje fue manejado por el flujo
async function procesarPaso(telefono, texto, negocio, clienteId) {
  const estado = await getEstado(telefono);
  if (!estado) return false;

  const t = texto.trim().toLowerCase();

  // Salida en cualquier paso
  if (t === 'cancelar' || t === '0' || t === 'salir') {
    await limpiarEstado(telefono);
    await enviarMensaje(telefono, `❌ Reserva cancelada.\n\n¿En qué más puedo ayudarte?\n${menuSalida()}`);
    return true;
  }

  switch (estado.paso) {
    case 'fecha':         await manejarFecha(telefono, texto, negocio);              break;
    case 'hora':          await manejarHora(telefono, texto, negocio);               break;
    case 'personas':      await manejarPersonas(telefono, texto);                    break;
    case 'observaciones': await manejarObservaciones(telefono, texto);               break;
    case 'confirmacion':  await manejarConfirmacion(telefono, texto, negocio, clienteId); break;
  }

  return true;
}

module.exports = { iniciarFlujo, procesarPaso };
