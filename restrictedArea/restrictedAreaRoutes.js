module.exports = (router, expressApp, restrictedAreaRoutesMethods) => {
  // route for entering into the restricted area.
  router.post('/authenticate', expressApp.oauth.authorise(), restrictedAreaRoutesMethods.authenticate)
  router.post('/authorise', expressApp.oauth.authorise(), restrictedAreaRoutesMethods.authorise)

  return router
}
