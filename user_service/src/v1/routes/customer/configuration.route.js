

const express = require('express');
const validate = require('../../middlewares/validate');
const { verifyToken } = require("../../middlewares/verifyToken")
const { configurationValidation } = require('../../validations');
const { configurationController } = require('../../controllers');

const router = express.Router();
router.use(verifyToken());

router.post("/get_config_data", validate(configurationValidation.getConfigDataCustomer), configurationController.getConfigData)

module.exports = router;