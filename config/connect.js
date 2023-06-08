const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('successfully connected to MongoDB')
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB