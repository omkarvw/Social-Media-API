const mongoose = require('mongoose')

const connectDB = async () => {
    console.log('visited')
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('successful')
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB