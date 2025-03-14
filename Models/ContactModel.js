const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId

const ContactSchema = new mongoose.Schema({
    fullName: { type: String },
    age: { type: Number },
    phone: { type: String },
    email: { type: String },
    city: { type: String },
    church: { type: String },
    sex: {
        type: String,
        enum: ['M', 'F'],
    },
    eatDays: { 
        Fr: Boolean,
        Sa: Boolean,
    },
    location: {
        type: ObjectId,
        ref: 'Address'
    },
    services: [String],
    needAccommodation: { type: Boolean },
    arrived: { type: Boolean },
    paid: { type: Boolean },
    chatId: { type: Number },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('ContactsNew', ContactSchema);