const { Configuration } = require('../models')

const getConfigData = async function (project) {
    return await Configuration.findOne({ is_deleted: false }, project);
}

const updateConfigData = async function (set, project = {}) {
    return await Configuration.findOneAndUpdate({ is_deleted: false }, { $set: set }, { new: true, projection: project });
}

module.exports = {
    getConfigData,
    updateConfigData
};