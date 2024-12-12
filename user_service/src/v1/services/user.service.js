const { User } = require('../models')
var pbkdf2 = require('pbkdf2')
var crypto = require('crypto');
const { ObjectId } = require('mongodb')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError');
const awsService = require("./aws.service")
const { randomUUID } = require("crypto")
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');
const path = require('path')
const os = require('os');

// Set ffmpeg path from the installer
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Get user by filter
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const createUser = async (body) => {
    try {
        if (body.password) {
            var salt = genRandomString(32);
            var authentication = {
                hash: pbkdf2.pbkdf2Sync(body.password, salt, 872791, 64, 'sha512').toString('hex'),
                token: salt
            }
            body.authentication = authentication
        }
        if (body.first_name) body.full_name = body.first_name + (body.last_name ? (' ' + body.last_name) : '');
        return await User.create(body);
    } catch (err) {
        if (err.code == 11000 && err.keyPattern && err.keyPattern.hasOwnProperty('email')) throw new ApiError(httpStatus.NOT_FOUND, 'Already registered by email.');
        else throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

/**
 * Get user by filter
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const createCustomer = async (body) => {
    try {
        if (body.first_name) body.full_name = body.first_name + (body.last_name ? (' ' + body.last_name) : '');
        return await User.create(body);
    } catch (err) {
        if (err.code == 11000 && err.keyPattern && err.keyPattern.hasOwnProperty('email')) throw new ApiError(httpStatus.NOT_FOUND, 'Already registered by email.');
        else throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id, project = { authentication: 0 }) => {
    return await User.findOne({ _id: id }, project).lean();
};

/**
* Get user by filter
* @param {Object} filter
* @returns {Promise<User>}
*/
const getUserByFilter = async (filter, project = { authentication: 0 }) => {
    return await User.findOne(filter, project).lean();
};

/**
 * Get user by filter
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const findByIdAndUpdate = async (id, set = {}, project = {}) => {
    try {
        if (set.first_name) set.full_name = set.first_name + (set.last_name ? (' ' + set.last_name) : '');
        return await User.findOneAndUpdate({ _id: id }, { $set: set }, { new: true, projection: project });
    } catch (err) {
        if (err.code == 11000 && err.keyPattern && err.keyPattern.hasOwnProperty('email')) throw new ApiError(httpStatus.NOT_FOUND, 'Already registered by email.');
        else throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

function genRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')/** convert to hexadecimal format */
        .slice(0, length);
    /** return required number of characters */
};

// List the Users with pagination
const fetchUsers = async (filter, options, body) => {
    return await User.paginateLookup(filter, options, body);
};

/**
 * Update User by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const updateById = async (id, set) => {
    try {
        if (set.first_name) set.full_name = set.first_name + (set.last_name ? (' ' + set.last_name) : '');
        return await User.updateOne({ _id: id }, { $set: set });
    } catch (err) {
        if (err.code == 11000 && err.keyPattern && err.keyPattern.hasOwnProperty('user_name')) throw new ApiError(httpStatus.NOT_FOUND, 'Already registered by username.');
        else if (err.code == 11000 && err.keyPattern && err.keyPattern.hasOwnProperty('email')) throw new ApiError(httpStatus.NOT_FOUND, 'Already registered by email.');
        else throw new ApiError(httpStatus.NOT_FOUND, err.message);
    }
};

/**
 * Find User by filter
 * @param {Object} filter
 * @returns {Promise<User>}
 */
const findUserByFilter = async (filter, params = { authentication: 0 }) => {
    return await User.findOne(filter, params);
};

/**
 * Find Users by filter
 * @param {Object} filter
 * @returns {Promise<User>}
 */
const findUsersByFilter = async (filter, params = { authentication: 0 }, sortBy) => {
    if (sortBy) return await User.find(filter, params).sort(sortBy);
    else return await User.find(filter, params);
};

// upload file to aws
const uploadFile = async (filesArray, document_name = " ", uploadedBy = { name: "", _id: "" }, is_thumbnail_required = false ) => {
    let attachmentRecords = []
    if (filesArray?.length === undefined) {
        filesArray = [filesArray]
    } else {
        filesArray = [...filesArray]
    }

    // Function to generate a thumbnail from a video buffer and return the image buffer
    const createThumbnailFromBuffer = (videoBuffer, timeInSeconds = 1, fileName) => {
        return new Promise((resolve, reject) => {
            const tempDir = os.tmpdir();
            const tempFile = path.join(tempDir, fileName);
            
            // const tempFile = path.resolve(__dirname, '../../temp', fileName);

            fs.writeFileSync(tempFile, videoBuffer);

            ffmpeg(tempFile)
                // .inputFormat('mp4')  // Make sure to specify the correct format for the input
                .on('error', (err) => {
                    console.log("Error occurred during processing: ", err);
                    reject(err);
                })
                .on('end', (data) => {
                    fs.unlink(tempFile, function (err) { });
                    const screenshotFileName = `${fileName}_screenshot.png`;
                    const screenshotFilePath = path.join(tempDir, screenshotFileName);
                    resolve({ status: true, filePath: screenshotFilePath, fileName: screenshotFileName });
                })
                .screenshots({
                    timestamps: [timeInSeconds], // Take the screenshot at the specified second
                    // size: '320x240', // Thumbnail size
                    // filename: screenshotFilePath, // This is needed for screenshots to work in some ffmpeg versions
                    filename: `${fileName}_screenshot.png`,
                    folder: tempDir, // Specify the folder for screenshots
                })
        });
    };

    await Promise.all(filesArray.map(async el => {

        let result = await awsService.uploadFileToS3({
            fileName: `${randomUUID()}-${el.name}`,
            filePath: el.tempFilePath,
            fileMimeType: el.mimetype,
            fileBuffer: el.data
        })
        let attachmentRecord = {
            mime_type: el.mimetype,
            file_name: el.name,
            url: result.Location,
            isDeleted: false,
            size_in_bytes: el.size,
            document_name: result.Key,
            // uploaded_by: {
            //     name: uploadedBy.name ? `${uploadedBy.name}`.trim() : '',
            //     user_id: uploadedBy._id ? uploadedBy._id : ''
            // }
        }
        if (is_thumbnail_required == 'true' || is_thumbnail_required == true) {
            const thumbnail_screenshot = await createThumbnailFromBuffer(el.data, 1, `${randomUUID()}-${el.name}`);
            if (thumbnail_screenshot && thumbnail_screenshot.filePath) {
                const screenshot_result = await awsService.uploadFileToS3FromPath({
                    fileName: thumbnail_screenshot.fileName,
                    filePath: thumbnail_screenshot.filePath,
                    fileMimeType: 'image/png'
                })
                if (screenshot_result) {
                    attachmentRecord.thumbnail_image = {
                        mime_type: 'image/png',
                        file_name: thumbnail_screenshot.fileName,
                        url: screenshot_result.Location,
                        isDeleted: false,
                        document_name: screenshot_result.Key
                    }
                }
            }

        }
        attachmentRecords.push(attachmentRecord);
    }))
    return attachmentRecords
}

// download file
/**
 * Find Users by filter
 * @param {Object} filter
 * @returns {Promise<User>}
 */
const downloadFile = async (document_name) => {
    return await awsService.getFileStreamFromS3(document_name);
};

module.exports = {
    createUser,
    createCustomer,
    getUserById,
    getUserByFilter,
    findByIdAndUpdate,
    fetchUsers,
    updateById,
    findUserByFilter,
    findUsersByFilter,
    uploadFile,
    downloadFile
}
