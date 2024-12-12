const { Router } = require("express")
const router = Router()

const { verifyToken } = require("../../middlewares/verifyToken")
const validate = require("../../middlewares/validate")
const { userValidation } = require("../../validations")
const { userController } = require('../../controllers')

router.get('/list_all_customer', verifyToken('customers-is_enabled'), validate(userValidation.listUsers), userController.listUsers('Customer'));
// router.get('/list_customer_search', verifyToken('customers-is_enabled'), validate(userValidation.listUsers), userController.listUsers('Customer'));
router.post('/create_customer', verifyToken('customers-is_add'), validate(userValidation.createCustomer), userController.createCustomer);
router
    .route('/customer_by_id/:user_id')
    .get(verifyToken('customers-is_enabled'), validate(userValidation.userById), userController.getUserById('Admin'))
    .put(verifyToken('customers-is_edit'), validate(userValidation.userById), userController.updateUserById('Admin'))
    .delete(verifyToken('customers-is_delete'), validate(userValidation.userById), userController.deleteUserById)

module.exports = router