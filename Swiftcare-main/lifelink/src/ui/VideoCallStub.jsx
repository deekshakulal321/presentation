import React, { useState } from 'react'

export default function VideoCallStub() {
  const [connected, setConnected] = useState(false)

  return (
    <div className="rounded-3xl p-5 bg-white/80 backdrop-blur ring-1 ring-white shadow-glow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Doctor Video Consultation</h3>
        <button
          onClick={() => setConnected(!connected)}
          className={`px-4 py-2 rounded-xl text-white font-medium ${connected ? 'bg-rose-500' : 'bg-indigo-500'} transition`}
        >
          {connected ? 'End Call' : 'Start Call'}
        </button>
      </div>
      <div className="h-56 rounded-2xl overflow-hidden bg-black/80 grid place-items-center text-white relative">
        <span className="text-sm opacity-80">{connected ? 'Connected to Dr. A. Kumar (Emergency)' : 'Not connected'}</span>
        {connected && (
          <div className="absolute inset-2 border-2 border-white/20 rounded-xl pointer-events-none"></div>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Demo view. Replace with WebRTC/Twilio/Agora video component.
      </p>
    </div>
  )
}