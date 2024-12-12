const { LikeCommentBlog } = require('../models')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError');
const commentService = require('./comment_blog.service');

/**
 * Get message count by filter
 * @param {Object} filter
 * @returns {Promise<Message>}
 */
const countLikeCommentBlog = async (filter) => {
    return await LikeCommentBlog.countDocuments(filter);
};

/**
 * Update Comment by id
 * @param {ObjectId} id
 * @returns {Promise<LikeCommentBlog>}
 */
const updateModeByFilter = async (filter, set, mode = {}) => {
    try {
        return await LikeCommentBlog.updateOne(filter, set, mode);
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

/**
 * Update Comment by id
 * @param {ObjectId} id
 * @returns {Promise<LikeCommentBlog>}
 */
const updateCommentLikeCount = async (comment_id) => {
    try {
        const filter = {
            comment_id: comment_id,
            is_deleted: false
        }
        const count = await countLikeCommentBlog(filter);
        return await commentService.updateCommentBlogByFilter({ _id: filter.comment_id }, { $set: { likes_count: count } })
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

// List the LikesBlog with pagination
const fetchLikesBlog = async (filter, options, body) => {
    return await LikeCommentBlog.paginateLookup(filter, options, body);
};

const findCommentLikeBlogByFilter = async (filter, project = {}, sort = { _id: -1 }, limit = 2) => {
    return await LikeBlog.find(filter, project).sort(sort).limit(limit);
};

module.exports = {
    updateModeByFilter,
    updateCommentLikeCount,
    fetchLikesBlog,
    findCommentLikeBlogByFilter
}