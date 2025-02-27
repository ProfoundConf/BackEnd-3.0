const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId

const AddressSchema = new mongoose.Schema({
    address: { type: String },
    phone: { type: String },
    color: { type: String },
    maxCount: { type: Number },
    femaleCount: { type: Number },
    maleCount: { type: Number },
});

module.exports = mongoose.model('Address', AddressSchema);