const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ultimoContacto: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'clientes',
  timestamps: false
});

module.exports = Cliente;
