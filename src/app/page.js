"use client";

import React, { useState } from "react";
import { Calendar, Video, Users } from "lucide-react";
import VideoCall from "../components/VideoCall";

export default function Home() {
  const [view, setView] = useState("home");
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [userId] = useState(
    () => Math.random().toString(36).substr(2, 9) // runs only once
  );

  const startCall = (userRole) => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
    setRole(userRole);
    setView("call");
  };

  if (view === "call") {
    return (
      <VideoCall
        roomId={roomId}
        userId={userId}
        role={role}
        userName={userName || "User"}
        onLeave={() => setView("home")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">TeleConsult</h1>
          <p className="text-xl text-gray-600">
            Professional Healthcare Video Consultations
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Enter Your Name
          </h2>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => startCall("doctor")}
            disabled={!userName}
            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
              <Calendar className="w-8 h-8 text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Join as Doctor
            </h3>
            <p className="text-gray-600">Start a consultation session</p>
          </button>

          <button
            onClick={() => startCall("patient")}
            disabled={!userName}
            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
              <Users className="w-8 h-8 text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Join as Patient
            </h3>
            <p className="text-gray-600">Join your consultation</p>
          </button>
        </div>
      </div>
    </div>
  );
}
