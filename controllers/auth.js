const User = require('../models/users')
require('dotenv').config
const { BadRequestError, UnauthenticatedError } = require('../errors')

const registerController = async (req, res) => {

    const user = await User.create({ ...req.body })
    const token = user.createJWT()
    res.status(200).json({
        token, user: {
            name: user.name,
            username: user.username
        }
    })
}

const loginController = async (req, res) => {

    const { email, password } = req.body

    if (!email || !password) {
        throw new BadRequestError('Please provide email AND password')
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new UnauthenticatedError('Invalid Credentials')
    }

    const validPassword = await user.comparePassword(password)
    // const validPassword = true
    if (!validPassword) {
        throw new UnauthenticatedError("Please enter correct password")
    }

    const token = user.createJWT()

    res.status(200).json({
        token, user: {
            name: user.name
            , username: user.username
        }
    })
}

module.exports = { loginController, registerController }