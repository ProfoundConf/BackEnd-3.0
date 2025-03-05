const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    email: { type: String },
    password: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);