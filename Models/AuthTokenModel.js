const mongoose = require('mongoose')

const AuthTokenSchema = new mongoose.Schema({
    accessToken: {
        type: String,
        required: true
    },
    contactId: {
        type: mongoose.Types.ObjectId,
        ref: 'Contact'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('AuthToken', AuthTokenSchema);