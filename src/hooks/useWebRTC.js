"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = (roomId, userId, role, userName) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (roomId && userId) {
      initializeConnection();
    }

    return () => {
      cleanup();
    };
  }, [roomId, userId]);

  const initializeConnection = async () => {
    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        console.log(navigator, "mediaDevices");
        throw new Error("Media devices not supported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
      socketRef.current = io(socketUrl);

      setupSocketListeners();

      socketRef.current.emit("join-room", {
        roomId,
        userId,
        role,
        name: userName,
      });
    } catch (err) {
      console.error("Error accessing media:", err);
      setError("Failed to access camera/microphone");
    }
  };

  const setupSocketListeners = () => {
    const socket = socketRef.current;

    socket.on("user-joined", async ({ socketId }) => {
      await createPeerConnection(socketId);
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("offer", { to: socketId, offer });
    });

    socket.on("offer", async ({ from, offer }) => {
      await createPeerConnection(from);
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
    });

    socket.on("answer", async ({ answer }) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    socket.on("user-left", () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      setRemoteStream(null);
      setIsConnected(false);
    });
  };

  const createPeerConnection = async (remoteSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    localStreamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
      setIsConnected(true);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setIsConnected(true);
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        setIsConnected(false);
      }
    };

    return pc;
  };

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const leaveRoom = useCallback(() => {
    cleanup();
  }, []);

  return {
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    isConnected,
    error,
    toggleVideo,
    toggleAudio,
    leaveRoom,
  };
};
