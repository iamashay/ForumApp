const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {type: String, required: true},
    role: {type: String, required: true},
}, {
    timestamps: true,
})

module.exports = mongoose.model('user', UserSchema)