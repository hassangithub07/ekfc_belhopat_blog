const { Router } = require("express")
const router = Router()

const { verifyToken } = require("../../middlewares/verifyToken")
const validate = require("../../middlewares/validate")
const { userValidation } = require("../../validations")
const { userController, blockUserController } = require('../../controllers')

router.use(verifyToken());
router
    .route('/customer_by_id')
    .get(validate(userValidation.customerById), userController.getCustomerById)
    .put(validate(userValidation.customerById), userController.updateCustomerById)
router
    .route('/customer_by_user_id/:user_id')
    .get(validate(userValidation.customerByUserId), userController.customerByUserId)
router.post("/upload_file", userController.uploadFilesAws);
router.get("/download_file/:document_name", validate(userValidation.downloadFile), userController.downloadFile);
router.get('/verify_email/:email', validate(userValidation.verifyEmail), userController.verifyEmail);

module.exports = router