const { Router } = require("express")
const router = Router()

const { verifyToken } = require("../../middlewares/verifyToken")
const validate = require("../../middlewares/validate")
const { notificationValidation } = require("../../validations")
const { notificationController } = require('../../controllers')

router.use(verifyToken());
router.get("/list_notifications", validate(notificationValidation.fetchNotifications), notificationController.listNotifications)

module.exports = router