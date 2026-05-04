const express = require('express');
const router = express.Router();

// Redirige al usuario a la pantalla de login de Google
router.get('/google', (req, res) => {
  // TODO: Implementar con Google OAuth 2.0
  res.json({ mensaje: 'TODO: redirigir a Google OAuth' });
});

// Google redirige aqui despues del login
router.get('/google/callback', (req, res) => {
  // TODO: Intercambiar codigo por token y guardar sesion
  res.json({ mensaje: 'TODO: manejar callback de Google' });
});

module.exports = router;
