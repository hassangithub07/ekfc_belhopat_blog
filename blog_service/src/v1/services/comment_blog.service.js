const { CommentBlog } = require('../models')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError');
const blogService = require('./blog.service');

/**
 * Create Blog
 * @param {Object} body
 * @returns {Promise<CommentBlog>}
 */
const createCommentBlog = async function (body, user_id) {
    try {
        body.created_by = user_id;
        return await CommentBlog.create(body);
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
}

/**
 * Get blog by filter
 * @param {Object} filter
 * @param {Object} project
 * @returns {Promise<CommentBlog>}
 */
const findOneCommentBlogByFilter = async (filter, project = {}) => {
    return await CommentBlog.findOne(filter, project);
};

const findCommentBlogByFilter = async (filter, project = {}, sort = { _id: -1 }, limit = 2) => {
    return await CommentBlog.find(filter, project).sort(sort).limit(limit);
};

/**
 * Update Blog by id
 * @param {ObjectId} id
 * @returns {Promise<CommentBlog>}
 */
const updateCommentBlogByFilter = async (filter, set) => {
    try {
        return await CommentBlog.updateOne(filter, set);
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

/**
 * Update Blog by id
 * @param {ObjectId} id
 * @returns {Promise<CommentBlog>}
 */
const updateBlogCommentCount = async (blog_id) => {
    try {
        const filter = {
            blog_id: blog_id,
            is_deleted: false
        }
        const count = await countCommentBlog(filter);
        return await blogService.updateById(filter.blog_id, { $set: { comments_count: count } })
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

/**
 * Get message count by filter
 * @param {Object} filter
 * @returns {Promise<Message>}
 */
const countCommentBlog = async (filter) => {
    return await CommentBlog.countDocuments(filter);
};

// List the CommentsBlog with pagination
const fetchCommentsBlog = async (filter, options, body) => {
    return await CommentBlog.paginateLookup(filter, options, body);
};

module.exports = {
    createCommentBlog,
    findOneCommentBlogByFilter,
    updateCommentBlogByFilter,
    updateBlogCommentCount,
    fetchCommentsBlog,
    findCommentBlogByFilter
};