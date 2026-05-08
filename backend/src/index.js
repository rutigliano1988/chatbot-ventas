// Necesario en redes corporativas con proxy SSL — remover en producción
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const { requireApiKey } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Railway (y la mayoría de plataformas cloud) usan un proxy inverso
app.set('trust proxy', 1);

// ── Rate limiters ─────────────────────────────────────────
// Webhook: generoso — todas las peticiones de clientes llegan desde IPs de Meta
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones al webhook' },
});

// Dashboard: más restrictivo — solo lo usa el dueño del negocio
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta más tarde' },
});

// ── Middlewares de seguridad ──────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// verify captura el body crudo antes del parseo — necesario para validar la firma del webhook
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));

// ── Rutas principales ─────────────────────────────────────
// /webhook y /auth no requieren API key (las llaman Meta y Google respectivamente)
app.use('/webhook', webhookLimiter, require('./routes/webhook'));
app.use('/auth', require('./routes/auth'));

// Rutas del dashboard — requieren API key
app.use('/reservas', apiLimiter, requireApiKey, require('./routes/reservas'));
app.use('/consultas', apiLimiter, requireApiKey, require('./routes/consultas'));
app.use('/negocio', apiLimiter, requireApiKey, require('./routes/negocio'));

// ── Health check ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', mensaje: 'ChatBot Ventas API funcionando' });
});

// ── Conexión DB + arranque del servidor ───────────────────
async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a Supabase establecida correctamente.');

    // Crea las tablas si no existen (nunca borra datos existentes)
    await sequelize.sync({ alter: false });
    console.log('Tablas sincronizadas.');

    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
    process.exit(1);
  }
}

iniciar();

module.exports = app;
