const { google } = require('googleapis');

const TIMEZONE        = process.env.CALENDAR_TIMEZONE || 'America/Argentina/Buenos_Aires';
const TZ_OFFSET       = process.env.CALENDAR_TZ_OFFSET || '-03:00';
const DURACION_MIN    = parseInt(process.env.RESERVA_DURACION_MINUTOS) || 90;

// ── Helpers ───────────────────────────────────────────────

function crearClienteOAuth(refreshToken) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

function horaFin(hora, minutos) {
  const [h, m] = hora.split(':').map(Number);
  const total  = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function rfc3339(fecha, hora) {
  // Devuelve "2025-06-15T20:00:00-03:00"
  return `${fecha}T${hora}:00${TZ_OFFSET}`;
}

// ── API pública ───────────────────────────────────────────

// Devuelve true si el horario está libre en el calendario
async function verificarDisponibilidad(refreshToken, calendarId, fecha, hora) {
  const auth     = crearClienteOAuth(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const horaStr  = hora.substring(0, 5); // normaliza "20:00:00" → "20:00"
  const timeMin  = rfc3339(fecha, horaStr);
  const timeMax  = rfc3339(fecha, horaFin(horaStr, DURACION_MIN));
  const id      = calendarId || 'primary';

  const { data } = await calendar.freebusy.query({
    requestBody: { timeMin, timeMax, timeZone: TIMEZONE, items: [{ id }] }
  });

  return data.calendars[id].busy.length === 0;
}

// Crea un evento y devuelve su ID (para guardar en la reserva)
async function crearEvento(refreshToken, calendarId, { clienteNombre, clienteTelefono, fecha, hora, personas, observaciones }) {
  const auth     = crearClienteOAuth(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const horaStr    = hora.substring(0, 5); // normaliza "20:00:00" → "20:00"
  const descripcion = [`Tel: ${clienteTelefono}`, observaciones ? `Obs: ${observaciones}` : null]
    .filter(Boolean).join('\n');

  const { data } = await calendar.events.insert({
    calendarId: calendarId || 'primary',
    requestBody: {
      summary:     `Reserva — ${clienteNombre || clienteTelefono} (${personas} ${personas === 1 ? 'persona' : 'personas'})`,
      description: descripcion,
      start: { dateTime: rfc3339(fecha, horaStr), timeZone: TIMEZONE },
      end:   { dateTime: rfc3339(fecha, horaFin(horaStr, DURACION_MIN)), timeZone: TIMEZONE },
      colorId: '2' // verde
    }
  });

  return data.id;
}

// Elimina un evento del calendario
async function cancelarEvento(refreshToken, calendarId, eventoId) {
  const auth     = crearClienteOAuth(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.delete({
    calendarId: calendarId || 'primary',
    eventId:    eventoId
  });
}

module.exports = { verificarDisponibilidad, crearEvento, cancelarEvento };
