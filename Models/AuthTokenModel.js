const mongoose = require('mongoose')

const AuthTokenSchema = new moongoose.Schema({
    accessToken: {
        type: String,
        required: true
    },
    contactId: {
        type: moongoose.Types.ObjectId,
        ref: 'Contact'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('AuthToken', AuthTokenSchema);