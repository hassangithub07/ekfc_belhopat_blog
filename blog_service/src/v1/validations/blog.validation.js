const Joi = require('joi')
const { objectId } = require('./custom.validation');

const createBlog = {
    body: Joi.object().keys({
        title: Joi.string().allow('', null),
        sub_title: Joi.string().allow('', null),
        text_message: Joi.string().allow('', null),
        background_color: Joi.string().allow('', null),
        files: Joi.array().allow('', null),
        background_image: Joi.object().allow('', null),
        tag_ids: Joi.array().items(Joi.custom(objectId)),
        categories: Joi.array(),
    })
}

const blogById = {
    params: Joi.object().keys({
        blog_id: Joi.required().custom(objectId)
    }),
    body: Joi.object().keys({
        title: Joi.string().allow('', null),
        sub_title: Joi.string().allow('', null),
        text_message: Joi.string().allow('', null).default(null),
        background_color: Joi.string().allow('', null).default(null),
        files: Joi.array().allow('', null).default([]),
        background_image: Joi.object().allow('', null).default(null),
        tag_ids: Joi.array().items(Joi.custom(objectId)).default([]),
        categories: Joi.array(),
    })
}

const fetchBlogs = {
    query: Joi.object().keys({
        page: Joi.number().allow('', null).default(1),
        limit: Joi.number().allow('', null).default(10),
        sortBy: Joi.string().allow('', null).default('_id'),
        sortDesc: Joi.number().allow('', null).default(-1),
        searchText: Joi.string().allow('', null),
        user_id: Joi.custom(objectId),
        blog_ids: Joi.string().allow('', null),
    })
}

const reportBlog = {
    params: Joi.object().keys({
        blog_id: Joi.required().custom(objectId),
        report_id: Joi.required().custom(objectId)
    })
}

module.exports = {
    createBlog,
    blogById,
    fetchBlogs,
    reportBlog
}