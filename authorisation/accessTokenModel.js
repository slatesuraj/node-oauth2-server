const userDBHelper = require('../dbHelpers/userHelper')
const bearerTokensDBHelper = require('../dbHelpers/bearerTokenHelper')
const logger = require('../loaders/winstonLoader')

module.exports = {
  getClient: getClient,
  grantTypeAllowed: grantTypeAllowed,
  getUser: getUser,
  saveAccessToken: saveAccessToken,
  getAccessToken: getAccessToken,
  getRefreshToken: getRefreshToken,
  saveRefreshToken: saveRefreshToken
}

/**
 *
 * This method returns the client application which is attempting to get the
 * accessToken. The client is normally found using the clientID & clientSecret
 * and validated using the clientSecrete. However, with user facing client applications
 * such as mobile apps or websites which use the password grantType we don't use the
 * clientID or clientSecret in the authentication flow.  Therefore, although the client
 * object is required by the library all of the client's fields can be  be null. This
 also includes the grants field. Note that we did, however, specify that we're using the
 * password grantType when we made the* oAuth object in the index.js file.
 *
 * @param clientID - used to find the clientID
 * @param clientSecret - used to validate the client
 * @param callback
 *
 * The callback takes 2 parameters. The first parameter is an error of type falsey
 * and the second is a client object. As we're not retrieving the client using the
 * clientID and clientSecret (as we're using the password grantt type) we can just
 * create an empty client with all null values. Because the client is a hardcoded
 * object - as opposed to a clientwe've retrieved through another operation - we just
 * pass false for the error parameter as no errors can occur due to the aforemtioned
 * hardcoding.
 */
function getClient (clientID, clientSecret) {
  // create the the client out of the given params.
  // It has no functional role in grantTypes of type password
  const client = {
    clientID,
    clientSecret,
    grants: null,
    redirectUris: null
  }

  return client
}

/**
 *
 * This method determines whether or not the client which has to the specified clientID
 * is permitted to use the specified grantType.
 *
 * @param clientID
 * @param grantType
 * @param callback
 *
 * The callback takes an error of type truthy, and a boolean which indcates whether the
 * client that has the specified clientID* is permitted to use the specified grantType.
 * As we're going to hardcode the response no error can occur hence we return false for
 * the error and as there is there are no clientIDs to check we can just return true to
 * indicate the client has permission to use the grantType.
 */
function grantTypeAllowed (clientID, grantType) {
  logger.info('grantTypeAllowed called and clientID is: ' + clientID + ' and grantType is: ' + grantType)

  return true
}

/**
 * The method attempts to find a user with the spceified email and password.
 *
 * @param email
 * @param password
 * The callback takes 2 parameters.
 * This first parameter is an error of type truthy, and the second is a user object.
 * You can decide the structure of the user object as you will be the one accessing
 * the data that it contains in the saveAccessToken() method. The library doesn't
 * access the user object it just supplies it to the saveAccessToken() method
 */
async function getUser (email, password) {
  logger.info('getUser() called and email is: ' + email + ' and password is: ' + password + ' and is userDBHelper is: ' + userDBHelper)

  // try and get the user using the user's credentials
  const creds = await userDBHelper.getUserFromCrentials(email, password)
  return creds
}

/**
 * saves the accessToken along with the userID retrieved from the given user
 *
 * @param accessToken
 * @param clientID
 * @param expires
 * @param user
 */
async function saveAccessToken (accessToken, clientID, expires, user) {
  logger.info('saveAccessToken() called and accessToken is: ' + accessToken +
  ' and clientID is: ' + clientID + ' and user is: ' + user + ' and bearerTokensDBhelper is: ' + bearerTokensDBHelper + 'and expires is: ' + expires)

  if (typeof accessToken === 'undefined') {
    return false
  }

  // save the accessToken along with the user.id
  const errResp = await bearerTokensDBHelper.saveAccessToken(accessToken, user.userkey, expires)

  return errResp
}

/**
 * This method is called to validate a user when they're calling APIs
 * that have been authenticated. The user is validated by verifying the
 * bearerToken which must be supplied when calling an endpoint that requires
 * you to have been authenticated. We can tell if a  bearer token is valid
 * if passing it to the getUserIDFromBearerToken() method returns a userID.
 * It's able to return a userID because each row in the access_tokens table
 * has a userID in itbecause we store it along with the userID when we save
 * the bearer token. So, as they're bothpresent in the same row in the db we
 * should be able to use the bearerToken to query for a row  which will have
 a userID in it.
 *
 * @param bearerToken
 * The function takes 1 parameters:
 *
 * 1. A truthy boolean indicating whether or not an error has occured. It
 should be set to a truthy if there is an error or a falsy if there is no
 error
 *
 * 2. An accessToken which will be accessible in the  req.user object on
 * endpoints that are authenticates
 */
async function getAccessToken (bearerToken) {
  // try and get the user from the db using the bearerToken
  const userData = await bearerTokensDBHelper.getUserFromBearerToken(bearerToken)

  if (userData === null) {
    return null
  }

  // create the token using the retrieved userID
  const accessToken = {
    user: {
      id: userData.userkey
    },
    expires: userData.generatedAt
  }

  // set the error to true if userID is null, and pass in the token if there is a userID else pass null
  return accessToken
}

/**
 *
 * This method will refresh token of user and will return a new token.
 * The user is validated by expired access_token.
 * The access_token will be provided with grant_type as refresh_token.
 * This function needs to be invoked when user access token is expired.
 *
 * @param refreshToken
 *
 */
async function getRefreshToken (refreshToken) {
  // try and get the user from the db using the bearerToken
  const userData = await bearerTokensDBHelper.getUserFromRefreshToken(refreshToken)

  // return null if user not found
  if (userData === null) {
    return null
  }

  const respData = {
    'expires': 300,
    'user': userData,
    'userId': userData.user_id
  }
  return respData
}

/**
 *
 * This method will update access token in database corresponding to userID.
 *
 * @param refreshToken
 * @param clientID
 * @param expires
 * @param user
 */
async function saveRefreshToken (refreshToken, clientID, expires, user) {
  logger.info('saveRefreshToken() called and refreshToken is: ' + refreshToken +
  ' and clientID is: ' + clientID + ' and user is: ' + user + ' and bearerTokensDBhelper is: ' + bearerTokensDBHelper + 'and expires is: ' + expires)

  // save the refreshToken along with the user.id
  const errResp = await bearerTokensDBHelper.saveRefreshToken(refreshToken, user.userkey, expires)

  return errResp
}
