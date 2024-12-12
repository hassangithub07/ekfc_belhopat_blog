const { ReportBlog } = require('../models')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError');

/**
 * Create ReportBlog
 * @param {Object} body
 * @returns {Promise<ReportBlog>}
 */
const reportBlog = async function (body, user_id) {
    try {
        body.created_by = user_id;
        return await ReportBlog.create(body);
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
}

/**
 * Get ReportBlog by filter
 * @param {Object} filter
 * @param {Object} project
 * @returns {Promise<ReportBlog>}
 */
const findOneReportBlogByFilter = async (filter, project = {}) => {
    return await ReportBlog.findOne(filter, project);
};

module.exports = {
    reportBlog,
    findOneReportBlogByFilter
};