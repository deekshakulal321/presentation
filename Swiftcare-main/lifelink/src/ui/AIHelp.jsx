import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

export default function AIHelp() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [report, setReport] = useState(null);

  // ✅ Rule-based AI responses (Prototype)
  const aiResponses = {
    default:
      "I am a rule-based AI First-Aid Assistant. Please describe the patient’s condition.",

    bleeding:
      "Apply firm pressure to the wound using a clean cloth. Do not remove deeply stuck objects.",

    unconscious:
      "Check if the patient is breathing. If not, begin chest compressions and seek medical help immediately.",

    fracture:
      "Keep the injured area still. Use a splint or cloth to support it and avoid movement.",

    burn:
      "Cool the burn under running water for 20 minutes. Do not apply ice or home remedies.",

    chestPain:
      "Help the patient sit and rest. Loosen tight clothing and seek emergency medical help immediately.",

    breathing:
      "Help the patient sit upright. If breathing is difficult, seek emergency assistance immediately.",

    seizure:
      "Move objects away from the patient. Do not restrain them or place anything in their mouth.",

    snakeBite:
      "Keep the patient calm and still. Do not cut or suck the wound. Seek emergency medical care.",

    fever:
      "Give fluids and keep the patient cool. If fever is very high, seek medical attention.",

    poisoning:
      "Do not induce vomiting. Identify the substance if possible and seek emergency help.",

    heartAttack:
      "Call emergency services immediately. Keep the patient calm and monitor breathing.",

    accident:
      "Do not move the patient unless necessary. Call emergency services and keep them stable.",

    // 💧 Water & heat related
    dehydration:
      "Give clean drinking water slowly. Avoid sugary drinks. Seek medical help if condition worsens.",

    drowning:
      "Move the person out of water if safe. Check breathing and start CPR if needed. Call emergency services.",

    heatStroke:
      "Move the person to a cool place, loosen clothing, and give water if conscious.",

    // 🩹 General conditions
    cut:
      "Clean the wound with water, apply pressure, and cover with a clean bandage.",

    faint:
      "Help the person lie down and raise their legs. Loosen tight clothing and monitor breathing.",

    electricShock:
      "Turn off the power source if safe. Do not touch the person directly. Seek emergency help.",

    allergy:
      "Remove the allergen if known. Seek medical help if swelling or breathing difficulty occurs.",

    vomiting:
      "Give small sips of water. Avoid solid food temporarily and monitor the condition.",
  
     water:
      "If the patient is conscious, water may be given slowly,if the  patient is unconscious water should not be given"
    };

  // ✅ Handle chat
  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    let botReply = aiResponses.default;
    const text = input.toLowerCase();

    if (text.includes("bleed") || text.includes("blood"))
      botReply = aiResponses.bleeding;
    else if (text.includes("unconscious"))
      botReply = aiResponses.unconscious;
    else if (text.includes("fracture") || text.includes("broken"))
      botReply = aiResponses.fracture;
    else if (text.includes("burn"))
      botReply = aiResponses.burn;
    else if (text.includes("chest") || text.includes("heart"))
      botReply = aiResponses.chestPain;
    else if (text.includes("breath"))
      botReply = aiResponses.breathing;
    else if (text.includes("seizure") || text.includes("fits"))
      botReply = aiResponses.seizure;
    else if (text.includes("snake"))
      botReply = aiResponses.snakeBite;
    else if (text.includes("fever") || text.includes("temperature"))
      botReply = aiResponses.fever;
    else if (text.includes("poison"))
      botReply = aiResponses.poisoning;
    else if (text.includes("attack"))
      botReply = aiResponses.heartAttack;
    else if (text.includes("accident") || text.includes("injury"))
      botReply = aiResponses.accident;
    else if (text.includes("dehydration") || text.includes("thirst"))
      botReply = aiResponses.dehydration;
    else if (text.includes("drown"))
      botReply = aiResponses.drowning;
    else if (text.includes("heat"))
      botReply = aiResponses.heatStroke;
    else if (text.includes("cut"))
      botReply = aiResponses.cut;
    else if (text.includes("faint"))
      botReply = aiResponses.faint;
    else if (text.includes("shock"))
      botReply = aiResponses.electricShock;
    else if (text.includes("allergy"))
      botReply = aiResponses.allergy;
    else if (text.includes("vomit"))
      botReply = aiResponses.vomiting;
    else if (text.includes("water"))
      botReply =aiResponses.water;

    const botMsg = { sender: "bot", text: botReply };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  // ✅ Generate report
  const endConversation = () => {
    if (messages.length === 0) {
      alert("No conversation available to generate report!");
      return;
    }

    const symptoms = messages
      .filter((m) => m.sender === "user")
      .map((m) => m.text)
      .join(", ");

    const aiAdvice = messages
      .filter((m) => m.sender === "bot")
      .map((m) => m.text)
      .join("\n");

    const reportText = `🩺 Emergency First-Aid Report (AI Prototype)
------------------------------------------------
🗓️ Date: ${new Date().toLocaleString()}

🧍 Reported Symptoms:
${symptoms}

🤖 First-Aid Guidance:
${aiAdvice}


`;

    setReport(reportText);

    if (user?.email) {
      const key = `reports_${user.email}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({ date: new Date().toLocaleString(), content: reportText });
      localStorage.setItem(key, JSON.stringify(existing));
    }
  };

  // ✅ Download report
  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Emergency_First_Aid_Report.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-glow ring-1 ring-white">
      <h2 className="text-lg font-semibold mb-2 text-emerald-700">
        🤖 AI First-Aid Assistant (Prototype)
      </h2>

      {/* Chat */}
      <div className="h-64 overflow-y-auto bg-white border rounded-xl p-3 mb-3">
        {messages.length === 0 ? (
          <p className="text-slate-400 text-sm">
            AI: Describe the patient’s condition.
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`my-1 p-2 rounded-xl max-w-[80%] ${
                m.sender === "user"
                  ? "bg-emerald-100 ml-auto text-right"
                  : "bg-slate-100"
              }`}
            >
              <span className="text-sm">{m.text}</span>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe symptoms..."
          className="flex-1 border rounded-xl px-3 py-2 text-sm"
        />
        <button
          onClick={sendMessage}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl"
        >
          Send
        </button>
      </div>

      <button
        onClick={endConversation}
        className="mt-4 w-full bg-rose-500 text-white py-2 rounded-xl"
      >
        📋 End Conversation & Generate Report
      </button>

      {report && (
        <div className="mt-4 bg-slate-50 p-4 rounded-xl border">
          <pre className="text-xs whitespace-pre-wrap mb-3">{report}</pre>
          <button
            onClick={downloadReport}
            className="w-full bg-indigo-500 text-white py-2 rounded-xl"
          >
            ⬇️ Download Report
          </button>
        </div>
      )}
    </div>
  );
}
