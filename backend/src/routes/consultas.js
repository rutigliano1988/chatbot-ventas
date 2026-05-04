const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ consultas: [], mensaje: 'TODO: implementar' }));
router.post('/:id/responder', (req, res) => res.json({ mensaje: 'TODO: responder consulta' }));

module.exports = router;
