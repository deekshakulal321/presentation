# 🚑 SwiftCare – Smart Emergency Healthcare System

SwiftCare is a full-stack AI-powered emergency healthcare platform that enables instant ambulance booking, real-time tracking, AI-based first-aid guidance, and automated medical reporting.

Designed to reduce response time and improve emergency care, SwiftCare connects patients, drivers, and healthcare services into a single intelligent system.

---

## 🚀 Key Features

🚨 Instant Ambulance Booking  
- One-click emergency mode  
- Assigns nearest available ambulance  
- Works for both logged-in users and guest users  

📍 Smart Location System  
- Automatic GPS detection  
- Manual location entry  
- Session-based storage (prevents wrong location reuse)  

🧭 Real-Time Tracking  
- Live ambulance status updates: Assigned → En-route → Arrived → Completed  
- Powered by Socket.IO  
- Targeted driver notifications  

👨‍✈️ Driver Dashboard  
- Accept emergency requests  
- Update trip status  
- View patient details  
- Receive real-time alerts  

🤖 AI First-Aid Assistant  
- Rule-based emergency guidance  
- Handles multiple conditions: bleeding, burns, fractures, heart attack, seizures, poisoning, dehydration, etc.  

🧾 AI Health Report  
- Auto-generates report from conversation  
- Includes symptoms + AI suggestions  
- Downloadable as .txt  

📂 Report History  
- Stores previous reports  
- Patients and doctors can view history  

🔐 Authentication & Authorization  
- JWT-based authentication  
- Role-based access control: User, Driver, Doctor, Admin  

🗺️ Map Visualization (Prototype)  
- Simulated map for ambulance tracking  
- Ready for real map integration  

---

## 🏗️ Tech Stack

Frontend  
- React.js  
- Tailwind CSS  
- Axios  
- Socket.IO Client  

Backend  
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT Authentication  
- Socket.IO  

---

## 📁 Project Structure

SwiftCare/  
│  
├── frontend/  
│   ├── components/  
│   │   ├── Dashboard.jsx  
│   │   ├── DriverDashboard.jsx  
│   │   ├── LandingPage.jsx  
│   │   ├── AIHelp.jsx  
│   │   ├── ReportGenerator.jsx  
│   │   ├── ReportHistory.jsx  
│   │   └── MapStub.jsx  
│   ├── auth/  
│   │   └── AuthContext.jsx  
│  
├── backend/  
│   ├── controllers/  
│   │   └── ambulanceController.js  
│   ├── middleware/  
│   │   └── auth.js  
│   ├── models/  
│   ├── routes/  
│  
└── README.md  

---

## ⚙️ Installation

1. Clone Repo  
git clone https://github.com/your-username/swiftcare.git  
cd swiftcare  

2. Backend Setup  
cd backend  
npm install  

Create .env file  
PORT=5000  
MONGO_URI=your_mongodb_uri  
JWT_SECRET=your_secret_key  

Run backend  
npm start  

3. Frontend Setup  
cd frontend  
npm install  
npm start  

---

## 🔌 API Endpoints

POST    /api/ambulance/assign          → Assign ambulance  
PATCH   /assignment/:id/accept         → Driver accepts  
PATCH   /assignment/:id/status         → Update status  
PATCH   /assignment/:id/cancel         → Cancel request  
GET     /assignments/active            → Get active calls  

---

## 🔄 Workflow

1. User logs in or uses emergency mode  
2. Location is detected or entered  
3. Request sent to backend  
4. Ambulance assigned  
5. Driver receives real-time alert  
6. Driver updates status  
7. User tracks ambulance  
8. AI gives first-aid help  
9. Report generated and saved  

---

## 💡 Highlights

- Targeted Socket.IO (driver-specific alerts)  
- AI-based emergency assistance  
- Real-time system  
- Smart location handling  
- Automatic report generation  
- Secure authentication  

---

## 🔮 Future Improvements

- Google Maps integration  
- Voice-based AI assistant  
- Mobile app (React Native)  
- Hospital integration  
- Online payments  

---

## 👩‍💻 Author

DEEPA , DEEKSHA , LAVANYA , YUKTHI  
B.E CSE Students | Aspiring Software Developers 

---

## ⭐ Support

If you like this project  
- Star the repo  
- Fork it  
- Give feedback  
