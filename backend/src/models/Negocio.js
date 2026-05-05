const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Negocio = sequelize.define('Negocio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  emailNotificaciones: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  telefonoNotificaciones: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  // { lunes: null, martes: { apertura: "10:00", cierre: "18:00" }, ... }
  horarios: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  capacidadTotal: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  googleCalendarId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  googleRefreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // menu, servicios, precios, preguntas frecuentes, etc.
  infoEspecifica: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'negocios',
  timestamps: false
});

module.exports = Negocio;
