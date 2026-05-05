// Necesario en redes corporativas con proxy SSL — remover en producción
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');

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
