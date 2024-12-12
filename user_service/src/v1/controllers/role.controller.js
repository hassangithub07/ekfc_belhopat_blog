const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')
const { roleService } = require('../services')
const pick = require('../utils/pick')

const createRole = catchAsync(async (req, res) => {
    try {
        let data = await roleService.createRole(req.body, req.user._id);
        res.status(httpStatus.OK).send(data)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to create role.', details: error.message });
    }
});

const getRoleById = catchAsync(async (req, res) => {
    try {
        const role = await roleService.findOneRoleByFilter({ _id: req.params.role_id, is_deleted: false })
        if (role) {
            res.status(httpStatus.OK).send(role)
        } else {
            res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get role.', details: 'Role not found.' });
        }
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get role.', details: error.message });
    }
});

const listRoleNames = catchAsync(async (req, res) => {
    try {
        const role = await roleService.findRoleByFilter({ is_deleted: false }, { role_name: 1 });
        res.status(httpStatus.OK).send(role)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to list names.', details: error.message });
    }
});

const listRoleDetails = catchAsync(async (req, res) => {
    try {
        const role = await roleService.findOneRoleByFilter({ _id: req.user.role_id, is_deleted: false });
        res.status(httpStatus.OK).send(role)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get role.', details: error.message });
    }
});

const updateRoleById = catchAsync(async (req, res) => {
    try {
        const role = await roleService.findOneRoleByFilter({ _id: req.params.role_id, is_deleted: false }, { role_name: 1 })
        if (role) {
            await roleService.updateById(req.params.role_id, req.body);
            res.status(httpStatus.OK).send('Roles updated successfully.')
        } else {
            res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update role.', details: 'Role not found.' });
        }
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update role.', details: error.message });
    }
});

const deleteRoleById = catchAsync(async (req, res) => {
    try {
        const role = await roleService.findOneRoleByFilter({ _id: req.params.role_id, is_deleted: false }, { role_name: 1 })
        if (role) {
            await roleService.updateById(req.params.role_id, { is_deleted: true });
            res.status(httpStatus.OK).send('Role deleted successfully.')
        } else {
            res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to delete role.', details: 'Role not found.' });
        }
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to delete role.', details: error.message });
    }
});

const listRoles = catchAsync(async (req, res) => {
    try {
        let filter = {
            is_deleted: false
        }
        if (req.query.searchText) {
            filter.$text = {
                $search: '\"' + req.query.searchText + '\"'
            }
        }
        const options = pick(req.query, ['sortBy', 'limit', 'page']);
        const data = await roleService.fetchRoles(filter, options);
        res.status(httpStatus.OK).send(data)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get role.', details: error.message });
    }
});

module.exports = {
    createRole,
    getRoleById,
    updateRoleById,
    deleteRoleById,
    listRoles,
    listRoleNames,
    listRoleDetails
}

