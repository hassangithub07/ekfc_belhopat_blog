const mongoose = require('mongoose')
const { toJSON, paginate, deletion } = require('./plugins')

const likeBlogSchema = new mongoose.Schema({
    blog_id: {
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

likeBlogSchema.plugin(toJSON)
likeBlogSchema.plugin(paginate)
likeBlogSchema.plugin(deletion)

module.exports = mongoose.model('like_blogs', likeBlogSchema)