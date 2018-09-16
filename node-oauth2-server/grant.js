
var auth = require('basic-auth')

var error = require('./error')

var runner = require('./runner')

var token = require('./token')

const constants = require('../constants/constants').constants

module.exports = Grant

/**
 * This is the function order used by the runner
 *
 * @type {Array}
 */
var fns = [
  extractCredentials,
  checkClient,
  checkGrantTypeAllowed,
  checkGrantType,
  exposeUser,
  generateAccessToken,
  saveAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  sendResponse
]

/**
 * Grant
 *
 * @param {Object}   config Instance of OAuth object
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
function Grant (config, req, res, next) {
  this.config = config
  this.model = config.model
  this.now = new Date()
  this.req = req
  this.res = res

  runner(fns, this, next)
}

/**
 * Basic request validation and extraction of grant_type and client creds
 *
 * @param  {Function} done
 * @this   OAuth
 */
function extractCredentials (done) {
  // Only POST via application/x-www-form-urlencoded is acceptable
  if (this.req.method !== 'POST' ||
      !this.req.is('application/x-www-form-urlencoded')) {
    return done(error(constants.response.INVALID_REQUEST,
      constants.response.METHOD_MUST_BE_POST))
  }

  // Grant type
  this.grantType = this.req.body && this.req.body.grant_type
  if (!this.grantType || !this.grantType.match(this.config.regex.grantType)) {
    return done(error(constants.response.INVALID_REQUEST,
      constants.response.INVALID_MISSING_GRANT))
  }

  // Extract credentials
  this.client = credsFromBasic(this.req) || credsFromBody(this.req)
  if (!this.client.clientId ||
      !this.client.clientId.match(this.config.regex.clientId)) {
    return done(error(constants.response.INVALID_CLIENT,
      constants.response.MISSING_INVALID_CLIENT_ID))
  } else if (!this.client.clientSecret) {
    return done(error(constants.response.INVALID_CLIENT, constants.response.MISSING_CLIENT_SECRET))
  }

  done()
}

/**
 * Client Object (internal use only)
 *
 * @param {String} id     client_id
 * @param {String} secret client_secret
 */
function Client (id, secret) {
  this.clientId = id
  this.clientSecret = secret
}

/**
 * Extract client creds from Basic auth
 *
 * @return {Object} Client
 */
function credsFromBasic (req) {
  var user = auth(req)

  if (!user) return false

  return new Client(user.name, user.pass)
}

/**
 * Extract client creds from body
 *
 * @return {Object} Client
 */
function credsFromBody (req) {
  return new Client(req.body.client_id, req.body.client_secret)
}

/**
 * Check extracted client against model
 *
 * @param  {Function} done
 * @this   OAuth
 */
async function checkClient (done) {
  var self = this
  const client = await this.model.getClient(this.client.clientId, this.client.clientSecret)

  if (!client) {
    return done(error(constants.response.INVALID_CLIENT, constants.response.INVALID_CLIENT_CREDS))
  }

  // Expose validated client
  self.req.oauth = { client: client }

  done()
}

/**
 * Delegate to the relvant grant function based on grant_type
 *
 * @param  {Function} done
 * @this   OAuth
 */
function checkGrantType (done) {
  if (this.grantType.match(/^[a-zA-Z][a-zA-Z0-9+.-]+:/) &&
      this.model.extendedGrant) {
    return useExtendedGrant.call(this, done)
  }

  switch (this.grantType) {
    case constants.keys.AUTHORIZATION_CODE:
      return useAuthCodeGrant.call(this, done)
    case constants.keys.PASSWORD:
      return usePasswordGrant.call(this, done)
    case constants.keys.REFRESH_TOKEN_GRANT:
      return useRefreshTokenGrant.call(this, done)
    case constants.keys.CLIENT_CREDENTIALS:
      return useClientCredentialsGrant.call(this, done)
    default:
      done(error(constants.response.INVALID_REQUEST,
        constants.response.INVALID_MISSING_GRANT))
  }
}

