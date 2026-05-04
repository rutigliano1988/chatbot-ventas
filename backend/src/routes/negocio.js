const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ negocio: {}, mensaje: 'TODO: implementar' }));
router.put('/', (req, res) => res.json({ mensaje: 'TODO: actualizar negocio' }));

module.exports = router;
