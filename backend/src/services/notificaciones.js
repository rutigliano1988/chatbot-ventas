const { enviarMensaje } = require('./whatsapp');
const { notificarNuevaReserva, notificarNuevaConsulta } = require('./email');

// Silencia errores de notificaciones para que no corten el flujo del cliente
async function intentar(fn, contexto) {
  try {
    await fn();
  } catch (error) {
    console.error(`[Notificaciones] Error en ${contexto}:`, error.message);
  }
}

// ── Reserva nueva ─────────────────────────────────────────
// Llamar después de que el cliente confirma la reserva

async function notificarReserva(negocio, cliente, reserva) {
  const datos = {
    negocioNombre:   negocio.nombre,
    clienteNombre:   [cliente.nombre, cliente.apellido].filter(Boolean).join(' ') || null,
    clienteTelefono: cliente.telefono,
    fecha:           reserva.fecha,
    hora:            reserva.hora,
    personas:        reserva.personas,
    observaciones:   reserva.observaciones
  };

  // WhatsApp al dueño (si tiene número configurado)
  if (negocio.telefonoNotificaciones) {
    await intentar(() =>
      enviarMensaje(
        negocio.telefonoNotificaciones,
        `📅 *Nueva reserva*\n\n👤 ${datos.clienteNombre || datos.clienteTelefono}\n📞 ${datos.clienteTelefono}\n📆 ${datos.fecha} a las ${datos.hora} hs\n👥 ${datos.personas} ${datos.personas === 1 ? 'persona' : 'personas'}${datos.observaciones ? `\n📝 ${datos.observaciones}` : ''}`
      ),
    'WhatsApp reserva al dueño');
  }

  // Email al dueño (si tiene email configurado)
  if (negocio.emailNotificaciones) {
    await intentar(() => notificarNuevaReserva(negocio.emailNotificaciones, datos), 'Email reserva al dueño');
  }
}

// ── Consulta nueva ────────────────────────────────────────
// Llamar cuando el bot no pudo responder y guarda la consulta

async function notificarConsulta(negocio, cliente, consulta) {
  const datos = {
    negocioNombre:   negocio.nombre,
    clienteNombre:   [cliente.nombre, cliente.apellido].filter(Boolean).join(' ') || null,
    clienteTelefono: cliente.telefono,
    pregunta:        consulta.pregunta
  };

  // WhatsApp al dueño
  if (negocio.telefonoNotificaciones) {
    await intentar(() =>
      enviarMensaje(
        negocio.telefonoNotificaciones,
        `💬 *Nueva consulta*\n\n👤 ${datos.clienteNombre || datos.clienteTelefono}\n📞 ${datos.clienteTelefono}\n\n"${datos.pregunta}"\n\nRespondé desde el panel para que reciba tu respuesta por WhatsApp.`
      ),
    'WhatsApp consulta al dueño');
  }

  // Email al dueño
  if (negocio.emailNotificaciones) {
    await intentar(() => notificarNuevaConsulta(negocio.emailNotificaciones, datos), 'Email consulta al dueño');
  }
}

// ── Respuesta a consulta ──────────────────────────────────
// Llamar cuando el dueño responde desde el panel

async function enviarRespuestaAlCliente(telefonoCliente, respuesta, nombreNegocio) {
  await enviarMensaje(
    telefonoCliente,
    `💬 *Respuesta de ${nombreNegocio}:*\n\n${respuesta}`
  );
}

module.exports = { notificarReserva, notificarConsulta, enviarRespuestaAlCliente };
