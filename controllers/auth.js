const User = require('../models/users')
require('dotenv').config
const { BadRequestError, UnauthenticatedError } = require('../errors')
const jwt = require('jsonwebtoken')
const { cloudinaryConfig } = require('../config/cloudinary')
const cloudinary = require('cloudinary').v2


// uploads profile picture to cloudinary
// creates user in db
// creates jwt
// sends jwt refresh token as cookie
// sends jwt access token as response
const registerController = async (req, res) => {

    if (req.files && req.files.image) {
        const file = req.files.image
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            throw new BadRequestError('Only jpg and png files are allowed')
        }
        cloudinaryConfig()
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "test",
        })
        req.body.userProfilePicture = result.secure_url
    }
    console.log(req.body);
    const user = await User.create({ ...req.body })
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "userId": user._id,
                "roles": user.roles
            }
        },
        process.env.JWT_LOGIN_SECRET,
        { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
        {
            "username": user.username,
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none'
    })

    res.status(200).json({
        accessToken, UserInfo: {
            userId: user._id,
            username: user.username,
        }
    })
}


// checks if email and password are provided
// checks if user exists in db
// checks if password is correct
// creates jwt
// sends jwt refresh token as cookie
// sends jwt access token as response
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
                "userId": user._id,
                "roles": user.roles
            }
        },
        process.env.JWT_LOGIN_SECRET,
        { expiresIn: process.env.JWT_LOGIN_EXPIRY }
    )

    const refreshToken = jwt.sign(
        {
            "userId": user._id,
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none'
    })

    res.status(200).json({
        accessToken, UserInfo: {
            userId: user._id,
            username: user.username,
        }
    })
}

// checks if jwt refresh token is provided
// checks if jwt refresh token is valid
// checks if user exists in db
// creates jwt
// sends jwt access token as response
const refreshController = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) {
        throw new UnauthenticatedError("Please login")
    }

    const refreshToken = cookies.jwt

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) {
            throw new UnauthenticatedError("Please login")
        }
        const user = await User.findById(decoded.userId)

        if (!user) {
            throw new UnauthenticatedError("Please login")
        }

        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "userId": user._id,
                    "roles": user.roles
                }
            },
            process.env.JWT_LOGIN_SECRET,
            { expiresIn: '15m' }
        )
        console.log('sent')
        res.status(200).json({
            accessToken, UserInfo: {
                userId: user._id,
                username: user.username,
            }
        })
    }
    )
}

// clears jwt refresh token cookie
const logoutController = async (req, res) => {
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

module.exports = { loginController, registerController, refreshController, logoutController }