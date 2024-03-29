const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'username must be provided'],
        min: 2,
        max: 50,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'name must be provided'],
        min: 2,
        max: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
    },
    userProfilePicture: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Password must be provided'],
        min: 6,
    },
    followers: {
        type: Array,
        default: []
    },
    following: {
        type: Array,
        default: []
    },
    gender: {
        type: String,
        enum: {
            values: ["Male", "Female", "Other"],
            message: `{VALUE} is not supported`
        },
        required: true
    },
    profession: {
        type: String,
        max: 30,
        default: ''
    },
    from: {
        type: String,
        max: 50,
        default: ''
    },
    roles: {
        type: [String],
        default: ['user']
    }
}, { timestamps: true })

userSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.getName = function () {
    return this.name
}

userSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}


module.exports = mongoose.model("User", userSchema)
