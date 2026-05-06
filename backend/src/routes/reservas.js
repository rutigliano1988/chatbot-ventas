const express = require('express');
const router  = express.Router();
const { Reserva, Cliente, Negocio } = require('../models');
const { crearEvento, cancelarEvento } = require('../services/googleCalendar');

const NEGOCIO_ID = parseInt(process.env.NEGOCIO_ID) || 1;

// GET /reservas?estado=pendiente — listar reservas
router.get('/', async (req, res) => {
  try {
    const where = { negocioId: NEGOCIO_ID };
    if (req.query.estado) where.estado = req.query.estado;

    const reservas = await Reserva.findAll({
      where,
      include: [{ model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido', 'telefono'] }],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /reservas/:id — detalle de una reserva
router.get('/:id', async (req, res) => {
  try {
    const reserva = await Reserva.findOne({
      where: { id: req.params.id, negocioId: NEGOCIO_ID },
      include: [{ model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido', 'telefono'] }]
    });
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada.' });
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /reservas/:id — cambiar estado y sincronizar con Google Calendar
router.put('/:id', async (req, res) => {
  const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
  const { estado } = req.body;

  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Valores posibles: ${estadosValidos.join(', ')}` });
  }

  try {
    const reserva = await Reserva.findOne({ where: { id: req.params.id, negocioId: NEGOCIO_ID } });
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada.' });

    await reserva.update({ estado });

    const negocio = await Negocio.findByPk(NEGOCIO_ID);

    // ── Confirmar → crear evento en Google Calendar ───────
    if (estado === 'confirmada' && negocio.googleRefreshToken) {
      try {
        const cliente    = await Cliente.findByPk(reserva.clienteId);
        const eventoId   = await crearEvento(negocio.googleRefreshToken, negocio.googleCalendarId, {
          clienteNombre:   [cliente.nombre, cliente.apellido].filter(Boolean).join(' ') || null,
          clienteTelefono: cliente.telefono,
          fecha:           reserva.fecha,
          hora:            reserva.hora,
          personas:        reserva.personas,
          observaciones:   reserva.observaciones
        });
        await reserva.update({ googleEventId: eventoId });
      } catch (calErr) {
        console.error('[Calendar] Error al crear evento:', calErr.message, JSON.stringify(calErr.response?.data || {}));
        console.error('[Calendar] Datos enviados — fecha:', reserva.fecha, '| hora:', reserva.hora, '| calendarId:', negocio.googleCalendarId);
      }
    }

    // ── Cancelar → eliminar evento del calendario ─────────
    if (estado === 'cancelada' && reserva.googleEventId && negocio.googleRefreshToken) {
      try {
        await cancelarEvento(negocio.googleRefreshToken, negocio.googleCalendarId, reserva.googleEventId);
        await reserva.update({ googleEventId: null });
      } catch (calErr) {
        console.error('[Calendar] Error al cancelar evento:', calErr.message);
      }
    }

    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
