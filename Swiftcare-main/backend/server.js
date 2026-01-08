const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Load environment variables
dotenv.config();

// --- Import Models and Routes ---
const Ambulance = require('./models/Ambulance'); 
const authRoutes = require('./routes/authRoutes'); 
const ambulanceRoutes = require('./routes/ambulanceRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with credentials for targeted Socket.IO communication
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], 
    methods: ["GET", "POST", "PATCH"],
    credentials: true, 
  },
});

// CRITICAL: Store io instance for controllers to access targeting logic
app.set('socketio', io); 

// --- Database Connection ---
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// --- Seed Ambulances (Initial data population and Reset Logic) ---
const seedAmbulances = async () => {
    try {
        // Reset all ambulances to available on startup to prevent deadlocks
        await Ambulance.updateMany({}, { $set: { available: true } });
        console.log('Ambulance availability reset successfully.');

        // Check if any ambulances already exist
        const existing = await Ambulance.countDocuments();
        if (existing === 0) {
             const initialAmbulances = [
                 // 🎯 TARGETING FIX: These emails MUST match the login emails used in Auth
                 { 
                    ambulanceName: "SwiftCare-01", 
                    hospitalName: "City General Hospital", 
                    driverEmail: "driver1@swiftcare.com", 
                    driverName: "Driver 1", 
                    driverPhone: "87541265", 
                    available: true, 
                    location: "12.910, 77.640" 
                 },
                 { 
                    ambulanceName: "SwiftCare-02", 
                    hospitalName: "Metro Care Hospital", 
                    driverEmail: "driver2@swiftcare.com", 
                    driverName: "Driver 2", 
                    driverPhone: "7788994425", 
                    available: true, 
                    location: "12.920, 77.650" 
                 },
             ];
             await Ambulance.insertMany(initialAmbulances);
             console.log('Ambulance models seeded successfully with driver emails.');
        }
    } catch (error) {
        console.error('Error seeding ambulances:', error.message);
    }
};

// --- Socket.IO Real-time Logic ---

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // 🎯 TARGETED NOTIFICATION FIX: 
    // Drivers join a room named after their unique email.
    // This allows the backend to notify them individually.
    socket.on('join_driver_room', (driverEmail) => {
        if (driverEmail) {
            const roomName = `room_${driverEmail}`;
            socket.join(roomName);
            console.log(`Driver [${driverEmail}] joined private room: ${roomName}`);
        }
    });
    
    // Drivers also join the general dispatch for unassigned system-wide updates
    socket.on('join_dispatch', () => {
        socket.join('dispatch_room');
        console.log("Socket joined general dispatch_room");
    });
    
    // Patients join a room specific to their unique assignment ID
    socket.on('join_assignment', (assignmentId) => {
        socket.join(`assignment_${assignmentId}`);
        console.log(`Client joined assignment room: assignment_${assignmentId}`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/reports', reportRoutes);

app.get("/", (req, res) => res.send("SwiftCare Backend Running."));

// --- Start DB Connection and Server ---
connectDB().then(() => {
    seedAmbulances(); 
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});