const { Blog } = require('../models')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError');

/**
 * Create Blog
 * @param {Object} body
 * @returns {Promise<Blog>}
 */
const createBlog = async function (body, user_id) {
    try {
        body.created_by = user_id;
        return await Blog.create(body);
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
}

/**
 * Get blog by filter
 * @param {Object} filter
 * @param {Object} project
 * @returns {Promise<Blog>}
 */
const findOneBlogByFilter = async (filter, project = {}) => {
    return await Blog.findOne(filter, project);
};

/**
 * Update Blog by id
 * @param {ObjectId} id
 * @returns {Promise<Blog>}
 */
const updateById = async (id, set) => {
    try {
        return await Blog.updateOne({ _id: id }, set);
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

// List the Blogs with pagination
const fetchBlogs = async (filter, options, body) => {
    return await Blog.paginateLookup(filter, options, body);
};

/**
 * Get counts of Blog
 * @param {Object} filter
 * @returns {Promise<Blog>}
 */
const countBlog = async (filter) => {
    return await Blog.countDocuments(filter);
};

module.exports = {
    createBlog,
    findOneBlogByFilter,
    updateById,
    fetchBlogs,
    countBlog
};