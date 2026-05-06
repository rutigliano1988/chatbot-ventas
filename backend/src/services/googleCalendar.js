const { google } = require('googleapis');

const TIMEZONE     = 'Europe/Madrid';
const DURACION_MIN = parseInt(process.env.RESERVA_DURACION_MINUTOS) || 90;

function crearClienteOAuth(refreshToken) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

function fechaStr(fecha) {
  if (typeof fecha === 'string') return fecha.substring(0, 10);
  return fecha.toISOString().substring(0, 10);
}

function horaFin(hora, minutos) {
  const [h, m] = hora.split(':').map(Number);
  const total  = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// España: CEST +02:00 (abril-octubre), CET +01:00 (noviembre-marzo)
function offsetEspana(isoDate) {
  const mes = parseInt(isoDate.substring(5, 7));
  return (mes >= 4 && mes <= 10) ? '+02:00' : '+01:00';
}

// Para freebusy: RFC3339 con offset
function rfc3339(fecha, hora) {
  const f = fechaStr(fecha);
  return `${f}T${hora}:00${offsetEspana(f)}`;
}

// Para eventos: datetime local sin offset (Google aplica el timeZone y gestiona el horario de verano)
function localDT(fecha, hora) {
  return `${fechaStr(fecha)}T${hora}:00`;
}

async function verificarDisponibilidad(refreshToken, calendarId, fecha, hora) {
  const auth     = crearClienteOAuth(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const horaStr = String(hora).substring(0, 5);
  const timeMin = rfc3339(fecha, horaStr);
  const timeMax = rfc3339(fecha, horaFin(horaStr, DURACION_MIN));
  const id      = calendarId || 'primary';

  const { data } = await calendar.freebusy.query({
    requestBody: { timeMin, timeMax, timeZone: TIMEZONE, items: [{ id }] }
  });

  return data.calendars[id].busy.length === 0;
}

async function crearEvento(refreshToken, calendarId, { clienteNombre, clienteTelefono, fecha, hora, personas, observaciones }) {
  const auth     = crearClienteOAuth(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const horaStr    = String(hora).substring(0, 5);
  const descripcion = [`Tel: ${clienteTelefono}`, observaciones ? `Obs: ${observaciones}` : null]
    .filter(Boolean).join('\n');

  const { data } = await calendar.events.insert({
    calendarId: calendarId || 'primary',
    requestBody: {
      summary:     `Reserva - ${clienteNombre || clienteTelefono} (${personas} ${personas === 1 ? 'persona' : 'personas'})`,
      description: descripcion,
      start: { dateTime: localDT(fecha, horaStr), timeZone: TIMEZONE },
      end:   { dateTime: localDT(fecha, horaFin(horaStr, DURACION_MIN)), timeZone: TIMEZONE },
      colorId: '2'
    }
  });

  return data.id;
}

async function cancelarEvento(refreshToken, calendarId, eventoId) {
  const auth     = crearClienteOAuth(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.delete({
    calendarId: calendarId || 'primary',
    eventId:    eventoId
  });
}

module.exports = { verificarDisponibilidad, crearEvento, cancelarEvento };
