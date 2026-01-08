// backend/controllers/ambulanceController.js

const Ambulance = require('../models/Ambulance');
const Assignment = require('../models/Assignment');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// =========================================================
// --- AUTHENTICATION LOGIC ---
// =========================================================

// @desc    Register a new user (Fixes empty database issue)
exports.registerUser = async (req, res) => {
    const { name, email, password, role, mobileNumber } = req.body;
    
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, 
            email, 
            password: hashedPassword, 
            role: role || 'user', 
            mobileNumber,
        });

        if (user) {
            res.status(201).json({
                success: true,
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
                token: generateToken(user._id, user.role),
            });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                success: true,
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// =========================================================
// --- AMBULANCE LOGIC ---
// =========================================================

// @desc    Assign the nearest available ambulance and notify the SPECIFIC driver
exports.assignAmbulance = async (req, res) => {
    const { patientEmail, patientName, patientLocation, emergencyType, patientMobile } = req.body;

    if (!patientLocation) {
        return res.status(400).json({ success: false, message: 'Patient location required.' });
    }

    try {
        // 1. Find the FIRST available ambulance in the DB
        const freeAmbulance = await Ambulance.findOneAndUpdate(
            { available: true },
            { $set: { available: false } }, 
            { new: true } 
        );

        if (!freeAmbulance) {
            return res.status(409).json({ 
                success: false, 
                message: "All ambulances are currently busy." 
            });
        }

        const isRegisteredUser = patientEmail !== 'unauthenticated_emergency';
        const finalPatientName = isRegisteredUser ? patientName : 'Emergency User (Anonymous)';
        const finalPatientEmail = isRegisteredUser ? patientEmail : 'N/A';
        const finalPatientMobile = isRegisteredUser && patientMobile ? patientMobile : 'Not provided';

        const assignment = new Assignment({
            patientEmail: finalPatientEmail,
            patientName: finalPatientName,
            patientMobile: finalPatientMobile, 
            patientLocation, 
            ambulanceId: freeAmbulance._id,
            ambulanceName: freeAmbulance.ambulanceName,
            driverName: freeAmbulance.driverName,
            driverPhone: freeAmbulance.driverPhone,
            driverEmail: freeAmbulance.driverEmail, // Used for targeted socket room
            hospitalName: freeAmbulance.hospitalName,
            status: 'assigned',
        });

        await assignment.save();

        const io = req.app.get('socketio');

        // 🎯 THE FIX: TARGETED NOTIFICATION
        // Emit only to the room belonging to the driverEmail of the ambulance we just found.
        if (freeAmbulance.driverEmail) {
            const privateRoom = `room_${freeAmbulance.driverEmail}`;
            io.to(privateRoom).emit('targeted_emergency', assignment);
            console.log(`Notification sent strictly to: ${privateRoom}`);
        }

        // Keep general dispatch update for admin monitoring
        io.to('dispatch_room').emit('new_assignment', assignment); 

        res.status(201).json({
            success: true,
            message: "Ambulance assigned successfully.",
            assignment,
        });

    } catch (err) {
        console.error('Assignment error:', err);
        res.status(500).json({ success: false, message: 'Server error during assignment.' });
    }
};

exports.acceptAssignment = async (req, res) => {
    const { id } = req.params;
    try {
        const assignment = await Assignment.findById(id);
        if (!assignment || assignment.status !== 'assigned') {
            return res.status(409).json({ success: false, message: "Assignment unavailable." });
        }

        assignment.status = 'en-route';
        await assignment.save();

        const io = req.app.get('socketio');
        // Update both the driver pool and the specific patient tracking the ID
        io.to('dispatch_room').emit('assignment_updated', assignment);
        io.to(`assignment_${assignment._id}`).emit('status_update', { id: assignment._id, status: 'en-route' });

        res.json({ success: true, assignment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateAssignmentStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) return res.status(404).json({ success: false, message: "Not found" });

        assignment.status = status;
        await assignment.save();

        if (status === 'completed') {
            await Ambulance.updateOne({ _id: assignment.ambulanceId }, { $set: { available: true } });
        }
        
        const io = req.app.get('socketio');
        io.to(`assignment_${assignment._id}`).emit('status_update', { id: assignment._id, status });
        io.to('dispatch_room').emit('assignment_updated', assignment);

        res.json({ success: true, assignment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.cancelAssignment = async (req, res) => {
    const { id } = req.params;
    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) return res.status(404).json({ success: false, message: "Not found" });

        assignment.status = 'cancelled';
        await assignment.save();

        // Release ambulance back to pool
        await Ambulance.updateOne({ _id: assignment.ambulanceId }, { $set: { available: true } });

        const io = req.app.get('socketio');
        io.to(`assignment_${assignment._id}`).emit('status_update', { id: assignment._id, status: 'cancelled' });
        io.to('dispatch_room').emit('assignment_updated', assignment);

        res.json({ success: true, message: "Cancelled successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getActiveAssignments = async (req, res) => {
    try {
        const active = await Assignment.find({ status: { $in: ['assigned', 'en-route', 'arrived'] } }).sort({ assignedAt: 1 });
        res.json(active);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fetch failed' });
    }
};