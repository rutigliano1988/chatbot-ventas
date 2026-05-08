const { Cliente, Negocio, Consulta } = require('../models');
const { enviarMensaje } = require('./whatsapp');
const { getEstado } = require('./conversacion');
const { iniciarFlujo, procesarPaso } = require('./reservaFlow');
const { notificarConsulta } = require('./notificaciones');

const NEGOCIO_ID = parseInt(process.env.NEGOCIO_ID) || 1;

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

// ── Intent detection ──────────────────────────────────────

function detectarIntencion(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  if (/^(hola|buenas|buenos|buen dia|hi|hey|inicio|menu|0)/.test(t)) return 'MENU';
  if (/^1$|horario|cuando|abre|cierra|ubicacion|direccion|donde/.test(t))  return 'HORARIOS';
  if (/^2$|reserva|reservar|mesa|turno|cita/.test(t))                       return 'RESERVA';
  if (/^3$|menu|carta|servicio|precio|que tienen|que ofrecen/.test(t))      return 'INFO';

  return 'CONSULTA';
}

// ── Formateos ─────────────────────────────────────────────

function formatearHorarios(horarios, negocio) {
  if (!horarios || Object.keys(horarios).length === 0) {
    return `Para conocer nuestros horarios, contáctanos al ${negocio.telefonoNotificaciones || negocio.telefono}.`;
  }

  const lineas = DIAS.map(dia => {
    const h      = horarios[dia];
    const nombre = dia.charAt(0).toUpperCase() + dia.slice(1);
    return h ? `${nombre}: ${h.apertura} - ${h.cierre}` : `${nombre}: Cerrado`;
  });

  return `⏰ *Horarios de ${negocio.nombre}*\n\n${lineas.join('\n')}${negocio.direccion ? `\n\n📍 ${negocio.direccion}` : ''}`;
}

function formatearInfo(negocio) {
  const info = negocio.infoEspecifica;

  if (!info || Object.keys(info).length === 0) {
    return `Para conocer nuestros servicios, contáctanos al ${negocio.telefonoNotificaciones || negocio.telefono}.`;
  }

  const partes = [`📋 *${negocio.nombre}*`];
  if (negocio.descripcion) partes.push(`\n${negocio.descripcion}`);
  if (info.menu)           partes.push(`\n🍽️ *Menú:*\n${info.menu}`);
  if (info.servicios)      partes.push(`\n✅ *Servicios:*\n${info.servicios}`);
  if (info.precios)        partes.push(`\n💰 *Precios:*\n${info.precios}`);

  return partes.join('\n');
}

function textoMenu(nombreNegocio) {
  return `👋 ¡Hola! Bienvenido/a a *${nombreNegocio}*.\n\n¿En qué puedo ayudarte?\n\n1️⃣ Horarios y ubicación\n2️⃣ Hacer una reserva\n3️⃣ Ver servicios / menú\n4️⃣ Otra consulta`;
}

// ── Procesamiento principal ───────────────────────────────

async function procesarMensaje(telefono, nombreContacto, texto) {
  const [cliente] = await Cliente.findOrCreate({
    where: { telefono },
    defaults: { nombre: nombreContacto || null, ultimoContacto: new Date() }
  });
  await cliente.update({ ultimoContacto: new Date() });

  const negocio = await Negocio.findByPk(NEGOCIO_ID);
  if (!negocio) {
    await enviarMensaje(telefono, '¡Hola! Estamos configurando nuestro sistema. Vuelve a escribirnos en unos minutos.');
    return;
  }

  // Si el usuario está en medio de un flujo de reserva, delegamos al flujo
  if (await getEstado(telefono)) {
    await procesarPaso(telefono, texto, negocio, cliente.id);
    return;
  }

  const intencion = detectarIntencion(texto);

  switch (intencion) {
    case 'MENU':
      await enviarMensaje(telefono, textoMenu(negocio.nombre));
      break;

    case 'HORARIOS':
      await enviarMensaje(telefono, formatearHorarios(negocio.horarios, negocio));
      break;

    case 'RESERVA':
      await iniciarFlujo(telefono, negocio);
      break;

    case 'INFO':
      await enviarMensaje(telefono, formatearInfo(negocio));
      break;

    case 'CONSULTA':
    default: {
      const consulta = await Consulta.create({
        negocioId: NEGOCIO_ID,
        clienteId: cliente.id,
        pregunta:  texto,
        estado:    'pendiente'
      });
      await enviarMensaje(
        telefono,
        `Gracias por tu mensaje. Le avisamos al equipo de *${negocio.nombre}* y te respondemos a la brevedad. 🙏`
      );
      // Notificar al dueño sin bloquear la respuesta al cliente
      notificarConsulta(negocio, cliente, consulta).catch(err =>
        console.error('[bot] Error notificando consulta:', err.message)
      );
      break;
    }
  }
}

module.exports = { procesarMensaje };
