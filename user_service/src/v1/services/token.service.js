const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { ObjectId } = require("mongodb")

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (user, expires, type, secret = config.jwt.secret) => {
    const payload = {
        _id: user._id,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false, device_token) => {
    let token_params = {
        token,
        user: userId,
        expires: expires.toDate(),
        type,
        blacklisted
    }
    if (device_token && device_token.fcm_token) token_params.fcm_token = device_token.fcm_token;
    if (device_token && device_token.ios_voip_token) token_params.ios_voip_token = device_token.ios_voip_token;
    const tokenDoc = await Token.create(token_params);
    return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await Token.findOne({ token, type, user: payload._id, blacklisted: false });
    if (!tokenDoc) {
        throw new Error('Token not found');
    }
    return tokenDoc;
};

const verifyTokenAlt = async (token) => {
    const payload = jwt.verify(token, config.jwt.secret, { ignoreExpiration: false });
    return payload;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user, overrideExpiryNumber = null, device_token) => {
    let { accessExpirationMinutes } = config.jwt;
    if (overrideExpiryNumber) {
        accessExpirationMinutes = overrideExpiryNumber;
    }
    let accessTokenExpires = moment().add(accessExpirationMinutes, 'minutes');
    let refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');

    const accessToken = generateToken(user, accessTokenExpires, tokenTypes.ACCESS);

    const refreshToken = generateToken(user, refreshTokenExpires, tokenTypes.REFRESH);
    await saveToken(refreshToken, user._id.toString(), refreshTokenExpires, tokenTypes.REFRESH, false, device_token);
    await saveToken(accessToken, user._id.toString(), accessTokenExpires, tokenTypes.ACCESS, false);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
    const user = await userService.getUserByEmail(email);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
    }
    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = generateToken(user, expires, tokenTypes.RESET_PASSWORD);
    await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD, false);
    return resetPasswordToken;
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateCreatePasswordToken = async (user) => {
    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = generateToken(user, expires, tokenTypes.RESET_PASSWORD);
    await saveToken(resetPasswordToken, user._id, expires, tokenTypes.RESET_PASSWORD, false);
    return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
    const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
    const verifyEmailToken = generateToken(user, expires, tokenTypes.VERIFY_EMAIL);
    await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL, false);
    return verifyEmailToken;
};

/**
 * Get token
 * @param {ObjectId} userId
 * @param {String} type
 * @returns {Promise<string>}
 */
const getToken = async (userId, type) => {
    return await Token.findOne({ user: userId, type }, {}, { sort: { created_at: -1 } });
};

const deleteTokenById = async function (id) {
    return await Token.deleteOne({ _id: id })
}

const deleteToken = async function (token) {
    return await Token.deleteOne({ token: token })
}

const deleteTokens = async function (filter) {
    return await Token.deleteMany(filter)
}

const findOneToken = async function (token) {
    return await Token.findOne({ token });
}

const updateOneToken = async function (token, set) {
    return await Token.updateOne({ token }, { $set: set });
}

module.exports = {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
    generateResetPasswordToken,
    generateVerifyEmailToken,
    getToken,
    verifyTokenAlt,
    deleteTokenById,
    deleteToken,
    deleteTokens,
    findOneToken,
    generateCreatePasswordToken,
    updateOneToken,
};
