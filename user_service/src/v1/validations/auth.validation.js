const Joi = require('joi');

const login = {
    body: Joi.object().keys({
        email: Joi.string().allow('', null),
        password: Joi.string().allow('', null)
    }),
};

const registerCustomer = {
    body: Joi.object().keys({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        gender: Joi.string().allow('', null, 'Male', 'Female'),
        image_url: Joi.string().allow('', null),
        nationality: Joi.string().allow('', null),
        password: Joi.string().required(),
        email: Joi.string().email().required(),
        status: Joi.string().allow('', null, 'Active', 'InActive'),
        categories: Joi.array(),
        bio: Joi.string().allow('', null),
    })
}

const logout = {
    body: Joi.object().keys({
        accessToken: Joi.string().required(),
    }),
};

const refreshTokens = {
    body: Joi.object().keys({
        refresh_token: Joi.string().required(),
    }),
};

const forgotPassword = {
    body: Joi.object().keys({
        email: Joi.string().allow('', null),
        // country_code: Joi.string().allow('', null).replace(/[^0-9]/g, ""),
        // phone_number: Joi.number().allow('', null)
    }).min(1)
};

const resetPassword = {
    body: Joi.object().keys({
        token: Joi.string().required(),
        password: Joi.string().required()
    }),
};

module.exports = {
    login,
    logout,
    refreshTokens,
    forgotPassword,
    resetPassword,
    registerCustomer
};
