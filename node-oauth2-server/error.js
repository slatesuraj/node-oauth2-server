
var util = require('util')

module.exports = OAuth2Error

/**
 * Error
 *
 * @param {Number} code        Numeric error code
 * @param {String} error       Error descripton
 * @param {String} description Full error description
 */
function OAuth2Error (error, description, err) {
  if (!(this instanceof OAuth2Error)) { return new OAuth2Error(error, description, err) }

  Error.call(this)

  this.name = this.constructor.name
  if (err instanceof Error) {
    this.message = err.message
    this.stack = err.stack
  } else {
    this.message = description
    Error.captureStackTrace(this, this.constructor)
  }

  this.headers = {
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache'
  }

  switch (error) {
    case 'invalid_client':
      this.headers['WWW-Authenticate'] = 'Basic realm="Service"'
      /* falls through */
    case 'invalid_grant':
    case 'invalid_request':
      this.code = 400
      break
    case 'invalid_token':
      this.code = 401
      break
    case 'server_error':
      this.code = 503
      break
    default:
      this.code = 500
  }

  this.error = error
  this.error_description = description || error
}

util.inherits(OAuth2Error, Error)
