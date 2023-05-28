require('dotenv').config()
const express = require('express')
require('express-async-errors');
const mongoose = require('mongoose')
const app = express()
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const connectDB = require('./db/connect')
const authRoutes = require('./routes/authRoute')
const userRoutes = require('./routes/userRoute')
const postRoutes = require('./routes/postRoute')
const authMiddleware = require('./middleware/auth')
const errorHandlerMiddleware = require('./middleware/errorHandler')
const notFoundMiddleware = require('./middleware/notFound')


app.use(express.json());

// the new set of headers are applied by our helmet.js module. These headers are added for an additional level of security.
app.use(helmet())


app.use(morgan('tiny'))

// app.use(bp.json()) looks at requests where the Content-Type: application/json header is present and transforms the text-based JSON input into JS-accessible variables under req.body. app.use(bp.urlencoded({extended: true}) does the same for URL-encoded requests. the extended: true precises that the req.body object will contain values of any type instead of just strings.

app.use(cors())

// routes
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/user',authMiddleware,userRoutes)
app.use('/api/v1/post',authMiddleware,postRoutes)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

// console.log(errorHandlerMiddleware);

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

