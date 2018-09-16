const token = require('../node-oauth2-server/token')
const logger = require('../loaders/winstonLoader')
const constants = require('../constants/constants').constants
const emailTokenHelper = require('../dbHelpers/emailTokenHelper')
const transporter = require('../loaders/nodesendemail').transporter;

/**
 * Function to generate email token which is used by application server for sending email verification
 * @param {*} req
 * @param {*} res
 */
async function sendVerificationMail (email, userkey) {
  const currentTime = new Date().getTime()
  const emailtoken = await token.encrypt(currentTime.toString())
  const isSaved = await emailTokenHelper.saveEmailToken(emailtoken, userkey)

  if (isSaved) {
    const maildata = {
        from: constants.values.SENDER_EMAIL,
        to: email,
        subject: constants.values.MAIL_SUBJECT,
        html: 'Mail of test sendmail '+ constants.values.VERIFY_TOKEN_URL + userkey + '/' + emailtoken,
    }
    transporter.sendMail(maildata)
    return true
  } else {
    return false
  }
}

/**
 * Function to validate the email token.
 * @param {token} req
 * @param {*} res
 */
async function validate (req, res) {
  try {
    const tokenMessage = req.get(constants.keys.TOKEN)
    const message = await token.decrypt(tokenMessage)
    const currentTime = new Date().getTime()

    if (typeof req.headers.userkey === 'undefined' && !req.headers.userkey) {
      return sendResponse(res, true, false, constants.response.INVALID_REQUEST, constants.values.INVALID_REQUEST_CODE)
    }

    const isValidated = await emailTokenHelper.removeEmailToken(tokenMessage, req.headers.userkey)
    if (!isValidated) {
      return sendResponse(res, true, false, constants.response.INVALID_TOKEN, constants.values.INVALID_TOKEN_CODE)
    }

    if ((currentTime - parseInt(message)) < constants.values.EMAIL_TOKEN_LIFE) {
      return sendResponse(res, false, true, constants.response.SUCCESS, constants.values.SUCCESS_CODE)
    } else {
      return sendResponse(res, true, false, constants.response.TOKEN_EXPIRED, constants.values.TOKEN_EXPIRED_CODE)
    }
  } catch (err) {
    logger.error(`Error while decrypting token :: ${err}`)
    return sendResponse(res, true, false, constants.response.INVALID_TOKEN, constants.values.INVALID_TOKEN_CODE)
  }
}

module.exports = {
  sendVerificationMail: sendVerificationMail,
  validate: validate
}
