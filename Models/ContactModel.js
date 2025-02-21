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
        address: { type: String },
        phone: { type: String },
        color: { type: String },
        needAccommodation: { type: Boolean }
    },
    arrived: { type: Boolean },
    paid: { type: Boolean },
    password: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);