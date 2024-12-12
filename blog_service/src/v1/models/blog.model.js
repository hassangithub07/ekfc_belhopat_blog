const mongoose = require('mongoose')
const { toJSON, paginate, deletion } = require('./plugins')

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    sub_title: {
        type: String,
    },
    text_message: {
        type: String,
    },
    files: {
        type: Array,
    },
    background_image: {
        type: Object
    },
    background_color: {
        type: String,
    },
    tag_ids: {
        type: [mongoose.Schema.Types.ObjectId],
    },
    likes_count: {
        type: Number,
        default: 0
    },
    comments_count: {
        type: Number,
        default: 0
    },
    categories: {
        type: Array
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
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

blogSchema.plugin(toJSON)
blogSchema.plugin(paginate)
blogSchema.plugin(deletion)

module.exports = mongoose.model('blogs', blogSchema)