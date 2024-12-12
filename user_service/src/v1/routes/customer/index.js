const express = require('express');
const router = express.Router()

const authRouter = require("./auth.route")
const configurationRouter = require("./configuration.route")
const customerRoute = require("./customer.route")
const notificationRoute = require("./notification.route")

const defaultRoutes = [
    { path: '/auth', route: authRouter },
    { path: '/configuration', route: configurationRouter },
    { path: "/customer", route: customerRoute },
    { path: "/notification", route: notificationRoute },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});


module.exports = router;