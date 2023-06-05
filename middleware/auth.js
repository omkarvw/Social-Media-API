const jwt = require('jsonwebtoken')

const { UnauthenticatedError } = require('../errors')

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Authentication Invalid')
    }
    const token = authHeader.split(' ')[1]
    try {
        const payload = jwt.verify(token, process.env.JWT_LOGIN_SECRET)
        req.user = { userId: payload.UserInfo.userId, roles: payload.UserInfo.roles }
        next()
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid')
    }
}

module.exports = auth