const { Sequelize,QueryTypes, DataTypes, Model } = require('sequelize');

const { mini_bank } = require('../config/db');

class Users extends Model {
  static getAll() {
    const query = `
      SELECT
      *
      FROM transaction;
    `;
    return this.sequelize.query(query, {
      // replacements: { loanId },
      type: QueryTypes.SELECT,
      raw: true,
    });
  }
}

Users.init({
  // Model attributes are defined here
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER
  },
  uuid: {
    type: DataTypes.STRING
  },
  nama: {
    type: DataTypes.STRING
  },
  pin: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING
  },
  dob: {
      type: DataTypes.STRING
  },
  mobileNumber: {
      type: DataTypes.STRING
  },
  createdAt: {
    type: DataTypes.TIME,
  },
  updatedAt: {
    type: DataTypes.TIME,
  },
  deletedAt: {
    type: DataTypes.TIME,
  },
}, {
  // Other model options go here
  sequelize: mini_bank, // We need to pass the connection instance
  timestamps: true,
  paranoid: true,
  tableName: 'users',
  underscored: true,
  mapToModel: true,
  modelName: 'Users' // We need to choose the model name
});

module.exports = Users;