// backend/models/Report.js

const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    patientEmail: { 
        type: String,
        required: true
    },
    conversation: {
        type: [Object],
        required: true
    },
    finalSummary: { 
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'final', 'reviewed'],
        default: 'final'
    },
}, {
    timestamps: true
},




);

module.exports = mongoose.model('Report', ReportSchema);