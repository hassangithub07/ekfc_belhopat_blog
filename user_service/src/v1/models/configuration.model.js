const mongoose = require('mongoose')

const configurationsSchema = new mongoose.Schema({
    module_list: {
        type: Array
    },
    country_list: {
        type: Array
    },
    group_permissions: {
        type: Array
    },
    blog_background_images: {
        type: Array
    },
    invite_content_link: {
        type: String
    },
    report_blogs: {
        type: Array,
    },
    blog_settings: {
        type: Object
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
})

module.exports = mongoose.model('configurations', configurationsSchema)

