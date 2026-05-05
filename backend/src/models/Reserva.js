const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  negocioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'negocios', key: 'id' }
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'clientes', key: 'id' }
  },
  googleEventId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  personas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  creadaEn: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'reservas',
  timestamps: false
});

module.exports = Reserva;
