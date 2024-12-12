const mongoose = require('mongoose')
const { toJSON, paginate, deletion } = require('./plugins')

const reportBlogSchema = new mongoose.Schema({
    blog_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    report_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
})

reportBlogSchema.plugin(toJSON)
reportBlogSchema.plugin(paginate)
reportBlogSchema.plugin(deletion)

module.exports = mongoose.model('report_blogs', reportBlogSchema)