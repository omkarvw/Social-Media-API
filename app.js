require('dotenv').config()
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const authRoutes = require('./routes/authRoute')
const userRoutes = require('./routes/userRoute')
const postRoutes = require('./routes/postRoute')
const authMiddleware = require('./middleware/auth')
const corsOptions = require('./config/corsOptions')
const errorHandlerMiddleware = require('./middleware/errorHandler')
const notFoundMiddleware = require('./middleware/notFound')
const { logger } = require('./middleware/logger')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)
app.use(express.urlencoded({ extended: false }))
app.use(fileUpload({
    useTempFiles: true,
    limits: { fileSize: 1024 * 1024 },
    abortOnLimit: true,
}))
app.use(logger)
app.use(express.json());
app.use(cors(corsOptions))
app.use(cookieParser())

// routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', authMiddleware, userRoutes)
app.use('/api/v1/post', authMiddleware, postRoutes)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

module.exports = app