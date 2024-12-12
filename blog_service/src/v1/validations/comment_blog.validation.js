const Joi = require('joi')
const { objectId } = require('./custom.validation');

const commentBlog = {
    params: Joi.object().keys({
        blog_id: Joi.required().custom(objectId)
    }),
    body: Joi.object().keys({
        type: Joi.string().valid('TEXT', 'IMAGE').default('TEXT'),
        text_message: Joi.string().allow('', null),
        file: Joi.any().allow(null),
        reply_id: Joi.custom(objectId)
    }),
}

const editCommentBlog = {
    params: Joi.object().keys({
        blog_id: Joi.required().custom(objectId),
        comment_id: Joi.required().custom(objectId)
    }),
    body: Joi.object().keys({
        text_message: Joi.string()
    }),
}

const fetchComments = {
    params: Joi.object().keys({
        blog_id: Joi.required().custom(objectId)
    }),
    query: Joi.object().keys({
        page: Joi.number().allow('', null).default(1),
        limit: Joi.number().allow('', null).default(10),
        sortBy: Joi.string().allow('', null).default('_id'),
        sortDesc: Joi.number().allow('', null).default(-1),
        searchText: Joi.string().allow('', null),
        reply_id: Joi.custom(objectId)
    })
}

const likeCommentBlog = {
    params: Joi.object().keys({
        comment_id: Joi.required().custom(objectId),
        like: Joi.boolean().required()
    })
}

const listLikes = {
    params: Joi.object().keys({
        comment_id: Joi.required().custom(objectId)
    })
}

module.exports = {
    commentBlog,
    fetchComments,
    editCommentBlog,
    likeCommentBlog,
    listLikes
}