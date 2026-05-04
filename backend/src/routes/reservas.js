const express = require('express');
const router = express.Router();
// TODO: const reservasController = require('../controllers/reservas');

router.get('/', (req, res) => res.json({ reservas: [], mensaje: 'TODO: implementar' }));
router.post('/', (req, res) => res.json({ mensaje: 'TODO: crear reserva' }));
router.put('/:id', (req, res) => res.json({ mensaje: 'TODO: actualizar reserva' }));
router.delete('/:id', (req, res) => res.json({ mensaje: 'TODO: cancelar reserva' }));

module.exports = router;
