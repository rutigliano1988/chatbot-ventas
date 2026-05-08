const sequelize = require('../config/database');
const Cliente = require('./Cliente');
const Negocio = require('./Negocio');
const Reserva = require('./Reserva');
const Consulta = require('./Consulta');
const ConversacionEstado = require('./ConversacionEstado');

// Negocio tiene muchos Clientes a través de Reservas y Consultas
Negocio.hasMany(Reserva, { foreignKey: 'negocioId', as: 'reservas' });
Negocio.hasMany(Consulta, { foreignKey: 'negocioId', as: 'consultas' });

Cliente.hasMany(Reserva, { foreignKey: 'clienteId', as: 'reservas' });
Cliente.hasMany(Consulta, { foreignKey: 'clienteId', as: 'consultas' });

Reserva.belongsTo(Negocio, { foreignKey: 'negocioId', as: 'negocio' });
Reserva.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

Consulta.belongsTo(Negocio, { foreignKey: 'negocioId', as: 'negocio' });
Consulta.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

module.exports = { sequelize, Cliente, Negocio, Reserva, Consulta, ConversacionEstado };
