const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true,

    },
    complete: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        require: true, 
        ref: 'users'
    }
}, {
    timestamps: true
})

const task = mongoose.model('task', taskSchema)

module.exports = task

