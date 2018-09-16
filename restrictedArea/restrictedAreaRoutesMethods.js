const tokenOperation = require('../node-oauth2-server/token')
const userdbHelper = require('../dbHelpers/userHelper')
const logger = require('../loaders/winstonLoader')
const constants = require('../constants/constants').constants

/**
 * Function to authenticate end user request
 * @param {*} req
 * @param {*} res
 */
function authenticate (req, res) {
  return sendResponse(res, false, true, constants.response.ACCESS_GRANTED, constants.values.SUCCESS_CODE)
}

/**
 * Funtion to authorise end user request
 * @param {*} req
 * @param {*} res
 */
async function authorise (req, res) {
  const component = parseInt(req.headers.component)
  const bearertoken = req.headers.authorization
  const operation = parseInt(req.headers.operation)

  if (typeof component === 'undefined' && !component && typeof bearertoken === 'undefined' && !bearertoken && typeof operation === 'undefined' && !operation) {
    return res.status(400).json({
      'message': constants.response.INVALID_REQUEST,
      'status': false
    })
  }

  const token = bearertoken.split(' ')[1]

  /** operation 1 stants for create, 2 stants for delete, 3 stants for update, 4 stands for list, 5 stands for view, 6 stands for list
  * {'userkey': 12, 'permission': [{'comp':1,'op':[2,3]},{'comp':2,'op':[1,3]}]}
  * Here {'comp':1,'op':[2,3]} represents 1 as component and 2 as operation
  */
  const plainText = await tokenOperation.decrypt(token)

  var isAllowed = false

  try {
    const parsedText = JSON.parse(plainText)
    const user = await userdbHelper.getUserFromUserKey(parsedText.userkey)

    if (typeof user !== 'undefined' && user) {
      parsedText.permission.forEach(element => {
        if (element.comp === component) {
          if (element.op.includes(operation)) {
            isAllowed = true
          }
        }
      })
    }
  } catch (err) {
    logger.error(constants.response.UNABLE_TO_PARSE_TOKEN + err)
    return sendResponse(res, true, false, constants.response.PARSING_TOKEN_ERROR, constants.values.PARSING_TOKEN_ERROR)
  }

  if (isAllowed) {
    return sendResponse(res, false, true, constants.response.USER_AUTHORISED, constants.values.SUCCESS_CODE)
  }
  return sendResponse(res, false, false, constants.response.USER_NOT_AUTHORISED, constants.values.NOT_AUTHORISED)
}

/**
 * Function to send API response
 * Code 100 represents success, 101 represents Token expired, 102 represents Token invalid
 * 103 represents Invalid Request, 104 represents unable to save token, 105 represents Not Authorised
 * 106 represents Unable to parse token error.
 * @param {Response} res
 * @param {Boolean} error
 * @param {Boolean} status
 * @param {String} message
 * @param {number} code
 */
function sendResponse (res, error, status, message, code, ...other) {
  if (!other.length) {
    return res.status(error === true ? 400 : 200).json({
      'status': status,
      'message': message,
      'code': code
    })
  }
  return res.status(error === true ? 400 : 200).json({
    'status': status,
    'message': message,
    'code': code,
    'token': other[0]
  })
}

module.exports = {
  authenticate: authenticate,
  authorise: authorise
}
