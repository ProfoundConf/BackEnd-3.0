const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: { type: String },
    address: { type: String },
    phone: { type: String },
    maxPeople: { type: Number },
});

module.exports = mongoose.model('Contact', ContactSchema);