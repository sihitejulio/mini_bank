const { Sequelize,QueryTypes, DataTypes, Model } = require('sequelize');

const { mini_bank } = require('../config/db');

class Account extends Model {
  
}

Account.init({
  // Model attributes are defined here
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER
  },
  userId: {
    type: DataTypes.INTEGER
  },
  balance: {
    type: DataTypes.DECIMAL(25,2)
  },
  sourceOfFund: {
    type: DataTypes.STRING
  },
  puposeAccount: {
    type: DataTypes.STRING
  },
  avgMonthlyIncome: {
      type: DataTypes.STRING
  },
  occupation: {
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
  tableName: 'account',
  underscored: true,
  mapToModel: true,
  modelName: 'account' // We need to choose the model name
});

module.exports = Account;