// Estado de conversación en memoria: telefono → { paso, datos }
// Se pierde al reiniciar el servidor — suficiente para el MVP
const estados = new Map();

function getEstado(telefono) {
  return estados.get(telefono) || null;
}

function setEstado(telefono, estado) {
  estados.set(telefono, estado);
}

function limpiarEstado(telefono) {
  estados.delete(telefono);
}

module.exports = { getEstado, setEstado, limpiarEstado };
