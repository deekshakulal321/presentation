// backend/models/Assignment.js

const mongoose = require('mongoose');

// 🛑 CRITICAL FIX: Ensure Mongoose doesn't use a cached, stale schema.
// This line forcefully removes the 'Assignment' model if it exists, solving the persistent enum error.
if (mongoose.models && mongoose.models.Assignment) {
    mongoose.deleteModel('Assignment');
}

const AssignmentSchema = new mongoose.Schema({
  patientEmail: { // Links to the user who requested the ambulance
    type: String,
    required: true
  },
  patientName: String,
  patientMobile: String, // Added in a previous step for registered user contact info
  patientLocation: { // Location entered by the patient
    type: String,
    required: true
  },
  emergencyType: String,
  
  // Link to the assigned Ambulance document
  ambulanceId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ambulance',
    required: true
  },
  ambulanceName: String,
  driverName: String,
  driverPhone: String,
  hospitalName: String,

  status: { 
    type: String,
    // VERIFIED: 'cancelled' is now correctly included
    enum: ['assigned', 'en-route', 'arrived', 'completed', 'cancelled'], 
    default: 'assigned' 
  },
  
  assignedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);