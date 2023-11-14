const mongoose = require('mongoose')
const {format} = require('date-fns')
const Schema = mongoose.Schema

const PostSchema = new Schema({
    title: {type: String, required: true},
    body: {type: String, required: true},
    user_id: { type: Schema.Types.ObjectId, ref: "users", required: true },
}, {
    timestamps: true,
})

PostSchema.virtual('fornattedDate').get(function (){
    const createdAt = new Date(this.createdAt)
    return format(createdAt, 'do LLL yyyy')
})

module.exports = mongoose.model('post', PostSchema)