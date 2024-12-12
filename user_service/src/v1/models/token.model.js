const mongoose = require('mongoose')

// To store the Tokens
const tokensSchema = new mongoose.Schema({
    blacklisted: {
        type: Boolean,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    fcm_token: {
        type: String,
    },
    ios_voip_token: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: true
    },
    updated_at: {
        type: Date,
        default: Date.now,
        required: true
    }
})

module.exports = mongoose.model('tokens', tokensSchema)

