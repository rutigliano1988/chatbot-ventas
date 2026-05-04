require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares de seguridad ──────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ── Rutas principales ─────────────────────────────────────
app.use('/webhook', require('./routes/webhook'));
app.use('/reservas', require('./routes/reservas'));
app.use('/consultas', require('./routes/consultas'));
app.use('/negocio', require('./routes/negocio'));
app.use('/auth', require('./routes/auth'));

// ── Health check ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', mensaje: 'ChatBot Ventas API funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

module.exports = app;
