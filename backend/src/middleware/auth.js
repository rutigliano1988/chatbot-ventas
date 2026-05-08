const API_KEY = process.env.API_KEY;

function requireApiKey(req, res, next) {
  if (!API_KEY) {
    console.error('API_KEY no configurada en variables de entorno');
    return res.status(500).json({ error: 'Configuración del servidor incompleta' });
  }

  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const key = header.slice('Bearer '.length);
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  next();
}

module.exports = { requireApiKey };
