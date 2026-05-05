require('dotenv').config();
const { sequelize, Negocio } = require('../models');

const negocioDemo = {
  id: 1,
  nombre: 'El Buen Comer',
  descripcion: 'Restaurante familiar en el centro. Cocina casera, ambiente cálido.',
  direccion: 'Av. Corrientes 1234, Buenos Aires',
  telefono: '+5491155555555',
  telefonoNotificaciones: '+5491155555555',
  emailNotificaciones: 'dueno@example.com',
  horarios: {
    lunes:     null,
    martes:    { apertura: '12:00', cierre: '23:00' },
    miercoles: { apertura: '12:00', cierre: '23:00' },
    jueves:    { apertura: '12:00', cierre: '23:00' },
    viernes:   { apertura: '12:00', cierre: '00:00' },
    sabado:    { apertura: '12:00', cierre: '00:00' },
    domingo:   { apertura: '12:00', cierre: '22:00' }
  },
  capacidadTotal: 30,
  infoEspecifica: {
    menu: 'Pastas caseras, carnes a la parrilla, pizzas artesanales, ensaladas frescas.',
    precios: 'Menú del día $3.500. Platos principales desde $4.500. Postres desde $1.200.',
    servicios: 'Salón principal, terraza, servicio de catering, eventos privados.'
  }
};

async function seed() {
  try {
    await sequelize.authenticate();

    const [negocio, creado] = await Negocio.findOrCreate({
      where: { id: 1 },
      defaults: negocioDemo
    });

    if (creado) {
      console.log('✓ Negocio creado correctamente:', negocio.nombre);
    } else {
      await negocio.update(negocioDemo);
      console.log('✓ Negocio actualizado:', negocio.nombre);
    }

    console.log('✓ Seed completado.');
  } catch (error) {
    console.error('Error en seed:', error.message);
  } finally {
    await sequelize.close();
  }
}

seed();
