import React from "react";

// --- Helper Function to Simulate Mapping ---
// This function converts lat/lng coordinates into dynamic CSS percentages
const getSimulatedPosition = (location) => {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        // Default static position if input data is invalid
        // For the ambulance, we will handle this in the component itself.
        return { top: '33%', left: '66%' }; 
    }
    
    // NOTE: This is a massive simplification! Real maps are complex.
    // We scale the lat/lng values (which are typically between 12 and 77 in your test data) 
    // to fit the 100% space of the map stub.

    // Scaling the Lat (Top/Bottom - y-axis)
    // Assuming relevant lat range is 12.8 to 13.0 (for demonstration)
    const normalizedLat = ((location.lat - 12.8) / 0.2) * 100;
    const yPercent = Math.min(Math.max(normalizedLat, 10), 80); // Clamp between 10% and 80%

    // Scaling the Lng (Left/Right - x-axis)
    // Assuming relevant lng range is 77.5 to 77.7 (for demonstration)
    const normalizedLng = ((location.lng - 77.5) / 0.2) * 100;
    const xPercent = Math.min(Math.max(normalizedLng, 20), 85); // Clamp between 20% and 85%
    
    // We invert the Y-axis percentage because lower latitudes should be visually lower (larger pixel value)
    return { top: `${yPercent}%`, left: `${xPercent}%` };
};
// ------------------------------------------

export default function MapStub({ assigned, ambulanceLocation, patientLocation, status }) {
    
    // 1. Determine if the ambulance has a live, numeric location object
    // 🎯 REMOVED: No more "live" check. We rely on the initial location.
    // The driverLocation passed from Dashboard.jsx is always null, so we must rely on a placeholder/initial location.

    // 2. Get the patient's coordinates (need to extract from string for simulation)
    const patientCoordsMatch = patientLocation.match(/lat\s*([\d.]+),\s*lng\s*([\d.]+)/);
    const patientLat = patientCoordsMatch ? parseFloat(patientCoordsMatch[1]) : null;
    const patientLng = patientCoordsMatch ? parseFloat(patientCoordsMatch[2]) : null;
    
    // 3. Get simulated positions
    const patientSimulatedPos = getSimulatedPosition({ lat: patientLat || 12.91, lng: patientLng || 77.64 });
    
    // 🎯 FIX: Ambulance location is static and relies on a hardcoded point for the demo.
    // If you want it to move when status changes, MapStub would need the starting coordinates of the ambulance.
    const ambulanceSimulatedPos = { top: '33%', left: '66%' }; 


  return (
    <div className="h-64 md:h-72 w-full rounded-3xl overflow-hidden bg-gradient-to-br from-sky-50 to-indigo-50 border border-white/60 shadow-inner relative">
      {/* Subtle map grid */}
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] [background-size:25px_25px]"></div>
        
        {/*
          NOTE: A real map would calculate the route line here (polyline).
          Since this is a stub, we skip the polyline for simplicity.
        */}

      {/* Patient pin (Dynamic position) */}
      <div 
        className="absolute text-center"
        style={{ top: patientSimulatedPos.top, left: patientSimulatedPos.left, transform: 'translate(-50%, -50%)' }}
      >
        <div className="w-5 h-5 bg-rose-500 rounded-full ring-4 ring-rose-200 animate-ping-slow mx-auto"></div>
        <p className="text-xs mt-2 text-slate-700 font-medium">Patient</p>
      </div>

      {/* Ambulance pin (Static position for demo) */}
      {assigned && (
        <div 
          className="absolute text-center" // Removed transition as there is no movement
          style={{ top: ambulanceSimulatedPos.top, left: ambulanceSimulatedPos.left, transform: 'translate(-50%, -50%)' }}
        >
          <div
            className={`w-5 h-5 rounded-full ring-4 ${
                assigned // Always assigned in this block
                ? "bg-emerald-500 ring-emerald-200" // Simple green for assigned status
                : "bg-slate-400 ring-slate-200 animate-pulse" // Only pulse if searching
              } mx-auto`}
          ></div>
          <p className="text-xs mt-2 text-slate-700 font-medium">
            {assigned ? `🚑 Ambulance (${status || 'Assigned'})` : "Searching..."}
          </p>
        </div>
      )}

      {/* Info overlay with actual values */}
      <div className="absolute bottom-3 left-4 text-[11px] text-slate-700 bg-white/80 px-3 py-2 rounded-xl shadow-sm">
        <p className="font-semibold mb-1">Live Snapshot</p>
        <p>
          👤 Patient:{" "}
          <span className="font-medium">
            {patientLocation || "Unknown"}
          </span>
        </p>
        <p>
          🚑 Ambulance:{" "}
          <span className="font-medium">
            {/* 🎯 FIX: Display the static status, not confusing Lat/Lng data */}
            {assigned
              ? `Status: ${status || 'Assigned'}`
              : "Searching for Ambulance..."}
          </span>
        </p>
      </div>

      {/* Optional text overlay */}
      <div className="absolute bottom-3 right-4 text-[11px] text-slate-500 italic">
        Simulated map — replace with Google Maps or Leaflet later
      </div>
    </div>
  );
}