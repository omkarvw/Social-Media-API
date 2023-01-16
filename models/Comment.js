const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = Schema({
    postID: {
        type: String,
        required: [true, 'Please provide postId']
    },
    userID: {
        type: String,
        required: [true, 'Please provide userId']
    },
    mainComment: {
        type: String,
        required: [true, 'Please provide non empty comment']
    },
}, { timestamps: true })

module.exports = mongoose.model('Comment', commentSchema)

