const bearerTokensDBHelper = require('../dbHelpers/bearerTokenHelper')

const constants = require('../constants/constants').constants

module.exports = {
  login: login,
  logout: logout
}

function login (registerUserQuery, res) {

}

/**
 * Function to logout user.
 * This API will remove access token from the database.
 * @param {*} req
 * @param {*} res
 */
async function logout (req, res) {
  const token = req.headers.token
  let error = false
  let isDestroyed = false
  if (typeof token === 'undefined' && !token) {
    error = true
  } else {
    isDestroyed = await bearerTokensDBHelper.removeToken(token)
  }
  if (error) {
    return res.status(400).json({
      'message': constants.response.INVALID_TOKEN,
      'status': false
    })
  } else {
    if (!isDestroyed) {
      return res.status(400).json({
        'message': constants.response.TOKEN_NOT_FOUND,
        'status': false
      })
    } else {
      return res.status(200).json({
        'message': constants.response.SUCCESS_DELETE_TOKEN,
        'status': true
      })
    }
  }
}

/**
 *
 * sends a response created out of the specified parameters to the client.
 *
 * @param res - response to respond to client
 * @param message - message to send to the client
 * @param error - error to send to the client
 */
function sendResponse (res, message, error) {
  /* Here e create the status code to send to the client depending on whether
    or not the error being passed in is nukk. Then, we create and send
    the json object response to the client */
  return res
    .status(error != null ? error != null ? 400 : 200 : 400)
    .json({
      'message': message,
      'error': error
    })
}
