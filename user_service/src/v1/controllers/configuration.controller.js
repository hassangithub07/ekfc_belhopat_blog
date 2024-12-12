const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { configurationService } = require('../services');

const getConfigData = catchAsync(async (req, res) => {
    try {
        const data = await configurationService.getConfigData(req.body);
        if (data.group_permissions && req.baseUrl.includes("/app")) {
            data.group_permissions = data.group_permissions.filter(e => e.is_enabled);
            for (let i = 0; i < data.group_permissions.length; i++) {
                data.group_permissions[i].permission_details = data.group_permissions[i].permission_details.filter(e => e.is_enabled);
            }
        }
        res.status(httpStatus.OK).send(data)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get config data.', details: error.message });
    }
});

const updateGroupPermissions = catchAsync(async (req, res) => {
    try {
        const set = {
            group_permissions: req.body.group_permissions
        }
        const data = await configurationService.updateConfigData(set, { group_permissions: 1 });
        res.status(httpStatus.OK).send(data)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get config data.', details: error.message });
    }
});

module.exports = {
    getConfigData,
    updateGroupPermissions
};