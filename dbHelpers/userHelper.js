const User = require('../models/index').User
const logger = require('../loaders/winstonLoader')

/**
 * Gets the user with the specified email and password.
 * and a user object which will be null if there is no user
 *
 * @param email
 * @param password
 */
async function getUserFromCrentials (email, password) {
  const user = await User.findOne({ where: { email: email, password: password } })

  if (user !== null) {
    return user['dataValues']
  }

  return user
}

/**
 * Get the user with userkey
 * @param userkey
 */
async function getUserFromUserKey (userkey) {
  const user = await User.findOne({ where: { userkey: userkey } })

  if (user !== null) {
    return user['dataValues']
  }

  return user
}

/**
 * Create a new user
 * @param userobj
 */
async function createUser (email, password, fname, lname) {
  try {
    const user = await User.create({email: email, password: password, firstName: fname, lastName: lname})
    return user
  } catch (err) {
    logger.error('Failed to create user. Error occured as :: '+err)
    return null
  }
}

async function verifyEmail (userkey) {
  await User.update({isEmailVerified: true},{where: {userkey: userkey}})
  return true
}

module.exports = {
  getUserFromCrentials: getUserFromCrentials,
  getUserFromUserKey: getUserFromUserKey,
  createUser: createUser,
  verifyEmail: verifyEmail
}
