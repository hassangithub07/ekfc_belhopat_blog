const express = require('express');
const router = express.Router()

const authRouter = require("./auth.route")
const configurationRouter = require("./configuration.route")
const customerRoute = require("./customer.route")
const roleRoute = require("./role.route")
const userRoute = require("./user.route")

const defaultRoutes = [
    { path: '/auth', route: authRouter },
    { path: '/configuration', route: configurationRouter },
    { path: "/customer", route: customerRoute },
    { path: "/role", route: roleRoute },
    { path: "/user", route: userRoute },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});


module.exports = router;