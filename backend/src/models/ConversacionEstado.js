const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConversacionEstado = sequelize.define('ConversacionEstado', {
  telefono: {
    type: DataTypes.STRING(20),
    primaryKey: true,
  },
  paso: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  datos: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'conversacion_estados',
  timestamps: true,
  createdAt: false,
  updatedAt: 'actualizadoEn',
});

module.exports = ConversacionEstado;
