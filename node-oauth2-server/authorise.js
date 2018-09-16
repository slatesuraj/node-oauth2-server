
var error = require('./error')

var runner = require('./runner')

const constants = require('../constants/constants').constants

module.exports = Authorise

/**
 * This is the function order used by the runner
 *
 * @type {Array}
 */
var fns = [
  getBearerToken,
  checkToken
]

/**
 * Authorise
 *
 * @param {Object}   config Instance of OAuth object
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
function Authorise (config, req, next) {
  this.config = config
  this.model = config.model
  this.req = req

  runner(fns, this, next)
}

/**
 * Get bearer token
 *
 * Extract token from request according to RFC6750
 *
 * @param  {Function} done
 * @this   OAuth
 */
function getBearerToken (done) {
  var headerToken = this.req.get('Authorization')

  var getToken = this.req.query.access_token

  var postToken = this.req.body ? this.req.body.access_token : undefined

  // Check exactly one method was used
  var methodsUsed = (headerToken !== undefined) + (getToken !== undefined) +
    (postToken !== undefined)

  if (methodsUsed > 1) {
    return done(error(constants.response.INVALID_REQUEST,
      'Only one method may be used to authenticate at a time (Auth header,  ' +
        'GET or POST).'))
  } else if (methodsUsed === 0) {
    return done(error(constants.response.INVALID_REQUEST, 'The access token was not found'))
  }

  if (headerToken) {
    var matches = headerToken.match(/Bearer\s(\S+)/)

    if (!matches) {
      return done(error(constants.response.INVALID_REQUEST, 'Malformed auth header'))
    }

    headerToken = matches[1]
  }

  if (postToken) {
    if (this.req.method === 'GET') {
      return done(error(constants.response.INVALID_REQUEST,
        'Method cannot be GET When putting the token in the body.'))
    }

    if (!this.req.is('application/x-www-form-urlencoded')) {
      return done(error(constants.response.INVALID_REQUEST, 'When putting the token in the ' +
        'body, content type must be application/x-www-form-urlencoded.'))
    }
  }

  this.bearerToken = headerToken || postToken || getToken
  done()
}

/**
 * Check token
 *
 * Check it against model, ensure it's not expired
 * @param  {Function} done
 * @this   OAuth
 */
async function checkToken (done) {
  var self = this
  const token = await this.model.getAccessToken(this.bearerToken)

  if (!token) {
    return done(error(constants.response.INVALID_TOKEN,
      constants.response.INVALID_ACCESS_TOKEN))
  }

  if (token.expires !== null &&
    (!token.expires || token.expires < new Date().getTime())) {
    return done(error(constants.response.INVALID_TOKEN,
      constants.response.ACCESS_TOKEN_EXPIRED))
  }

  // Expose params
  self.req.oauth = { bearerToken: token }
  self.req.user = token.user ? token.user : { id: token.userId }

  done()
}
