// backend/controllers/reportController.js

const Report = require('../models/Report'); 

// @desc    Mock AI Chat endpoint
// @route   POST /api/reports/ai-chat
exports.aiChat = (req, res) => {
    const { symptoms } = req.body;

    // Mock AI logic
    let response = `Thank you for detailing "${symptoms}". Based on these symptoms, please prioritize calling a doctor via video and follow these steps: 1. Keep the patient calm. 2. Do not move the patient unless necessary. 3. Monitor breathing.`;
    
    res.json({ success: true, response });
};

// @desc    Save the compiled AI chat history as a formal Report
// @route   POST /api/reports/
exports.generateReport = async (req, res) => {
    const { patientEmail, conversationHistory, finalSummary } = req.body;

    try {
        const report = new Report({
            patientEmail,
            conversation: conversationHistory,
            finalSummary,
            // status defaults to 'final'
        });

        await report.save();

        res.status(201).json({ 
            success: true, 
            message: "Report saved successfully.",
            report 
        });

    } catch (error) {
        console.error('Report save error:', error);
        res.status(500).json({ success: false, message: 'Could not save report.' });
    }
};

// @desc    Get all reports for a specific patient
// @route   GET /api/reports/myreports/:email
exports.getPatientReports = async (req, res) => {
    const { email } = req.params;
    
    try {
        // Find reports belonging to the specified email
        const reports = await Report.find({ patientEmail: email }).sort({ createdAt: -1 });
        
        // Safety check for user accessing their own reports vs doctor accessing reports
        if (req.role === 'user' || req.role === 'patient') {
            if (req.user.email !== email) { // assuming we pass user in req object, but using token is safer
                // Basic check to prevent users from viewing reports of other users
                return res.status(403).json({ success: false, message: 'Unauthorized access to other patient reports.' });
            }
        }
        
        res.json(reports);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Could not retrieve patient reports.' });
    }
};

// @desc    Get all reports in the database (Admin/Doctor route)
// @route   GET /api/reports/
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find({}).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Could not retrieve all reports.' });
    }
};