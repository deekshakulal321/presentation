// backend/models/User.js 
// This file is critically required for authentication to run.

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  password: { 
    type: String,
    required: true,
  },
  role: { 
    type: String,
    enum: ['patient', 'doctor', 'admin', 'driver', 'user'], 
    default: 'user',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
  },
  specialization: { 
    type: String,
  },
}, {
    timestamps: true 
});

module.exports = mongoose.model('User', UserSchema);