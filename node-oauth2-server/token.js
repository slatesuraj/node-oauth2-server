
var crypto = require('crypto')

var error = require('./error')

const constants = require('../constants/constants').constants

const userDBHelper = require('../dbHelpers/userHelper')

module.exports = { encrypt: encrypt, decrypt: decrypt, Token: Token, generateToken: generateToken, generateRefreshToken: generateRefreshToken }

/**
 * Token generator that will delegate to model or
 * the internal random generator
 *
 * @param  {String}   type     'accessToken' or 'refreshToken'
 * @param  {Function} callback
 */
function Token (config, type, callback) {
  if (config.model.generateToken) {
    config.model.generateRandomToken(type, config.req, function (err, token) {
      if (err) return callback(error(constants.response.SERVER_ERROR, false, err))
      if (!token) return generateRandomToken(callback)
      callback(false, token)
    })
  } else {
    generateRandomToken(callback)
  }
}

/**
 * Function to encrypt the text using the provided algorithm
 *
 * @param text
 */
async function encrypt (text) {
  // Generating random initialisation vector of 16 bytes
  // const iv = crypto.randomBytes(16);
  // const password_hash = crypto.createHash('md5').update(constants.keys.OAUTH_TOKEN_ALGO_SECRET_KEY, 'utf-8').digest('hex').toUpperCase();
  // var cipher = await crypto.createCipheriv(constants.keys.OAUTH_TOKEN_ALGO, password_hash, iv)
  var cipher = await crypto.createCipher(constants.keys.OAUTH_TOKEN_ALGO, constants.keys.OAUTH_TOKEN_ALGO_SECRET_KEY)
  var crypted = await cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

/**
 * Function to decrypt the text using the provided algorithm
 *
 * @param text
 */
async function decrypt (text) {
  var decipher = await crypto.createDecipher(constants.keys.OAUTH_TOKEN_ALGO, constants.keys.OAUTH_TOKEN_ALGO_SECRET_KEY)
  var dec = await decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

/**
 * Function to generate token using custom logic
 * @param email
 * @param password
 */
async function generateToken () {
  const buffer = await crypto.randomBytes(256)
  var token = crypto.createHash('sha1').update(buffer).digest('hex')
  return token
}

/**
 * Function to generate new token in place of old token
 * @param {string} oldToken
 */
async function generateRefreshToken () {
  const buffer = await crypto.randomBytes(128)
  var token = crypto.createHash('sha1').update(buffer).digest('hex')
  return token
}

/**
 * Internal random token generator
 *
 * @param  {Function} callback
 */
var generateRandomToken = function (callback) {
  crypto.randomBytes(256, function (ex, buffer) {
    if (ex) return callback(error(constants.response.SERVER_ERROR))

    var token = crypto
      .createHash('sha1')
      .update(buffer)
      .digest('hex')

    callback(false, token)
  })
}
