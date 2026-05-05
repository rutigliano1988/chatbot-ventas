require('dotenv').config();
if (process.env.NODE_ENV !== 'production') process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { sequelize, Negocio } = require('../models');

// ← Cambiá esto por tu ID de calendario
const CALENDAR_ID = 'rutigliano2@gmail.com';

async function run() {
  try {
    await sequelize.authenticate();
    const negocio = await Negocio.findByPk(1);
    if (!negocio) { console.error('Negocio no encontrado.'); return; }

    await negocio.update({ googleCalendarId: CALENDAR_ID });
    console.log('✓ Google Calendar ID guardado:', CALENDAR_ID);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await sequelize.close();
  }
}

run();
