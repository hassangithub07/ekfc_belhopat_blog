const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { tokenTypes } = require('../config/tokens');
const {
    authService,
    awsService,
    tokenService,
    userService
} = require('../services');
const { User } = require('../models');

const registerCustomer = catchAsync(async (req, res) => {
    try {
        req.body.type = 'Customer';
        req.body.role_id = '65eac6c6de20168c4ea7392f';
        let data = await userService.createUser(req.body);
        // const tokens = await tokenService.generateAuthTokens(data);
        // awsService.sendWelcomeCustomerEmail(data, req.body.password);
        res.status(httpStatus.OK).send({ user: data })
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to create customer.', details: error.message });
    }
});

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByCredentials(email, password);
        const tokens = await tokenService.generateAuthTokens(user);
        // res.setHeader('Set-Cookie', [
        //     `refreshToken=${tokens.refresh.token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7 * 2}; Secure=True;`
        // ]);
        // res.cookie('refresh_tok', tokens.refresh.token, {
        //     httpOnly: config.env != 'development' ? true : false,
        //     secure: config.env != 'development' ? true : false,
        // });
        // delete tokens.refresh;
        res.send({ user, tokens });
    } catch (err) {
        res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "Invalid Credentials" });
    }
});

const logout = catchAsync(async (req, res) => {
    try {
        var header = decodeURI(req.headers?.authorization ?? req.cookies?.access_token);
        if (req.body?.refresh_token) {
            const tokenValue = req.body?.refresh_token.split(' ')[1];
            if (tokenValue) {
                if (header) {
                    const token = header.split(' ')[1];
                    const accessTokenDoc = await tokenService.verifyToken(token, 'access');
                    if (accessTokenDoc) {
                        await accessTokenDoc.deleteOne();
                    }
                }
                await authService.logout(tokenValue);
                res.status(httpStatus.NO_CONTENT).send();
            } else {
                res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'No token found.' });
            }
        } else {
            res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'No token found.' });
        }
    } catch (err) {
        res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: err.message });
    }
});

const refreshTokens = catchAsync(async (req, res) => {
    try {
        if (req.body?.refresh_token) {
            const tokenValue = req.body?.refresh_token.split(" ")[1];
            if (tokenValue) {
                let accessTokenDoc;
                var header = decodeURI(req.headers?.authorization ?? req.cookies?.access_token);
                if (header) {
                    const token = header.split(' ')[1];
                    accessTokenDoc = await tokenService.findOneToken(token);
                }
                const tokens = await authService.refreshAuth(tokenValue);
                if (accessTokenDoc) {
                    await accessTokenDoc.deleteOne();
                }
                // res.cookie('refresh_tok', tokens.refresh.token, {
                //     httpOnly: config.env != 'development' ? true : false,
                //     secure: config.env != 'development' ? true : false,
                // });
                // delete tokens.refresh;
                res.send({ tokens });
            } else {
                res.status(401).send({ message: 'Unauthorized.', error: 'No token found.' });
            }
        } else {
            res.status(401).send({ message: 'Unauthorized.', error: 'No token found.' });
        }
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized.', error: err.message });
    }
});

/* const forgotPassword = catchAsync(async (req, res) => {
    const { email, country_code, phone_number } = req.body;
    let params = {};
    if (email) {
        params = {
            email
        }
    } else if (country_code && phone_number) {
        params = {
            country_code,
            phone_number
        }
    } else {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Please pass email or phone_number number to authenticate' });
    }
    const user = await userService.getUserByFilter(params);
    if (user) {
        const tokens = await tokenService.generateCreatePasswordToken(user);
        if (email) {
            awsService.sendResetPasswordEmail(user, tokens);
            res.send({ message: 'An Email has been sent to the given mail to reset password.' });
        }
    } else {
        throw new Error("Please check the credentials you entered.")
    }

});

const resetPassword = catchAsync(async (req, res) => {
    const resetTokenDoc = await tokenService.verifyToken(req.body.token, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetTokenDoc.user);
    if (user) {
        await userService.updatePassword({ _id: user._id }, req.body.password);
        await tokenService.deleteTokenById(resetTokenDoc._id);
        res.status(httpStatus.OK).send({ message: 'Password Updated Successfully.' })
    } else {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get user.' });
    }
}); */

module.exports = {
    login,
    logout,
    refreshTokens,
    registerCustomer,
    // forgotPassword,
    // resetPassword,
};
