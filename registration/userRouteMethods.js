const constants = require('../constants/constants').constants
const userHelper = require('../dbHelpers/userHelper')
const emailHelper = require('../emailHelper/sendMail')
const token = require('../node-oauth2-server/token')
const logger = require('../loaders/winstonLoader')
const emailTokenHelper = require('../dbHelpers/emailTokenHelper')

/**
 * Function to register user.
 * @param {*} req
 * @param {*} res
 */
async function register (req, res) {
    const email = req.body.email
    const password = req.body.password
    const firstName = req.body.firstName
    const lastName = req.body.lastName

    if (typeof email !== 'undefined' && !email && typeof password !== 'undefined' && !password) {
        return sendResponse(res, constants.response.MISSING_PARAM_EMAIL_PASS, null)
    }

    const user = await userHelper.createUser(email, password, firstName, lastName)
    
    if (typeof user !== 'undefined' && user) {
        await emailHelper.sendVerificationMail(email, user.userkey)
        return sendResponse(res, constants.response.USER_CREATED, null)
    }

    return sendResponse(res, 'Failed To Create User', null)
}


async function validateToken (req, res) {
    try {
        const mytoken = req.params.token
        const userkey = parseInt(req.params.id)
        if (typeof mytoken !== 'undefined' && !mytoken) {
            return sendResponse(res, constants.response.PAGE_EXPIRED, null)
        }
        const message = await token.decrypt(mytoken)
        const currentTime = new Date().getTime()
    
        const isValidated = await emailTokenHelper.removeEmailToken(mytoken, userkey)
        if (!isValidated) {
          return sendResponse(res, constants.response.INVALID_TOKEN, true)
        }
        if ((currentTime - parseInt(message)) < constants.values.EMAIL_TOKEN_LIFE) {
            await userHelper.verifyEmail(userkey)
            return sendResponse(res, constants.response.EMAIL_VERIFIED, null)
        } else {
            return sendResponse(res, constants.response.TOKEN_EXPIRED, true)
        }
    } catch (err) {
        logger.error(`Error while decrypting token :: ${err}`)
        return sendResponse(res, constants.response.INVALID_TOKEN, true)
    }
}


async function logout (req, res) {
    const token = req.body.access_token

    if (typeof token !== 'undefined' && token) {
        return sendResponse(res, constants.response.MISSING_PARAM_EMAIL_PASS, null)
    }

    const user = await userHelper.removeTokens(token)

    return sendResponse(res, constants.response.USER_LOGOUT, null)
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
    return res.status(error != null ? error != null ? 400 : 200 : 400)
    .json({
    'message': message,
    'error': error
    })
}

module.exports = {
    register: register,
    validateToken: validateToken,
    logout: logout
}