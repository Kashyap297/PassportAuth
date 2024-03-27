const mongoose = require('mongoose')
// mongoose.connect('mongodb+srv://kashyap29700:hJMbbrThhO5fcH80@cluster0.6lpuf6e.mongodb.net/')

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    blogimage: {
        type: String,
        required: true,
    },
    username : {
        type : String,
    }
}, { timestamps: true })

const blogModel = mongoose.model('blog', blogSchema)
module.exports = { blogModel }