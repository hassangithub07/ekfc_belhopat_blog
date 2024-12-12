const Joi = require('joi')
const { objectId } = require('./custom.validation');

const likeBlog = {
    params: Joi.object().keys({
        like: Joi.boolean().required(),
        blog_id: Joi.required().custom(objectId)
    })
}

const fetchLikes = {
    params: Joi.object().keys({
        blog_id: Joi.required().custom(objectId)
    }),
    query: Joi.object().keys({
        page: Joi.number().allow('', null).default(1),
        limit: Joi.number().allow('', null).default(10),
        sortBy: Joi.string().allow('', null).default('_id'),
        sortDesc: Joi.number().allow('', null).default(-1),
        searchText: Joi.string().allow('', null),
    })
}

module.exports = {
    likeBlog,
    fetchLikes
}