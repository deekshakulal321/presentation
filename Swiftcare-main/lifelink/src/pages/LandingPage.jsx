import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [locationText, setLocationText] = useState("Detecting your location...");
  const [manualLocation, setManualLocation] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationText("⚠️ Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationText(
          `📍 Location detected — lat ${latitude.toFixed(2)}, lng ${longitude.toFixed(2)}`
        );
      },
      () => {
        setLocationText("❌ Location not available. Enter your city or area manually.");
      },
      { timeout: 7000 }
    );
  }, []);

  const handleEmergencyClick = () => {
    if (locationText.startsWith("📍 Location detected")) {
      navigate("/emergency", { state: { location: locationText } });
    } else if (manualLocation.trim() !== "") {
      navigate("/emergency", { state: { location: manualLocation } });
    } else {
      alert("⚠️ Please enable GPS or enter location manually before continuing!");
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="overflow-x-hidden text-gray-100 scroll-smooth relative">
      {/* 🔹 Background - exactly like your image */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/free-photo/modern-ambulance-parked-city-street-night_23-2150807912.jpg?size=1900')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          filter: "brightness(0.45) saturate(1.2)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f24]/90 via-[#102a49]/85 to-[#1a3a6d]/70"></div>
      </div>

      {/* 🔹 Navbar - same structure, new dark-glass style */}
      <header className="fixed top-0 left-0 w-full flex justify-center md:justify-end gap-10 px-10 py-6 text-white font-semibold text-lg z-20 backdrop-blur-md bg-white/10 border-b border-white/10 shadow-md">
        <button
          onClick={() => scrollToSection("services")}
          className="hover:text-cyan-300 transition-colors duration-200"
        >
          Services
        </button>
        <button
          onClick={() => scrollToSection("about")}
          className="hover:text-cyan-300 transition-colors duration-200"
        >
          About Us
        </button>
      </header>

      {/* 🔹 Hero Section */}
      <section
        id="home"
        className="relative flex flex-col items-center justify-center min-h-screen w-full pt-20 px-6 text-center"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-10 md:p-12 max-w-3xl w-[90%] mx-auto relative overflow-hidden">
          {/* Light glow effect inside card */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-blue-600/10 pointer-events-none"></div>

          {/* Logo and title */}
          <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2966/2966489.png"
              alt="SwiftCare logo"
              className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md"
            />
            <h1 className="text-5xl font-extrabold text-[#6fffe9] drop-shadow-[0_0_15px_#6fffe980]">
              SwiftCare
            </h1>
          </div>

          <p className="text-gray-200 text-lg mb-8 leading-relaxed relative z-10">
            Book ambulances instantly, connect with doctors, and get AI-powered emergency
            assistance — all in one platform.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center relative z-10">
            <button
              onClick={handleEmergencyClick}
              className="px-8 py-4 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_20px_rgba(255,100,70,0.6)] hover:scale-105 transition-transform duration-300"
            >
              🆘 Emergency Mode
            </button>

            <button
              onClick={() => navigate("/user/login")}
              className="px-8 py-4 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(70,180,255,0.6)] hover:scale-105 transition-transform duration-300"
            >
              👤 Sign In / Sign Up
            </button>
          </div>

          {/* Location input box */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 shadow-inner w-full sm:w-[80%] mx-auto text-sm text-gray-200 relative z-10">
            <p className="mb-2">{locationText}</p>

            {locationText.startsWith("❌ Location not available") && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="Enter your city or area"
                  className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/30 placeholder-gray-300 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                />
                <button
                  onClick={handleEmergencyClick}
                  className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-all"
                >
                  Use
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🔹 Services Section - same layout, dark glass */}
      <section
        id="services"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-16 bg-transparent"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-10 md:p-12 w-[90%] max-w-5xl border border-white/20 text-gray-100">
          <h2 className="text-4xl font-bold text-cyan-300 mb-10 drop-shadow-[0_0_10px_#00ffff90]">
            Our Services
          </h2>

          <div className="flex overflow-x-auto gap-6 px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
            {[
              {
                title: "🚑 24/7 Ambulance Booking",
                desc: "Instant ambulance booking and live tracking near your area.",
              },
              {
                title: "👨‍⚕️ Doctor Consultation",
                desc: "Connect instantly with nearby doctors and hospitals.",
              },
              {
                title: "🧭 Real-time Location Detection",
                desc: "Accurate live GPS for emergency and pickup location.",
              },
              {
                title: "📄 Health Reports",
                desc: "Get AI-generated emergency summaries and reports.",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="min-w-[260px] max-w-[300px] bg-white/10 border border-white/20 shadow-lg rounded-2xl p-6 flex-shrink-0 snap-center hover:scale-105 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-cyan-300 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 About Section - same layout */}
      <section
        id="about"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 bg-transparent"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-10 md:p-12 w-[90%] max-w-4xl border border-white/20 text-gray-200">
          <h2 className="text-4xl font-bold text-[#6fffe9] mb-6">
            About Us
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl leading-relaxed text-justify">
            SwiftCare is an advanced AI-powered healthcare and emergency response platform
            designed to make medical assistance faster, smarter, and more reliable.
            <br /><br />
            Our mission is to save lives by connecting users instantly with nearby ambulances,
            hospitals, and medical professionals — all through one seamless digital interface.
            <br /><br />
            SwiftCare integrates AI Chat for instant guidance, real-time Maps for ambulance tracking,
            Video consultations with doctors, and automated Medical Reports for each session.
            <br /><br />
            With 24/7 availability and cutting-edge technology, SwiftCare ensures that help is always within reach.
          </p>
        </div>
      </section>
    </div>
  );
}
