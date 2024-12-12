const { Router } = require("express")
const router = Router()

const { verifyToken } = require("../../middlewares/verifyToken")
const validate = require("../../middlewares/validate")
const { userValidation } = require("../../validations")
const { userController } = require('../../controllers')


router.get('/list_all_admin', verifyToken('users-is_enabled'), validate(userValidation.listUsers), userController.listUsers('Admin'));
router.post('/create_user', verifyToken('users-is_add'), validate(userValidation.createUser), userController.createUser);
router
    .route('/user_by_id/:user_id')
    .get(verifyToken('users-is_enabled'), validate(userValidation.userById), userController.getUserById('Admin'))
    .put(verifyToken('users-is_edit'), validate(userValidation.userById), userController.updateUserById('Admin'))
    .delete(verifyToken('users-is_delete'), validate(userValidation.userById), userController.deleteUserById)
router.post("/upload_file", verifyToken(), userController.uploadFilesAws);

module.exports = router