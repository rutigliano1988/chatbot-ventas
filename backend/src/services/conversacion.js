const { ConversacionEstado } = require('../models');

async function getEstado(telefono) {
  const registro = await ConversacionEstado.findByPk(telefono);
  if (!registro) return null;
  return { paso: registro.paso, datos: registro.datos };
}

async function setEstado(telefono, estado) {
  await ConversacionEstado.upsert({ telefono, paso: estado.paso, datos: estado.datos });
}

async function limpiarEstado(telefono) {
  await ConversacionEstado.destroy({ where: { telefono } });
}

module.exports = { getEstado, setEstado, limpiarEstado };
