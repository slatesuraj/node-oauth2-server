const Token = require('../models/index').Token
const RefreshToken = require('../models/index').Refreshtoken
const logconstants = require('../constants/constants').constants
const logger = require('../loaders/winstonLoader')

/**
 * Saves the accessToken against the user with the specified userID
 *
 * @param accessToken
 * @param userID
 * @param expires
 */
async function saveAccessToken (accessToken, userID, expires) {
  const tokenResp = await Token.findOne({ where: { userkey: userID } }).then(async function (obj) {
    if (obj) { // update
      await obj.update({ accesstoken: accessToken, generatedAt: expires })
      return false
    } else { // insert
      await Token.create({ accesstoken: accessToken, generatedAt: expires, userkey: userID })
      return false
    }
  }).catch((err) => {
    logger.error(logconstants.error.ERROR_SAVING_UPDATING_TOKEN + err)
    return true
  })

  return tokenResp
}

/**
 * Saves the refreshtoken against the user with the specified userID
 *
 * @param refreshtoken
 * @param userID
 * @param expires
 */
async function saveRefreshToken (refreshtoken, userID, expires) {
  const tokenResp = await RefreshToken.findOne({ where: { userkey: userID } }).then(async function (obj) {
    if (obj) { // update
      await obj.update({ refreshtoken: refreshtoken, generatedAt: expires })
      return false
    } else { // insert
      await RefreshToken.create({ refreshtoken: refreshtoken, generatedAt: expires, userkey: userID })
      return false
    }
  }).catch((err) => {
    logger.error(logconstants.error.ERROR_SAVING_UPDATING_TOKEN + err)
    return true
  })

  return tokenResp
}

/**
 * Updates the accessToken against the user with userID and expiry.
 *
 * @param access_token
 * @param userID
 * @param expires
 */
async function updateAccessToken (accessToken, userID, expires) {
  const updatedToken = await Token.update({ token: accessToken, generatedAt: expires }, { where: { userkey: userID } })

  // returns [1] or [0] where 1 represents success and 0 represents failure
  if (updatedToken[0] === 1) {
    return false
  }
  return true
}

/**
 * Retrieves the userID from the row which has the spcecified bearerToken. It passes the userID
 * to the callback if it has been retrieved else it passes null
 *
 * @param bearerToken
 */
async function getUserFromBearerToken (bearerToken) {
  const token = await Token.findOne({ where: { accesstoken: bearerToken } })

  if (token !== null) {
    return token['dataValues']
  }
  return token
}

/**
 * Retrieves the userID from the row which has the spcecified refreshToken. It passes the userID
 * to the callback if it has been retrieved else it passes null
 *
 * @param refreshToken
 */
async function getUserFromRefreshToken (refreshToken) {
  const token = await RefreshToken.findOne({ where: { refreshtoken: refreshToken } })

  if (token !== null) {
    return token['dataValues']
  }
  return token
}

/**
 * This method will remove access token from the database.
 *
 * @param accessToken
 */
async function removeToken (accessToken) {
  logger.info(`removing token from token table. Token is :: ${accessToken}`)
  const token = await Token.destroy({
    where: {
      accesstoken: accessToken
    }
  })

  return token === 1
}

module.exports = {
  getUserFromBearerToken: getUserFromBearerToken,
  updateAccessToken: updateAccessToken,
  saveAccessToken: saveAccessToken,
  removeToken: removeToken,
  saveRefreshToken: saveRefreshToken,
  getUserFromRefreshToken: getUserFromRefreshToken
}
