const { LikeBlog } = require('../models')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError');
const blogService = require('./blog.service');

/**
 * Get blog by filter
 * @param {Object} filter
 * @param {Object} project
 * @returns {Promise<LikeBlog>}
 */
const findOneLikeBlogByFilter = async (filter, project = {}) => {
    return await LikeBlog.findOne(filter, project);
};

const findLikeBlogByFilter = async (filter, project = {}, sort = { _id: -1 }, limit = 2) => {
    return await LikeBlog.find(filter, project).sort(sort).limit(limit);
};

/**
 * Update Blog by id
 * @param {ObjectId} id
 * @returns {Promise<LikeBlog>}
 */
const updateModeByFilter = async (filter, set, mode = {}) => {
    try {
        return await LikeBlog.updateOne(filter, set, mode);
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

/**
 * Update Blog by id
 * @param {ObjectId} id
 * @returns {Promise<LikeBlog>}
 */
const updateBlogLikeCount = async (blog_id) => {
    try {
        const filter = {
            blog_id: blog_id,
            is_deleted: false
        }
        const count = await countLikeBlog(filter);
        return await blogService.updateById(filter.blog_id, { $set: { likes_count: count } })
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

/**
 * Get message count by filter
 * @param {Object} filter
 * @returns {Promise<Message>}
 */
const countLikeBlog = async (filter) => {
    return await LikeBlog.countDocuments(filter);
};

// List the LikesBlog with pagination
const fetchLikesBlog = async (filter, options, body) => {
    return await LikeBlog.paginateLookup(filter, options, body);
};

module.exports = {
    findOneLikeBlogByFilter,
    updateModeByFilter,
    updateBlogLikeCount,
    fetchLikesBlog,
    findLikeBlogByFilter
};