/**
 * Grant for authorization_code grant type
 *
 * @param  {Function} done
 */
function useAuthCodeGrant (done) {
  var code = this.req.body.code

  if (!code) {
    return done(error(constants.response.INVALID_REQUEST, constants.response.NO_CODE_PARAMETER))
  }

  var self = this
  this.model.getAuthCode(code, function (err, authCode) {
    if (err) return done(error(constants.response.SERVER_ERROR, false, err))

    if (!authCode || authCode.clientId !== self.client.clientId) {
      return done(error(constants.response.INVALID_GRANT, constants.response.INVALID_CODE))
    } else if (authCode.expires < self.now) {
      return done(error(constants.response.INVALID_GRANT, constants.response.CODE_EXPIRED))
    }

    self.user = authCode.user || { id: authCode.userId }
    if (!self.user.id) {
      return done(error(constants.response.SERVER_ERROR, false,
        constants.response.USER_NOT_RETURNED_FROM_GETAUTHCODE))
    }

    done()
  })
}

/**
 * Grant for password grant type
 *
 * @param  {Function} done
 */
async function usePasswordGrant (done) {
  // User credentials
  var email = this.req.body.email

  var pword = this.req.body.password

  if (!email || !pword) {
    return done(error(constants.response.INVALID_CLIENT,
      constants.response.MISSING_PARAM_EMAIL_PASS))
  }

  var self = this
  const user = await this.model.getUser(email, pword)
  if (!user) {
    return done(error(constants.response.INVALID_GRANT, constants.response.INVALID_USER_CREDS))
  }

  self.user = user
  done()
}

/**
 * Grant for refresh_token grant type
 *
 * @param  {Function} done
 */
async function useRefreshTokenGrant (done) {
  var token = this.req.body.refresh_token

  if (!token) {
    return done(error(constants.response.INVALID_REQUEST, constants.response.NO_REFRESH_TOKEN_PARAM))
  }

  var self = this
  const refreshToken = await this.model.getRefreshToken(token)
  if (refreshToken !== null) {
    refreshToken.clientId = null
    refreshToken.expires = new Date().getTime()
  }

  if (!refreshToken) {
    return done(error(constants.response.INVALID_GRANT, constants.response.INVALID_REFRESH_TOKEN))
  } else if (refreshToken.expires !== null &&
      refreshToken.expires < self.now) {
    return done(error(constants.response.INVALID_GRANT, constants.response.REFRESH_TOKEN_EXPIRED))
  }

  if (!refreshToken.user && !refreshToken.userId) {
    return done(error(constants.response.SERVER_ERROR, false,
      constants.response.USER_PARAM_NOT_RETURNED_GETREFRESHTOKEN))
  }

  self.user = refreshToken.user || { id: refreshToken.userId }

  if (self.model.revokeRefreshToken) {
    return self.model.revokeRefreshToken(token, function (err) {
      if (err) return done(error(constants.response.SERVER_ERROR, false, err))
      done()
    })
  }

  done()
}

/**
 * Grant for client_credentials grant type
 *
 * @param  {Function} done
 */
function useClientCredentialsGrant (done) {
  // Client credentials
  var clientId = this.client.clientId

  var clientSecret = this.client.clientSecret

  if (!clientId || !clientSecret) {
    return done(error(constants.response.INVALID_CLIENT,
      constants.response.CLIENT_ID_SECRET_REQUIRED))
  }

  var self = this
  return this.model.getUserFromClient(clientId, clientSecret,
    function (err, user) {
      if (err) return done(error(constants.response.SERVER_ERROR, false, err))
      if (!user) {
        return done(error(constants.response.INVALID_GRANT, constants.response.INVALID_CLIENT_CREDS))
      }

      self.user = user
      done()
    })
}

/**
 * Grant for extended (http://*) grant type
 *
 * @param  {Function} done
 */
