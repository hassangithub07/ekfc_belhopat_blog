// const jwtDecode = require('jwt-decode');
const jwt = require("jsonwebtoken")
const config = require('../config/config');
const { Role, User, Token } = require("../models")

function verifyToken(role) {
    return async function (req, res, next) {
        if (req.headers?.authorization || req.cookies?.access_token) {
            var header = decodeURI(req.headers?.authorization ?? req.cookies?.access_token);
            if (!header) {
                return res.status(401).send({ message: 'No token provided.' });
            }

            const token = header.split(' ')[1];
            try {
                // const decoded = jwtDecode(token);
                const decoded = jwt.verify(token, config.jwt.secret);
                const tokenDoc = await Token.findOne({ token, type: 'access', user: decoded._id, blacklisted: false });
                if (!tokenDoc) {
                    throw new Error('Token not found');
                }
                const user = await User.findById(decoded._id).select('first_name last_name image_url _id type role_id').exec();
                if (Date.now() >= decoded.exp * 1000) {
                    return res.status(401).send({ message: 'Token expired.' });
                }
                req.userId = decoded._id;
                req.user = user
                req.isClient = user.type == 'Customer' || false;

                if (req.baseUrl.includes("/admin") && user.type == 'Admin') {
                    if (role) {
                        const modules = role.split('-');
                        const role_by_user = await Role.findById(user.role_id).select('module_list').exec();
                        if (modules.length == 2 && role_by_user && role_by_user.module_list.length) {
                            const find_module = role_by_user.module_list.find(e => e.module_value == modules[0] && e.is_enabled);
                            if (find_module && find_module[modules[1]]) next();
                            else res.status(403).json({ status: "fail", message: "You are not allowed to perform this operation." })
                        } else {
                            res.status(403).json({ status: "fail", message: "You are not allowed to perform this operation." })
                        }
                    } else {
                        next();
                    }
                } else if (req.baseUrl.includes("/app") && user.type == 'Customer') {
                    next();
                } else {
                    res.status(403).json({ status: "fail", message: "You are not allowed to perform this operation." })
                }
            } catch (err) {
                return res.status(401).send({ message: 'Unauthorized.', error: err.message });
            }
        } else {
            return res.status(401).send({ message: 'Unauthorized.', error: 'No token provided.' });
        }
    }
}

async function verifySocketToken(encoded_token) {
    if (encoded_token) {
        var header = decodeURI(encoded_token);
        if (!header) {
            throw new Error('Authentication error')
        }

        const token = header.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET, {});
            const user = await User.findById(decoded._id).select('first_name last_name image_url _id type role_id').exec();
            if (Date.now() >= decoded.exp * 1000) {
                throw new Error('Authentication error')
            }
            return user;
        } catch (err) {
            throw new Error('Authentication error')
        }
    } else {
        throw new Error('Authentication error')
    }
}

module.exports = {
    verifyToken,
    verifySocketToken
}