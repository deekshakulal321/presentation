// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model

// Import the controller code where registerUser and loginUser are defined
// NOTE: This assumes these functions are located in ambulanceController.js based on your previous code.
const authController = require('../controllers/ambulanceController'); 

// The 'protect' middleware is only commented out for the users route for ease of testing 
// if you have an Admin dashboard trying to fetch user data.
// const { protect, restrictTo } = require('../middleware/auth'); 

// --- Public Routes (No token required) ---

// POST /api/auth/register: Create a new user account
router.post('/register', authController.registerUser);

// POST /api/auth/login: Authenticate a user
router.post('/login', authController.loginUser);


// --- Protected Routes (Middleware REMOVED for local mock testing) ---

// GET /api/auth/users: Get all user accounts (Admin Panel required)
router.get(
    '/users', 
    // protect, // Commented out for mock token compatibility
    // restrictTo('admin'), // Commented out for mock token compatibility
    async (req, res) => {
        try {
            // Find all users using the correct 'User' model
            const users = await User.find({}).select('-password'); 
            res.json(users);
        } catch (err) {
            console.error("Error fetching all users for admin:", err);
            res.status(500).json({ success: false, message: 'Server error fetching all users.' });
        }
    }
);

module.exports = router;