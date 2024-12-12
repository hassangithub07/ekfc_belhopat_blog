const Joi = require('joi')
const { objectId } = require('./custom.validation');

const sendNotification = {
    body: Joi.object().keys({
        recipient_ids: Joi.array().items(Joi.custom(objectId)),
        mode: Joi.string().valid('All', 'Selected', '', null),
        notification_type: Joi.string(),
        notification_text: Joi.string(),
        details: Joi.object(),
    })
}

const fetchNotifications = {
    query: Joi.object().keys({
        page: Joi.number().allow('', null).default(1),
        limit: Joi.number().allow('', null).default(10),
        sortBy: Joi.string().allow('', null).default('_id'),
        sortDesc: Joi.number().allow('', null).default(-1),
        searchText: Joi.string().allow('', null)
    })
}

module.exports = {
    sendNotification,
    fetchNotifications
}