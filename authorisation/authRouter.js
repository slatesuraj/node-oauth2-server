/**
 *
 * @param router - we assign routes and endpoint functions for each route
 *                  to this object.
 *
 * @param expressApp - an instance of the express app. By applying
 *                     expressApp.oauth.grant() method to an endpoint
 *                     the endpoint will return a bearer token
 *                     to the client if it provides calid credentials.
 *
 * @param authRoutesMethods - an object which contains the registration method. It
 *                           can be populated with other methods such as deleteUser()
 *                           if you decide to build out of this project's structure.
 * @return {route}
 */
module.exports = (router, expressApp, authRoutesMethods) => {
  /* This is the route for allowing existing users to login using a username and
    passsword. If they successfully login this method will returns the bearer token
    they need to access auth protected areas. the grant() method we pass in as
    middleware below will handle sending the bearer token back to the client as
    long as we validate their username and password properly using the mode we'll
    implement later in this tutorial. */
  router.post('/login', expressApp.oauth.grant(), authRoutesMethods.login)

  router.post('/logout', authRoutesMethods.logout)

  return router
}
