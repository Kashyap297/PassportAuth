const mongoose = require('mongoose')
// mongoose.connect('mongodb+srv://kashyap29700:hJMbbrThhO5fcH80@cluster0.6lpuf6e.mongodb.net/')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true })

const userModel = mongoose.model('users', userSchema)
module.exports = { userModel }