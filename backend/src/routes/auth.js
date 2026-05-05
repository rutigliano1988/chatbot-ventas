const express = require('express');
const router  = express.Router();
const { google } = require('googleapis');
const { Negocio } = require('../models');

const NEGOCIO_ID = parseInt(process.env.NEGOCIO_ID) || 1;
const SCOPES     = ['https://www.googleapis.com/auth/calendar'];

function crearOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// GET /auth/google — redirige al login de Google
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no configurados en .env' });
  }

  const url = crearOAuth2Client().generateAuthUrl({
    access_type: 'offline',
    scope:       SCOPES,
    prompt:      'consent' // garantiza que devuelva refresh_token siempre
  });

  res.redirect(url);
});

// GET /auth/google/callback — Google redirige aquí tras el login
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(`Error de Google OAuth: ${error}`);
  }

  try {
    const { tokens } = await crearOAuth2Client().getToken(code);

    if (!tokens.refresh_token) {
      return res.status(400).send(
        'No se recibió el refresh_token.<br>' +
        'Solución: andá a <a href="https://myaccount.google.com/permissions">Google Permisos</a>, ' +
        'eliminá el acceso de esta app y volvé a conectar.'
      );
    }

    const negocio = await Negocio.findByPk(NEGOCIO_ID);
    if (!negocio) return res.status(404).send('Negocio no encontrado en la base de datos.');

    await negocio.update({ googleRefreshToken: tokens.refresh_token });

    res.send(`
      <h2>✅ Google Calendar conectado correctamente</h2>
      <p>El refresh token fue guardado en la base de datos.</p>
      <p><strong>Último paso:</strong> actualizá el campo <code>googleCalendarId</code> en tu negocio con el ID del calendario que querés usar.</p>
      <p>Podés encontrar el ID del calendario en Google Calendar → Configuración del calendario → ID de calendario.</p>
      <p>Generalmente es tu email de Google (ej: <code>tunombre@gmail.com</code>) o un ID con formato <code>abc123@group.calendar.google.com</code>.</p>
    `);
  } catch (err) {
    res.status(500).send(`Error al conectar con Google: ${err.message}`);
  }
});

module.exports = router;
