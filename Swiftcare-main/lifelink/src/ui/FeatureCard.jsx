import React from "react";

export default function FeatureCard({ title, desc, icon, pill, gradient }) {
  return (
    <div
      className={`p-5 rounded-3xl text-white bg-gradient-to-br ${gradient} shadow-md hover:shadow-lg transition`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="p-2 bg-white/20 rounded-lg">{icon}</span>
        <span className="text-sm bg-white/30 px-2 py-1 rounded-full font-medium">
          {pill}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm opacity-90">{desc}</p>
    </div>
  );
}
