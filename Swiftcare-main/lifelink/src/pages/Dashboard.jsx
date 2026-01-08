import React, { useState, useEffect } from "react";
import Navbar from "../ui/Navbar.jsx";
import FeatureCard from "../ui/FeatureCard.jsx";
import MapStub from "../ui/MapStub.jsx";
import VideoCallStub from "../ui/VideoCallStub.jsx";
import AIHelp from "../ui/AIHelp.jsx";
import { Stethoscope, Bot, MapPinned, XCircle } from "lucide-react"; 

// 🎯 CRITICAL IMPORTS
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from "../auth/AuthContext.jsx"; 

const socket = io('http://localhost:5000', {
    withCredentials: true,
}); 

const API_BASE_URL = "http://localhost:5000/api/ambulance";

export default function Dashboard({ emergencyMode = false }) {
    const { user, token } = useAuth(); 
    
    const [assigned, setAssigned] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [assignment, setAssignment] = useState(null);
    const [error, setError] = useState("");

    const [driverLocation, setDriverLocation] = useState(null); 
    const [completionMessage, setCompletionMessage] = useState(null); 

    const [userLocation, setUserLocation] = useState("Detecting location..."); 

    // 🎯 THE FINAL FIX: Strict Session Priority (Bypasses Ghost/Previous Locations)
    useEffect(() => {
        // 1. Database Priority: If an assignment is active, use that location
        if (assignment?.patientLocation) {
            setUserLocation(assignment.patientLocation);
            return;
        }

        // 🎯 2. GHOST-PROOF CHECK: Use ONLY sessionStorage for the current tab's life
        // This stops Chrome from grabbing "Previous" locations from other sessions.
        const sessionLoc = sessionStorage.getItem("swift_location");
        const isManualFlag = sessionStorage.getItem("location_type") === "manual";
        
        if (sessionLoc && sessionLoc.trim() !== "" && sessionLoc !== "Detecting location...") {
            setUserLocation(sessionLoc);
            
            // THE LOCK: If this was a manual entry in the current tab, STOP GPS detection immediately.
            if (isManualFlag || !sessionLoc.includes("lat")) {
                console.log("Verified fresh manual address. GPS detection disabled.");
                return; 
            }
        }

        // 3. Fallback: Detect location ONLY if no current session data exists
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Update state with fresh GPS coordinates
                    const freshLoc = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
                    setUserLocation(freshLoc);
                    // Store in session so it persists on refresh in this tab
                    sessionStorage.setItem("swift_location", freshLoc);
                    sessionStorage.setItem("location_type", "auto");
                },
                (geoError) => {
                    console.warn("Geolocation blocked. Looking for manual fallback.");
                    // Final safety check
                    const fallback = sessionStorage.getItem("swift_location") || user?.location;
                    if (fallback) setUserLocation(fallback);
                    else setUserLocation("Location Required");
                },
                { timeout: 5000 }
            );
        }
    }, [user, assignment?.patientLocation]); 


    // --- REAL-TIME LISTENER SETUP ---
    useEffect(() => {
        if (assignment?._id) { 
            socket.emit('join_assignment', assignment._id);

            socket.on('status_update', (data) => {
                if (data.id === assignment._id) {
                    const newStatus = data.status;
                    if (newStatus === 'completed' || newStatus === 'cancelled') {
                        setAssigned(false); 
                        setCompletionMessage(newStatus === 'completed' ? "Service completed successfully!" : "Emergency call cancelled.");
                        setAssignment(null); 
                        setTimeout(() => setCompletionMessage(null), 8000); 
                    } else {
                        setAssignment(prev => ({ ...prev, status: newStatus }));
                    }
                }
            });
        }
        return () => socket.off('status_update');
    }, [assignment?._id]); 


    const handleAssignAmbulance = async () => {
        if (!userLocation || userLocation.includes("Detecting")) {
            setError("Location missing. Please enter manually.");
            return;
        }

        if (!token && !emergencyMode) { 
            setError("Please sign in or use Emergency Mode.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const payload = {
                patientName: user?.name || "Emergency User",
                patientEmail: user?.email || "unauthenticated_emergency",
                patientLocation: userLocation, 
                emergencyType: emergencyMode ? "Critical Emergency" : "General Emergency",
                patientMobile: user?.mobileNumber 
            };

            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.post(`${API_BASE_URL}/assign`, payload, { headers });

            if (res.data.success) {
                setAssigned(true);
                setAssignment(res.data.assignment);
                setUserLocation(res.data.assignment.patientLocation);
            } else {
                setError(res.data.message || "Failed to assign ambulance");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Backend not reachable.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCancelAssignment = async () => {
        if (!assignment) return;
        if (!window.confirm("Cancel call?")) return;
        setIsLoading(true);
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.patch(`${API_BASE_URL}/assignment/${assignment._id}/cancel`, {}, { headers });
            setError(null);
        } catch (err) {
            setError("Error during cancellation.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh">
            <Navbar emergencyMode={emergencyMode} />

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
                <section className="bg-white/80 backdrop-blur rounded-3xl p-6 md:p-8 shadow-glow ring-1 ring-white mb-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-rainbow">
                                {emergencyMode ? "🚨 Emergency Mode" : "SwiftCare Dashboard"}
                            </h1>

                            <div className="text-slate-600">
                                {emergencyMode ? "Instant ambulance booking active." : "Assign nearest ambulance and stream vitals."}
                            </div>

                            <p className="text-sm text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg inline-block border border-emerald-100">
                                📍 Pickup Point: <b>{userLocation}</b>
                            </p>
                            
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleAssignAmbulance}
                                    disabled={isLoading || (assigned && assignment?.status === 'assigned')}
                                    className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 transition shadow-lg disabled:opacity-60"
                                >
                                    <MapPinned className="w-5 h-5" />
                                    {isLoading ? "Processing..." : assigned && assignment ? `Status: ${assignment.status.toUpperCase()}` : "Assign Ambulance"}
                                </button>
                                
                                {assigned && assignment && assignment.status === 'assigned' && (
                                    <button
                                        onClick={handleCancelAssignment}
                                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow-lg"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {completionMessage && <p className="font-bold text-green-600 animate-bounce">{completionMessage}</p>}
                            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

                            {assigned && assignment && (
                                <div className="mt-4 p-4 bg-white rounded-xl shadow border border-emerald-100 animate-in fade-in">
                                    <h3 className="font-bold text-green-700">🚑 Ambulance Assigned!</h3>
                                    <p className="text-sm text-slate-700 mt-1">Ambulance: <b>{assignment.ambulanceName}</b></p>
                                    <p className="text-sm text-slate-700">Driver: <b>{assignment.driverName}</b></p>
                                    <p className="text-xs text-orange-600 font-bold mt-2 uppercase">Status: {assignment.status}</p>
                                </div>
                            )}
                        </div>

                        <MapStub
                            assigned={assigned}
                            ambulanceLocation={assignment?.ambulanceLocation} 
                            patientLocation={userLocation}
                            status={assignment?.status} 
                        />
                    </div>
                </section>

                <section className="grid md:grid-cols-2 gap-6 mb-8">
                    <FeatureCard title="Doctor Video" desc="Instant consultation." icon={<Stethoscope />} gradient="from-rose-400 to-indigo-400" />
                    <FeatureCard title="AI First-Aid" desc="Triage support." icon={<Bot />} gradient="from-amber-400 to-pink-400" />
                </section>

                <div className="grid xl:grid-cols-3 gap-8 pb-10">
                    <div className="xl:col-span-2 space-y-8">
                        <VideoCallStub />
                        {!emergencyMode && <AIHelp />}
                    </div>
                </div>
            </div>
        </div>
    );
}