const mongoose = require('mongoose')
const { toJSON, paginate, deletion } = require('./plugins')

const commentBlogSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'TEXT'
    },
    blog_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    text_message: {
        type: String
    },
    file: {
        type: Object,
    },
    is_reply: {
        type: Boolean,
        default: false
    },
    reply_to: {
        type: mongoose.Schema.Types.ObjectId
    },
    likes_count: {
        type: Number,
        default: 0
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

commentBlogSchema.plugin(toJSON)
commentBlogSchema.plugin(paginate)
commentBlogSchema.plugin(deletion)

module.exports = mongoose.model('comment_blogs', commentBlogSchema)