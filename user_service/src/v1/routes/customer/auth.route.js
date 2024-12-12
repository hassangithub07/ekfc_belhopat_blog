const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
// const auth = require('../../middlewares/auth');
const { verifyToken } = require("../../middlewares/verifyToken")

const router = express.Router();

router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh_tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/register', validate(authValidation.registerCustomer), authController.registerCustomer);

router.use(verifyToken());
// router.post('/forgot_password', validate(authValidation.forgotPassword), authController.forgotPassword);
// router.post('/reset_password', validate(authValidation.resetPassword), authController.resetPassword);

module.exports = router;