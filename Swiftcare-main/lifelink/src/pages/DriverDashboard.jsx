import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { useAuth } from "../auth/AuthContext.jsx";
import { Truck, MapPin, Phone, AlertCircle } from 'lucide-react'; 
import { socket } from "../socket.js"; 

const API_BASE_URL = "http://localhost:5000/api/ambulance";

export default function DriverDashboard() {
    const { user, token } = useAuth();
    
    const [assignments, setAssignments] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    
    // --- Helper to handle authorized requests ---
    const getAuthHeaders = useCallback(() => {
        if (!token) {
            setError("Authentication token missing. Please log in.");
            return null;
        }
        return { Authorization: `Bearer ${token}` };
    }, [token]);

    // Fetch active assignments
    const fetchAssignments = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) {
            setLoading(false);
            return;
        }
        try {
            const res = await axios.get(`${API_BASE_URL}/assignments/active`, { headers });
            setAssignments(res.data);
            setError("");
        } catch (err) {
            console.error("Fetch Error:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Failed to fetch assignments.");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    // --- 1. Assignment Acceptance ---
    const handleAccept = async (id) => {
        const headers = getAuthHeaders();
        if (!headers) return;
        
        try {
            const res = await axios.patch(`${API_BASE_URL}/assignment/${id}/accept`, {}, { headers });
            
            if (!res.data.success) {
                alert(res.data.message || "Failed to accept assignment.");
                fetchAssignments(); 
                return;
            }
            fetchAssignments();
        } catch (err) {
            alert(`Acceptance failed: ${err.response?.data?.message || err.message}`);
        }
    };

    // --- 2. Update Status ---
    const updateStatus = async (id, newStatus) => {
        const headers = getAuthHeaders();
        if (!headers) return;
        
        try {
            const res = await axios.patch(`${API_BASE_URL}/assignment/${id}/status`, 
                { status: newStatus },
                { headers }
            );
            
            if (!res.data.success) {
                alert(res.data.message || "Failed to update status");
                return;
            }
            fetchAssignments(); 
        } catch (err) {
            alert(`Update failed: ${err.response?.data?.message || err.message}`);
        }
    };
    
    // ----------------------------------------------------
    // --- 3. Targeted Socket Logic ---
    // ----------------------------------------------------
    useEffect(() => {
        if (user && (user.role === 'driver' || user.role === 'admin')) {
            fetchAssignments();
            
            // 🎯 THE TARGETING FIX:
            // This joins a private room unique to this driver's email.
            // Backend uses io.to(`room_${driverEmail}`).emit(...) to reach ONLY this driver.
            socket.emit('join_driver_room', user.email);
            
            // Join general room for system updates
            socket.emit('join_dispatch');
            
            // Listen for system-wide assignment updates
            socket.on('new_assignment', () => {
                console.log("New system-wide assignment detected.");
                fetchAssignments();
            });

            socket.on('assignment_updated', () => {
                fetchAssignments();
            });
            
            // 🎯 TARGETED EMERGENCY ALERT:
            // This listener reacts specifically to the private room message.
            socket.on('targeted_emergency', (data) => {
                console.log("🎯 PERSONAL EMERGENCY ALERT RECEIVED:", data);
                // You could play a siren sound here: new Audio('/siren.mp3').play();
                fetchAssignments();
            });
            
            return () => {
                socket.off('new_assignment');
                socket.off('assignment_updated');
                socket.off('targeted_emergency');
            };
        }
    }, [user, fetchAssignments]); 

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-slate-600 font-medium">Syncing with Dispatch...</p>
            </div>
        );
    }
    
    const StatusBadge = ({ status }) => {
        let color = "bg-slate-200 text-slate-800";
        if (status === "assigned") color = "bg-amber-100 text-amber-700 border border-amber-200";
        if (status === "en-route") color = "bg-blue-100 text-blue-700 border border-blue-200";
        if (status === "arrived") color = "bg-emerald-100 text-emerald-700 border border-emerald-200";
        if (status === "cancelled") color = "bg-red-100 text-red-700 border border-red-200"; 

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>
                {status.toUpperCase().replace('-', ' ')}
            </span>
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center">
                        <Truck className="mr-3 w-8 h-8 text-indigo-600" /> Driver Console
                    </h1>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">Logged in as:</p>
                        <p className="text-sm font-bold text-slate-800">{user?.name || user?.email}</p>
                    </div>
                </header>
                
                {error && (
                    <div className="p-4 mb-6 text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {assignments.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl shadow-sm text-center border-2 border-dashed border-slate-200">
                        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Truck className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No Active Requests</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">
                            You are currently on standby. New emergency calls will appear here in real-time.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {assignments.map((a) => {
                            const patientIdentifier = a._id ? a._id.substring(a._id.length - 5) : 'N/A';
                            
                            return (
                                <div key={a._id} className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 transition-all hover:shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="font-black text-xl text-slate-900">
                                                🚨 Emergency ID: #{a._id ? a._id.substring(18).toUpperCase() : 'N/A'} 
                                            </h2>
                                            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Priority Response Required</p>
                                        </div>
                                        <StatusBadge status={a.status || 'unknown'} />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-indigo-500" />
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Pickup Location</p>
                                                <p className="text-sm font-bold text-slate-800">{a.patientLocation || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-emerald-500" />
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Patient Contact</p>
                                                <p className="text-sm font-bold text-slate-800">{a.patientMobile || 'Not Provided'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {a.status === "assigned" && (
                                            <button
                                                onClick={() => handleAccept(a._id)}
                                                className="flex-1 min-w-[150px] px-6 py-3 rounded-2xl text-white text-sm font-black bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                                            >
                                                CLAIM & START TRIP
                                            </button>
                                        )}

                                        <button
                                            onClick={() => updateStatus(a._id, "arrived")}
                                            disabled={a.status !== "en-route"}
                                            className={`flex-1 min-w-[150px] px-6 py-3 rounded-2xl text-white text-sm font-black transition-all active:scale-95 ${
                                                a.status === "en-route" 
                                                ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" 
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            }`}
                                        >
                                            I HAVE ARRIVED
                                        </button>

                                        <button
                                            onClick={() => updateStatus(a._id, "completed")}
                                            disabled={a.status !== "arrived"} 
                                            className={`flex-1 min-w-[150px] px-6 py-3 rounded-2xl text-white text-sm font-black transition-all active:scale-95 ${
                                                a.status === "arrived"
                                                ? "bg-slate-900 hover:bg-black shadow-lg shadow-slate-300"
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            }`}
                                        >
                                            END SERVICE
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <footer className="mt-12 text-center">
                <p className="text-xs text-slate-400 font-medium italic">SwiftCare Emergency Dispatch v2.0 • Encryption Active</p>
            </footer>
        </div>
    );
}