const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    googleId: {type: String},
    role: {type: String, default: 'user'},
}, {
    timestamps: true,
})

module.exports = mongoose.model('users', UserSchema)