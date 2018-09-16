const EmailToken = require('../models/index').EmailToken
const logger = require('../loaders/winstonLoader')
const constants = require('../constants/constants').constants

/**
 * Function to save email token in database.
 *
 * @param emailToken
 * @param userkey
 */
async function saveEmailToken (emailToken, userID) {
  const tokenResp = await EmailToken.findOne({ where: { userkey: userID } }).then(async function (obj) {
    if (obj) { // update
      await obj.update({ token: emailToken })
      return true
    } else { // insert
      await EmailToken.create({ token: emailToken, userkey: userID })
      return true
    }
  }).catch((err) => {
    logger.error(constants.error.ERROR_SAVING_UPDATING_TOKEN + err)
    return false
  })

  return tokenResp
}

/**
 * Function to get remove email token from database.
 *
 * @param emailToken
 * @param userkey
 */
async function removeEmailToken (emailToken, userkey) {
  const tokenResp = await EmailToken.destroy({
    where: { userkey: userkey, token: emailToken }
  })

  return tokenResp === 1
}

module.exports = {
  saveEmailToken: saveEmailToken,
  removeEmailToken: removeEmailToken
}
