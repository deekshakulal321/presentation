// backend/routes/ambulanceRoutes.js (FINAL CORRECTED VERSION with Acceptance and Cancellation)

const express = require('express');
const router = express.Router();
// const { protect, restrictTo } = require('../middleware/auth'); // COMMENT OUT AUTH MIDDLEWARE IMPORT
const ambulanceController = require('../controllers/ambulanceController');
const Ambulance = require('../models/Ambulance'); // Assuming Ambulance model is imported here

// --- Public Route (Assignment) ---
// This route must be PUBLIC to allow unauthenticated Emergency Mode access.
router.post('/assign', ambulanceController.assignAmbulance);

// --- Driver/Admin Routes (Protection REMOVED for Local Testing) ---

// Driver route: Updates the status of an assignment (e.g., Arrived, Completed)
router.patch(
    '/assignment/:id/status', 
    // protect, restrictTo('driver', 'admin'), // Commented out for mock token compatibility
    ambulanceController.updateAssignmentStatus
);

// 🎯 NEW ROUTE: Driver accepts and claims the assignment (sets status to 'en-route' and notifies all)
router.patch(
    '/assignment/:id/accept',
    // protect, restrictTo('driver', 'admin'), // Commented out for mock token compatibility
    ambulanceController.acceptAssignment
);

// 🎯 NEW ROUTE: User/Patient cancels the assignment (frees ambulance and resets patient UI)
router.patch(
    '/assignment/:id/cancel',
    ambulanceController.cancelAssignment
);


// Driver/Admin Route: Get all active assignments (CRITICAL FIX for Dashboard Load)
router.get(
    '/assignments/active', 
    // protect, restrictTo('driver', 'admin'), // Commented out for mock token compatibility
    ambulanceController.getActiveAssignments
);


// 👑 ADMIN ROUTE: Get all ambulances (for Admin Panel stats/management)
router.get(
    '/all', 
    // protect, restrictTo('admin'), // Commented out for mock token compatibility
    async (req, res) => {
        try {
            const ambulances = await Ambulance.find({}); 
            res.json(ambulances);
        } catch (err) {
            console.error("Error fetching all ambulances for admin:", err);
            res.status(500).json({ success: false, message: 'Could not fetch all ambulances.' });
        }
    }
);

module.exports = router;