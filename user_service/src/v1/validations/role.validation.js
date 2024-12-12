const Joi = require('joi')
const { objectId } = require('./custom.validation');

const createRole = {
  body: Joi.object().keys({
    role_name: Joi.string().required(),
    module_list: Joi.array().items(Joi.object({
      module_name: Joi.string().required(),
      module_value: Joi.string().required(),
      is_enabled: Joi.boolean().required(),
      is_add: Joi.boolean().required(),
      is_edit: Joi.boolean().required(),
      is_delete: Joi.boolean().required()
    })).min(1)
  })
}

const roleById = {
  params: Joi.object().keys({
    role_id: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    role_name: Joi.string(),
    module_list: Joi.array().items(Joi.object({
      module_name: Joi.string(),
      module_value: Joi.string(),
      is_enabled: Joi.boolean(),
      is_add: Joi.boolean(),
      is_edit: Joi.boolean(),
      is_delete: Joi.boolean()
    }))
  })
}

const listRoles = {
  query: Joi.object().keys({
    page: Joi.number().allow('', null).default(1),
    limit: Joi.number().allow('', null).default(10),
    sortBy: Joi.string().allow('', null).default('_id'),
    sortDesc: Joi.number().allow('', null).default(-1),
    searchText: Joi.string().allow('', null),
  })
}

module.exports = {
  createRole,
  roleById,
  listRoles
}