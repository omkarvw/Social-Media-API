const app = require('./app')
const mongoose = require('mongoose')
const connectDB = require('./config/connect')
const { logEvents } = require('./middleware/logger')


const PORT = process.env.port || 3000
mongoose.set("strictQuery", true);

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => { console.log('Server is listening on port ' + PORT); })
    } catch (err) {
        logEvents(`${err.message}`, 'mongoErrLog.log')
        console.log(err);
    }
}

start()