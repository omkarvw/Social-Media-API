require('dotenv').config()
const express = require('express')
require('express-async-errors')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
const connectDB = require('./db/connect')
const authRoutes = require('./routes/authRoute')
const userRoutes = require('./routes/userRoute')
const postRoutes = require('./routes/postRoute')
const authMiddleware = require('./middleware/auth')
const errorHandlerMiddleware = require('./middleware/errorHandler')
const notFoundMiddleware = require('./middleware/notFound')

app.use(express.json());
app.use(cors())

// routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', authMiddleware, userRoutes)
app.use('/api/v1/post', authMiddleware, postRoutes)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const PORT = process.env.port || 3000
mongoose.set("strictQuery", true);
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => { console.log('Server is listening on port ' + PORT + '\nConnected to mongodb server'); })
    } catch (error) {
        console.log(error);
    }
}

start()

