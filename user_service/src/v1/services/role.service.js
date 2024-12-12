const { Role } = require('../models')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError');

/**
 * Create Role
 * @param {Object} body
 * @returns {Promise<Role>}
 */
const createRole = async function (body, user_id) {
    try {
        body.created_by = user_id;
        return await Role.create(body);
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
}

/**
 * Find Role by filter
 * @param {Object} filter
 * @returns {Promise<Role>}
 */
const findOneRoleByFilter = async (filter, params) => {
    return await Role.findOne(filter, params);
};

/**
 * Find Role by filter
 * @param {Object} filter
 * @returns {Promise<Role>}
 */
const findRoleByFilter = async (filter, params) => {
    return await Role.find(filter, params);
};

/**
 * Update Role by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const findByIdAndUpdate = async (id, set) => {
    return await Role.findOneAndUpdate({ _id: id }, { $set: set }, { new: true });
};

/**
 * Update Role by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const updateById = async (id, set) => {
    return await Role.updateOne({ _id: id }, { $set: set });
};

// List the Roles with pagination
const fetchRoles = async (filter, options) => {
    return await Role.paginate(filter, options);
};

module.exports = {
    findOneRoleByFilter,
    findRoleByFilter,
    createRole,
    findByIdAndUpdate,
    updateById,
    fetchRoles
};