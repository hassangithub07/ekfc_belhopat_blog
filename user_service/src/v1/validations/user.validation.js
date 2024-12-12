const Joi = require('joi')
const { objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().allow('', null, 'Male', 'Female'),
    image_url: Joi.string().allow('', null),
    nationality: Joi.string().allow('', null),
    email: Joi.string().email().required(),
    status: Joi.string().allow('', null, 'Active', 'InActive'),
    password: Joi.string().required(),
    role_id: Joi.required().custom(objectId)
  })
}

const createCustomer = {
  body: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().allow('', null, 'Male', 'Female'),
    image_url: Joi.string().allow('', null),
    nationality: Joi.string().allow('', null),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    status: Joi.string().allow('', null, 'Active', 'InActive'),
    bio: Joi.string().allow('', null),
    categories: Joi.array()
  })
}

const userById = {
  params: Joi.object().keys({
    user_id: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    first_name: Joi.string(),
    last_name: Joi.string(),
    gender: Joi.string().allow('', null, 'Male', 'Female'),
    image_url: Joi.string().allow('', null),
    nationality: Joi.string().allow('', null),
    email: Joi.string().email(),
    role_id: Joi.custom(objectId),
    bio: Joi.string().allow('', null),
    status: Joi.string().allow('', null, 'Active', 'InActive'),
    categories: Joi.array()
  })
}

const customerById = {
  body: Joi.object().keys({
    first_name: Joi.string(),
    last_name: Joi.string(),
    email: Joi.string().allow('', null),
    gender: Joi.string().allow('', null, 'Male', 'Female'),
    image_url: Joi.string().allow('', null),
    nationality: Joi.string().allow('', null),
    is_private_account: Joi.boolean(),
    bio: Joi.string().allow('', null),
    categories: Joi.array()
  })
}

const listUsers = {
  query: Joi.object().keys({
    page: Joi.number().allow('', null).default(1),
    limit: Joi.number().allow('', null).default(10),
    sortBy: Joi.string().allow('', null).default('_id'),
    sortDesc: Joi.number().allow('', null).default(-1),
    searchText: Joi.string().allow('', null),
  })
}

const verifyEmail = {
  params: Joi.object().keys({
    email: Joi.string().required()
  })
}

const downloadFile = {
  params: Joi.object().keys({
    document_name: Joi.string().required()
  })
}

const customerByUserId = {
  params: Joi.object().keys({
    user_id: Joi.required().custom(objectId)
  })
}

const listSuggestedUsers = {
  query: Joi.object().keys({
    searchText: Joi.string().allow('', null),
  })
}

module.exports = {
  createUser,
  userById,
  listUsers,
  customerById,
  createCustomer,
  downloadFile,
  verifyEmail,
  customerByUserId,
  listSuggestedUsers
}
