const mongoose = require('mongoose')
const { toJSON, paginate, deletion } = require('./plugins')

const usersSchema = new mongoose.Schema(
  {
    first_name: { type: String, },
    middle_name: { type: String, },
    last_name: { type: String, },
    full_name: { type: String },
    gender: { type: String },
    email: {
      type: String,
      trim: true,
      required: true,
      // index: true,
      // index: {
      //   unique: true,
      //   partialFilterExpression: {email: {$type: "string"}}
      // },
      // unique: true,
      lowercase: true,
      // sparse: true
    },
    nationality: { type: String },
    dob: { type: Date },
    authentication: {
      type: Object,
      // required: true,
      private: true, // used by the toJSON plugin
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    last_online_at: {
      type: Date
    },
    status: {
      type: String,
      default: 'Active'
    },
    type: {
      type: String,
      default: 'Customer'
    },
    image_url: {
      type: String
    },
    bio: {
      type: String
    },
    categories: {
      type: Array,
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId
    },
    is_deleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  },
)

usersSchema.plugin(toJSON)
usersSchema.plugin(paginate)
usersSchema.plugin(deletion)

const Users = mongoose.model('users', usersSchema)
module.exports = Users
