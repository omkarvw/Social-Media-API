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
    if (!validPassword) {
        throw new UnauthenticatedError("Please enter correct password")
    }

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": user.username,
                "roles": user.roles
            }
        },
        process.env.JWT_LOGIN_SECRET,
        { expiresIn: JWT_LOGIN_EXPIRY }
    )

    const refreshToken = jwt.sign(
        {
            "username": user.username,
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRY }
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none'
    })

    res.status(200).json({
        accessToken
    })
}

const refresh = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) {
        throw new UnauthenticatedError("Please login")
    }

    const refreshToken = cookies.jwt

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) {
            throw new UnauthenticatedError("Please login")
        }
        const user = await User.findOne({ username: decoded.username })

        if (!user) {
            throw new UnauthenticatedError("Please login")
        }

        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": user.username,
                    "roles": user.roles
                }
            },
            process.env.JWT_LOGIN_SECRET,
            { expiresIn: JWT_LOGIN_EXPIRY }
        )

        res.status(200).json({
            accessToken
        })
    }
    )
}

const logout = async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) {
        return res.status(204)
    }
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none'
    })
    res.json({ message: "Logout successful" })
}

module.exports = { loginController, registerController }