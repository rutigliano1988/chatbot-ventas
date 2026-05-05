const express = require('express');
const router  = express.Router();
const { Consulta, Cliente, Negocio } = require('../models');
const { enviarRespuestaAlCliente } = require('../services/notificaciones');

const NEGOCIO_ID = parseInt(process.env.NEGOCIO_ID) || 1;

// GET /consultas?estado=pendiente — listar consultas
router.get('/', async (req, res) => {
  try {
    const where = { negocioId: NEGOCIO_ID };
    if (req.query.estado) where.estado = req.query.estado;

    const consultas = await Consulta.findAll({
      where,
      include: [{ model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido', 'telefono'] }],
      order: [['creadaEn', 'DESC']]
    });

    res.json(consultas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /consultas/:id/responder — el dueño responde y el cliente recibe WhatsApp
router.post('/:id/responder', async (req, res) => {
  const { respuesta } = req.body;
  if (!respuesta || !respuesta.trim()) {
    return res.status(400).json({ error: 'El campo respuesta es obligatorio.' });
  }

  try {
    const consulta = await Consulta.findOne({
      where: { id: req.params.id, negocioId: NEGOCIO_ID },
      include: [{ model: Cliente, as: 'cliente' }]
    });

    if (!consulta) return res.status(404).json({ error: 'Consulta no encontrada.' });
    if (consulta.estado === 'respondida') return res.status(409).json({ error: 'Esta consulta ya fue respondida.' });

    const negocio = await Negocio.findByPk(NEGOCIO_ID);

    await consulta.update({
      respuesta:    respuesta.trim(),
      estado:       'respondida',
      respondidaEn: new Date()
    });

    // Enviar respuesta al cliente por WhatsApp
    await enviarRespuestaAlCliente(consulta.cliente.telefono, respuesta.trim(), negocio.nombre);

    res.json({ mensaje: 'Respuesta enviada al cliente por WhatsApp.', consulta });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