function useExtendedGrant (done) {
  var self = this
  this.model.extendedGrant(this.grantType, this.req,
    function (err, supported, user) {
      if (err) {
        return done(error(err.error || constants.response.SERVER_ERROR,
          err.description || err.message, err))
      }

      if (!supported) {
        return done(error(constants.response.INVALID_REQUEST,
          constants.response.INVALID_MISSING_GRANT))
      } else if (!user || user.id === undefined) {
        return done(error(constants.response.INVALID_REQUEST, constants.response.INVALID_REQUEST))
      }

      self.user = user
      done()
    })
}

/**
 * Check the grant type is allowed for this client
 *
 * @param  {Function} done
 * @this   OAuth
 */
async function checkGrantTypeAllowed (done) {
  const allowed = await this.model.grantTypeAllowed(this.client.clientId, this.grantType)

  if (!allowed) {
    return done(error(constants.response.INVALID_CLIENT,
      constants.response.GRANT_NOT_AUTHORIZED_CLIENT))
  }

  done()
}

/**
 * Expose user
 *
 * @param  {Function} done
 * @this   OAuth
 */
function exposeUser (done) {
  this.req.user = this.user

  done()
}

/**
 * Generate an access token
 *
 * @param  {Function} done
 * @this   OAuth
 */
async function generateAccessToken (done) {
  // if (this.grantType !== constants.keys.PASSWORD) { return done() }

  this.accessToken = await token.generateToken()
  return done(false)
}

/**
 * Save access token with model
 *
 * @param  {Function} done
 * @this   OAuth
 */
async function saveAccessToken (done) {
  var accessToken = this.accessToken

  // Object idicates a reissue
  if (typeof accessToken === 'object' && accessToken.accessToken) {
    this.accessToken = accessToken.accessToken
    return done()
  }

  var expires = null
  if (this.config.accessTokenLifetime !== null) {
    expires = new Date(this.now)
    expires.setSeconds(expires.getSeconds() + this.config.accessTokenLifetime)
  }

  expires = expires.getTime()

  const err = await this.model.saveAccessToken(accessToken, this.client.clientId, expires, this.user)
  if (err) return done(error(constants.response.SERVER_ERROR, false, err))
  done()
}

/**
 * Generate a refresh token
 *
 * @param  {Function} done
 * @this   OAuth
 */
async function generateRefreshToken (done) {
  // if (this.grantType !== constants.keys.REFRESH_TOKEN_GRANT) return done()

  this.refreshToken = await token.generateRefreshToken()

  return done(false)
}

/**
 * Save refresh token with model
 *
 * @param  {Function} done
 * @this   OAuth
 */
async function saveRefreshToken (done) {
  var refreshToken = this.refreshToken
  if (!refreshToken) return done()

  // Object idicates a reissue
  if (typeof refreshToken === 'object' && refreshToken.refreshToken) {
    this.refreshToken = refreshToken.refreshToken
    return done()
  }

  var expires = null
  if (this.config.refreshTokenLifetime !== null) {
    expires = new Date(this.now)
    expires.setSeconds(expires.getSeconds() + this.config.refreshTokenLifetime)
  }

  expires = expires.getTime()

  const err = await this.model.saveRefreshToken(refreshToken, this.client.clientId, expires, this.user)
  if (err) return done(error(constants.response.SERVER_ERROR, false, err))
  done()
}

/**
 * Create an access token and save it with the model
 *
 * @param  {Function} done
 * @this   OAuth
 */
function sendResponse (done) {
  var response = {
    token_type: constants.keys.TOKEN_TYPE_BEARER,
    access_token: this.accessToken
  }

  if (this.config.accessTokenLifetime !== null) {
    response.expires_in = this.config.accessTokenLifetime
  }

  if (this.refreshToken) response.refresh_token = this.refreshToken

  this.res
    .set('Cache-Control', 'no-store')
    .set('Pragma', 'no-cache')
    .jsonp(response)

  if (this.config.continueAfterResponse) { done() }
}
