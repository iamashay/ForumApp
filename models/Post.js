const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema({
    title: {type: String, required: true},
    body: {type: String, required: true},
    user_id: { type: Schema.Types.ObjectId, ref: "post", required: true },
}, {
    timestamps: true,
})

module.exports = mongoose.model('post', UserSchema)