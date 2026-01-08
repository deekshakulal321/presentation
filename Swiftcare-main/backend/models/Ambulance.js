// backend/models/Ambulance.js

const mongoose = require('mongoose');

const AmbulanceSchema = new mongoose.Schema({
  ambulanceName: {
    type: String,
    required: true,
    unique: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  // 🎯 CRITICAL ADDITION: This links the Ambulance to the Driver's Login Email
  // This is used to target the Socket.IO notification to the correct driver room.
  driverEmail: {
    type: String,
    required: true,
    unique: true
  },
  driverName: String,
  driverPhone: String,
  available: { // Tracks if ambulance is currently on assignment
    type: Boolean,
    default: true
  },
  location: { // Current location coordinates (or simulated text like "Udupi")
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Ambulance', AmbulanceSchema);