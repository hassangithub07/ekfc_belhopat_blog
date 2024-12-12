const Joi = require('joi');

const getConfigDataAdmin = {
    body: Joi.object().keys({
        module_list: Joi.number().integer().valid(1),
        country_list: Joi.number().integer().valid(1),
        group_permissions: Joi.number().integer().valid(1)
    }).min(1),
}

const getConfigDataCustomer = {
    body: Joi.object().keys({
        group_permissions: Joi.number().integer().valid(1),
        invite_content_link: Joi.number().integer().valid(1),
        blog_background_images: Joi.number().integer().valid(1),
        report_blogs: Joi.number().integer().valid(1)
    }).min(1),
}

const updateGroupPermissions = {
    body: Joi.object().keys({
        group_permissions: Joi.array().required()
    })
}

module.exports = {
    getConfigDataAdmin,
    getConfigDataCustomer,
    updateGroupPermissions
}