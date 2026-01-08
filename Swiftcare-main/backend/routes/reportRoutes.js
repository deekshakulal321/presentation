// backend/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
// IMPORTANT: This assumes you created the reportController.js file in controllers/
const reportController = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/auth'); 

// --- PUBLIC/PROTECTED Routes ---

// POST /api/reports/ai-chat: Endpoint for AI conversation (First-Aid logic)
router.post('/ai-chat', reportController.aiChat);

// POST /api/reports/: Generates and saves a formal report from the chat history
// Only users or patients can generate reports
router.post('/', protect, restrictTo('user', 'patient'), reportController.generateReport);

// GET /api/reports/: Gets all reports (Admin/Doctor access)
router.get('/', protect, restrictTo('admin', 'doctor'), reportController.getAllReports);

// GET /api/reports/myreports/:email: Get reports for a specific patient
router.get('/myreports/:email', protect, reportController.getPatientReports);


module.exports = router;