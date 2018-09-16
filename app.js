// Loading .env file for fetching environment variables
require('dotenv').config({ path: './.env' })

// Initialising logger and synchronising database with models using sequelize ORM
const logger = require('./loaders/winstonLoader')

require('./loaders/pgconnector')

require('./dbHelpers/syncdb')

require('./loaders/nodesendemail')

const constants = require('./constants/constants').constants

/* This is a library used to help parse the body of the api requests. */
const bodyParser = require('body-parser')

// Require express
const express = require('express')

// Initialise the express app
const expressApp = express()

/* We require the node-oauth2-server library */
const oAuth2Server = require('./node-oauth2-server/oauth2server')

expressApp.use(bodyParser.urlencoded({ extended: true }))

/* Here we instantiate the model we just made and inject the dbHelpers we use in it */
const oAuthModel = require('./authorisation/accessTokenModel')

/* Now we instantiate the oAuth2Server and pass in an object which tells
the the password library that we're using the password  grant type and
give it the model we just required. */
expressApp.oauth = oAuth2Server({
  model: oAuthModel,
  grants: constants.values.GRANTS,
  accessTokenLifetime: constants.values.ACCESS_TOKEN_LIFE,
  debug: true
})

/* Here we require the authRoutesMethods object from the module that we just made */
const authRoutesMethods = require('./authorisation/authRoutesMethods')

const restrictedAreaRoutesMethods = require('./restrictedArea/restrictedAreaRoutesMethods.js')
const restrictedAreaRoutes = require('./restrictedArea/restrictedAreaRoutes.js')(express.Router(), expressApp, restrictedAreaRoutesMethods)

/* Now we instantiate the authRouter module and inject all
of its dependencies. */
const authRouter = require('./authorisation/authRouter')(express.Router(), expressApp, authRoutesMethods)

const userRouteMethods = require('./registration/userRouteMethods')
const userRoutes = require('./registration/userRouter')(express.Router(), userRouteMethods)

/* Here we asign the authRouter as middleware in the express app.
 By doing this all request sent to routes that start with /auth
 will be handled by this router */
expressApp.use('/auth', authRouter)

// set the restrictedAreaRoutes used to demo the accesiblity or routes that ar OAuth2 protected
expressApp.use('/restrictedArea', restrictedAreaRoutes)

expressApp.use('/user', userRoutes)

/* Setup the oAuth error handling */
expressApp.use(expressApp.oauth.errorHandler())

// init the server
expressApp.listen(process.env.APP_PORT, () => {
  logger.debug(`listening on port ${process.env.APP_PORT}`)
})
