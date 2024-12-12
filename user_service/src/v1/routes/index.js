const express = require('express')
const customerRoute = require('./customer');
const adminRoute = require('./admin');

const router = express.Router()

const defaultRoutes = [
  { path: '/app', route: customerRoute },
  { path: '/admin', route: adminRoute },
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route)
})

module.exports = router
