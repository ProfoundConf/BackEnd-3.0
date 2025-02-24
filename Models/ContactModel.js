const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    fullName: { type: String },
    age: { type: String },
    phone: { type: String },
    email: { type: String },
    city: { type: String },
    church: { type: String },
    eatDays: { 
        Fr: Boolean,
        Sa: Boolean,
    },
    location: {
        type: ObjectId,
        ref: 'Address'
    },
    arrived: { type: Boolean },
    paid: { type: Boolean }
});

module.exports = mongoose.model('Contact', ContactSchema);