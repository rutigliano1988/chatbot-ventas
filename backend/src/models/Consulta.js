const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Consulta = sequelize.define('Consulta', {
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
  pregunta: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  respuesta: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'respondida'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  creadaEn: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  respondidaEn: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'consultas',
  timestamps: false
});

module.exports = Consulta;
