const Sequelize = require('sequelize')

const pg = require('pg')
const logger = require('./winstonLoader')

const model = require('../models')

logger.info('connection to database initiated....')

// Connect to postgres database
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_TYPE,
  operatorsAliases: (/true/i).test(process.env.DB_OPERATORALIAS),
  reconnect: true,
  pool: {
    max: parseInt(process.env.DB_MAXPOOLSIZE),
    min: parseInt(process.env.DB_MINPOOLSIZE),
    acquire: parseInt(process.env.DB_AQUIRETIME),
    idle: parseInt(process.env.DB_IDLETIME)
  },

  define: {
    timestamps: (/true/i).test(process.env.DB_TIMESTAMP),
    freezeTableName: (/true/i).test(process.env.DB_FREEZETABLENAME)
  }
})

const models = model.init(sequelize)
models.isInitialized = true

module.exports = sequelize
module.exports = models
