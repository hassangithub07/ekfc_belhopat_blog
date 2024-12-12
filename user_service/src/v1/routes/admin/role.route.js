const express = require('express');
const validate = require('../../middlewares/validate');
const { verifyToken } = require("../../middlewares/verifyToken")
const roleValidation = require('../../validations/role.validation');
const roleController = require('../../controllers/role.controller');

const router = express.Router();

router.post('/create_roles', verifyToken('roles-is_add'), validate(roleValidation.createRole), roleController.createRole);
router.get('/list_roles', verifyToken('roles-is_enabled'), validate(roleValidation.listRoles), roleController.listRoles);
router.get('/list_role_names', roleController.listRoleNames);
router.get('/fetch_role_details', verifyToken(), roleController.listRoleDetails);
router
    .route('/role_by_id/:role_id')
    .get(verifyToken('roles-is_enabled'), validate(roleValidation.roleById), roleController.getRoleById)
    .put(verifyToken('roles-is_edit'), validate(roleValidation.roleById), roleController.updateRoleById)
    .delete(verifyToken('roles-is_delete'), validate(roleValidation.roleById), roleController.deleteRoleById)

module.exports = router;