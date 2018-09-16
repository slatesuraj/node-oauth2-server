const Token = require('../models/index').Token
const User = require('../models/index').User
const RefreshToken = require('../models/index').Refreshtoken
const logger = require('../loaders/winstonLoader')
const EmailToken = require('../models/index').EmailToken

async function syncdatabase () {
  if (process.env.DB_SYNCHRONIZE === 'true') {
    // Create the tables
    await User.sync({ force: true})
    logger.info('User table synced')
    await Token.sync({ force: true })
    logger.info('Token table synced')
    await EmailToken.sync({ force: true })
    logger.info('Email Token table synced')
    await RefreshToken.sync({ force: true })
    logger.info('Refresh Token synced')
    await User.create({email: 'suraj@abc.com', password: 'password'})
  }
}

syncdatabase()
