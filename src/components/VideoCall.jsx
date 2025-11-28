"use client";

import React, { useRef, useEffect } from "react";
import { useWebRTC } from "../hooks/useWebRTC";
import { Video, VideoOff, Mic, MicOff, Phone } from "lucide-react";

export default function VideoCall({ roomId, userId, role, userName, onLeave }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    isConnected,
    error,
    toggleVideo,
    toggleAudio,
    leaveRoom,
  } = useWebRTC(roomId, userId, role, userName);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleLeave = () => {
    leaveRoom();
    onLeave();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={onLeave}
            className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center text-white">
                <Video className="w-20 h-20 mx-auto mb-4 opacity-50" />
                <p className="text-xl">
                  Waiting for {role === "doctor" ? "patient" : "doctor"}...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-3 py-1 rounded text-white text-sm">
            You
          </div>
        </div>

        <div className="absolute top-4 left-4">
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isConnected
                ? "bg-green-500 text-white"
                : "bg-yellow-500 text-gray-900"
            }`}
          >
            {isConnected ? "● Connected" : "● Connecting..."}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center space-x-4">
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isVideoEnabled
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isAudioEnabled
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={handleLeave}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
          >
            <Phone className="w-6 h-6 text-white transform rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
}
