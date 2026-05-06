const sgMail = require('@sendgrid/mail');

function inicializar() {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return true;
  }
  return false;
}

async function enviar(para, asunto, html) {
  if (!inicializar()) {
    console.warn('[Email] SENDGRID_API_KEY no configurado — email no enviado:', asunto);
    return;
  }
  await sgMail.send({
    to:      para,
    from:    process.env.SENDGRID_FROM_EMAIL,
    subject: asunto,
    html
  });
}

// ── Templates ─────────────────────────────────────────────

async function notificarNuevaReserva(emailDueno, { negocioNombre, clienteNombre, clienteTelefono, fecha, hora, personas, observaciones }) {
  const obs = observaciones ? `<p><strong>Observaciones:</strong> ${observaciones}</p>` : '';
  await enviar(
    emailDueno,
    `📅 Nueva reserva — ${clienteNombre || clienteTelefono} — ${fecha}`,
    `
    <h2>Nueva reserva en ${negocioNombre}</h2>
    <p><strong>Cliente:</strong> ${clienteNombre || 'Sin nombre'}</p>
    <p><strong>Teléfono:</strong> <a href="https://wa.me/${clienteTelefono}">${clienteTelefono}</a></p>
    <p><strong>Fecha:</strong> ${fecha}</p>
    <p><strong>Hora:</strong> ${hora} hs</p>
    <p><strong>Personas:</strong> ${personas}</p>
    ${obs}
    <hr>
    <p>Para confirmar o cancelar la reserva, accede al panel de administración.</p>
    `
  );
}

async function notificarNuevaConsulta(emailDueno, { negocioNombre, clienteNombre, clienteTelefono, pregunta }) {
  await enviar(
    emailDueno,
    `💬 Nueva consulta — ${clienteNombre || clienteTelefono}`,
    `
    <h2>Nueva consulta en ${negocioNombre}</h2>
    <p><strong>Cliente:</strong> ${clienteNombre || 'Sin nombre'}</p>
    <p><strong>Teléfono:</strong> <a href="https://wa.me/${clienteTelefono}">${clienteTelefono}</a></p>
    <blockquote style="border-left:4px solid #ccc;padding-left:12px;color:#555">${pregunta}</blockquote>
    <hr>
    <p>Responde desde el panel para que el cliente reciba tu respuesta por WhatsApp.</p>
    `
  );
}

module.exports = { notificarNuevaReserva, notificarNuevaConsulta };
