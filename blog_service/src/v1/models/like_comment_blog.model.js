const mongoose = require('mongoose')
const { toJSON, paginate, deletion } = require('./plugins')

const likeCommentBlogSchema = new mongoose.Schema({
    comment_id: {
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

likeCommentBlogSchema.plugin(toJSON)
likeCommentBlogSchema.plugin(paginate)
likeCommentBlogSchema.plugin(deletion)

module.exports = mongoose.model('like_comment_blogs', likeCommentBlogSchema)