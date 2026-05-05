const express = require('express');
const router = express.Router();
const { Negocio } = require('../models');

const NEGOCIO_ID = parseInt(process.env.NEGOCIO_ID) || 1;

// GET /negocio — obtener configuración del negocio
router.get('/', async (req, res) => {
  try {
    const negocio = await Negocio.findByPk(NEGOCIO_ID);
    if (!negocio) return res.status(404).json({ error: 'Negocio no configurado aún.' });
    res.json(negocio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /negocio — crear negocio inicial (solo si no existe)
router.post('/', async (req, res) => {
  try {
    const existe = await Negocio.findByPk(NEGOCIO_ID);
    if (existe) return res.status(409).json({ error: 'El negocio ya existe. Usá PUT para actualizarlo.' });

    const negocio = await Negocio.create({ id: NEGOCIO_ID, ...req.body });
    res.status(201).json(negocio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /negocio — actualizar configuración
router.put('/', async (req, res) => {
  try {
    const negocio = await Negocio.findByPk(NEGOCIO_ID);
    if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado.' });

    await negocio.update(req.body);
    res.json(negocio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
