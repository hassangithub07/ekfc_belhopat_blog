const mongoose = require('mongoose')
const { toJSON, paginate, deletion } = require('./plugins')

const roleSchema = new mongoose.Schema({
    role_name: {
        type: String,
        required: true
    },
    role_value: {
        type: String,
    },
    module_list: {
        type: Array,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId
    },
    created_at: {
        type: Date,
        default: Date.now
    },
})

roleSchema.plugin(toJSON)
roleSchema.plugin(paginate)
roleSchema.plugin(deletion)

module.exports = mongoose.model('roles', roleSchema)