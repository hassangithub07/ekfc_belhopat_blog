// const { BUCKET_NAME, SECRET_ID_AWS, SECRET_KEY_AWS, AWS_REGION } = process.env;
const config = require('../config/config');
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const { randomUUID } = require("crypto")
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError');
// const { emailTemplate } = require("../template")
// const notificationService = require('../services/notification.service')

const AWS = require('aws-sdk');
const ses = new AWS.SES({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    region: config.aws.region
})
const s3 = new S3({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    region: config.aws.region
});

const uploadToS3getURL = async (files) => {
    const urls = [];
    if (!Array.isArray(files)) {
        // If only one file is passed in, wrap it in an array
        files = [files];
    }
    for (const file of files) {
        const fileStream = fs.createReadStream(file.tempFilePath);
        const uploadParams = {
            Bucket: config.aws.bucketName,
            Body: fileStream,
            Key: `${randomUUID()} - ${file.name}`,
            ACL: 'public-read',
            ContentType: file.mimetype,
        };
        const result = await s3.upload(uploadParams).promise();
        urls.push(result.Location);
    }

    return urls;
};

const uploadFileToS3 = async ({ filePath, fileName, fileMimeType, fileBuffer }) => {
    try {
        // const fileStream = fs.createReadStream(filePath, {highWaterMark : 256 * 1024});

        const uploadParams = {
            Bucket: config.aws.bucketName,
            Body: fileBuffer,
            Key: fileName,
            ACL: 'public-read',
            ContentType: fileMimeType,
        };
        const result = await s3.upload(uploadParams).promise();
        // fs.unlink(filePath, function (err) { });
        return result
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

const uploadFileToS3FromPath = async ({ filePath, fileName, fileMimeType }) => {
    try {
        const fileStream = fs.createReadStream(filePath);

        const uploadParams = {
            Bucket: config.aws.bucketName,
            Body: fileStream,
            Key: fileName,
            ACL: 'public-read',
            ContentType: fileMimeType,
        };
        const result = await s3.upload(uploadParams).promise();
        fs.unlink(filePath, function (err) { });
        return result
    } catch (err) {
        throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

// const getFileStreamFromS3 = async (fileKey) => {
//     const downloadParams = {
//         Key: fileKey,
//         Bucket: config.aws.bucketName,
//     };

//     return s3.getObject(downloadParams).createReadStream();
// };

const getFileStreamFromS3 = async (fileKey) => {
    const downloadParams = {
        Key: fileKey,
        Bucket: config.aws.bucketName,
    };

    // Retrieve the PDF file from S3
    return await s3.getObject(downloadParams).promise();
};

const sendEmail = async (subject, body, email) => {
    const params = {
        // Source: "noreply@shopvalyou.com",
        Source: "noreply@nathanhr.ae",
        Destination: {
            ToAddresses: email
        },
        Message: {
            Body: {
                Html: {
                    Data: body,
                    Charset: "UTF-8"
                },
                Text: {
                    Data: subject,
                    Charset: "UTF-8"
                }
            },
            Subject: {
                Data: subject,
                Charset: "UTF-8"
            }
        },
    }
    ses.sendEmail(params, async function (err, data) {
        if (err) {
            throw err
        } else {
            // log the request
            return true;
        }
    })
}

// const sendLoginOtp = async (otp, user, req) => {
//     const subject = emailTemplate.otpLogin.subject();
//     const body = await emailTemplate.otpLogin.html(otp, req);
//     sendEmail(subject, body, [user.email]);
// }

module.exports = {
    // uploadFilesToS3,
    uploadFileToS3,
    getFileStreamFromS3,
    uploadToS3getURL,
    uploadFileToS3FromPath
    // sendLoginOtp
};
