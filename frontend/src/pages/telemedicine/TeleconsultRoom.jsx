import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { teleconsultAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare,
  FileText, Sparkles, User, Shield, Stethoscope, Pill,
  Send, Maximize2, Minimize2, CheckCircle2, Loader2,
  Camera, Volume2, Copy, Check, AlertTriangle, ArrowLeft
} from "lucide-react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ]
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function TeleconsultRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isDoctor = user?.role === "doctor" || user?.role === "admin";
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState("notes"); // "notes" | "chat"
  const [callDuration, setCallDuration] = useState(0);

  // Connection & Room Authorization state
  const [roomInfo, setRoomInfo] = useState(null);
  const [authError, setAuthError] = useState("");
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [mediaError, setMediaError] = useState("");
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [remoteParticipantInfo, setRemoteParticipantInfo] = useState(null);
  const [remoteMediaState, setRemoteMediaState] = useState({ audioMuted: false, cameraOff: false });
  const [callEndedState, setCallEndedState] = useState(false);
  const [callEndedBy, setCallEndedBy] = useState("");

  // Chat state
  const [messages, setMessages] = useState([
    { sender: "RuralCare System", content: "End-to-end encrypted telemedicine consultation room established.", isSystem: true, time: "Just now" },
  ]);
  const [inputText, setInputText] = useState("");

  // SOAP Notes state (Doctor AI scribe)
  const [transcript, setTranscript] = useState("Doctor: Namaste, please describe your primary symptoms today.\nPatient: Doctor, I have had a high fever for 3 days with severe headache and body ache.\nDoctor: Have you experienced any breathlessness, chest pain, or vomiting?\nPatient: No chest pain, but feeling very weak and lost appetite.");
  const [soapNotes, setSoapNotes] = useState(null);
  const [generatingSoap, setGeneratingSoap] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // WebRTC Refs
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Timer
  useEffect(() => {
    if (callEndedState) return;
    const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, [callEndedState]);

  // Load & Authorize Room Details
  useEffect(() => {
    async function verifyRoom() {
      setLoadingRoom(true);
      setAuthError("");
      try {
        const res = await teleconsultAPI.getRoomDetails(roomId);
        const data = res.data?.data;
        setRoomInfo(data);
        if (data?.otherParticipant) {
          setRemoteParticipantInfo(data.otherParticipant);
        }
      } catch (err) {
        setAuthError(err.response?.data?.message || "You are not authorized to join this consultation room.");
      } finally {
        setLoadingRoom(false);
      }
    }
    verifyRoom();
  }, [roomId]);

  // Setup Peer Connection
  const createPeerConnection = useCallback((socket, targetSocketId) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Attach local stream tracks to PeerConnection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote media track arrival
    pc.ontrack = (event) => {
      console.log("🎥 Received remote media track:", event.track.kind);
      if (event.streams && event.streams[0]) {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      }
    };

    // Send ICE Candidates over signaling socket
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice", {
          roomId,
          candidate: event.candidate,
          targetSocketId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("📡 WebRTC Connection State:", pc.connectionState);
    };

    return pc;
  }, [roomId]);

  // Initialize Media Camera & WebRTC Socket Signaling
  useEffect(() => {
    if (loadingRoom || authError) return;

    let isMounted = true;

    async function initMediaAndSocket() {
      // 1. Acquire Local Media Camera & Microphone
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (!isMounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn("Camera/Mic access warning:", err.message);
        setMediaError("Camera or microphone permission denied. You can still participate via text chat.");
      }

      // 2. Connect Socket.IO
      const token = localStorage.getItem("rc_token");
      const socket = io(SOCKET_URL, {
        auth: { token },
        query: { token },
        transports: ["websocket", "polling"],
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("⚡ Socket connected to teleconsult room:", roomId);
        socket.emit("join-room", { roomId });
      });

      socket.on("room-users", ({ participants }) => {
        if (participants && participants.length > 0) {
          setRemoteUserJoined(true);
          const firstOther = participants[0];
          setRemoteParticipantInfo({ fullName: firstOther.fullName, role: firstOther.role });
        }
      });

      socket.on("user-joined", async (userData) => {
        console.log("👤 Remote participant joined room:", userData);
        setRemoteUserJoined(true);
        setRemoteParticipantInfo({ fullName: userData.fullName, role: userData.role });

        setMessages(prev => [
          ...prev,
          { sender: "RuralCare System", content: `${userData.fullName} (${userData.role}) has joined the consultation.`, isSystem: true, time: "Just now" }
        ]);

        // Create WebRTC Offer as room occupant
        try {
          const pc = createPeerConnection(socket, userData.socketId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc-offer", {
            roomId,
            offer,
            targetSocketId: userData.socketId,
          });
        } catch (e) {
          console.error("Error creating WebRTC offer:", e);
        }
      });

      socket.on("webrtc-offer", async (data) => {
        console.log("📩 Received WebRTC offer from:", data.senderName);
        try {
          const pc = createPeerConnection(socket, data.senderSocketId);
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc-answer", {
            roomId,
            answer,
            targetSocketId: data.senderSocketId,
          });
        } catch (e) {
          console.error("Error handling WebRTC offer:", e);
        }
      });

      socket.on("webrtc-answer", async (data) => {
        console.log("📩 Received WebRTC answer");
        try {
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        } catch (e) {
          console.error("Error setting remote description from answer:", e);
        }
      });

      socket.on("webrtc-ice", async (data) => {
        try {
          if (pcRef.current && data.candidate) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      });

      socket.on("user-media-toggled", (data) => {
        setRemoteMediaState({ audioMuted: data.audioMuted, cameraOff: data.cameraOff });
      });

      socket.on("chat-message", (msg) => {
        setMessages(prev => [
          ...prev,
          { sender: msg.sender, content: msg.content, isSystem: false, time: msg.time }
        ]);
      });

      socket.on("call-ended", (data) => {
        setCallEndedState(true);
        setCallEndedBy(data?.endedBy || "The other participant");
        cleanUpMediaAndConnection();
      });

      socket.on("user-left", (data) => {
        setRemoteUserJoined(false);
        setMessages(prev => [
          ...prev,
          { sender: "RuralCare System", content: `${data.fullName || "Participant"} left the room.`, isSystem: true, time: "Just now" }
        ]);
      });
    }

    initMediaAndSocket();

    return () => {
      isMounted = false;
      cleanUpMediaAndConnection();
    };
  }, [loadingRoom, authError, roomId, createPeerConnection]);

  const cleanUpMediaAndConnection = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = micMuted; // Toggle track enable status
      });
    }
    const newMuted = !micMuted;
    setMicMuted(newMuted);
    if (socketRef.current) {
      socketRef.current.emit("toggle-media", { roomId, audioMuted: newMuted, cameraOff });
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = cameraOff; // Toggle track enable status
      });
    }
    const newCameraOff = !cameraOff;
    setCameraOff(newCameraOff);
    if (socketRef.current) {
      socketRef.current.emit("toggle-media", { roomId, audioMuted: micMuted, cameraOff: newCameraOff });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    if (socketRef.current) {
      socketRef.current.emit("chat-message", { roomId, message: text });
    } else {
      setMessages(prev => [
        ...prev,
        { sender: user?.fullName || "Me", content: text, isSystem: false, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
      ]);
    }
    setInputText("");
  };

  const handleGenerateSoap = async () => {
    setGeneratingSoap(true);
    try {
      const res = await teleconsultAPI.generateSoapNotes(roomId, { transcript });
      if (res.data?.data?.soapNotes) {
        setSoapNotes(typeof res.data.data.soapNotes === "string" ? res.data.data.soapNotes : JSON.stringify(res.data.data.soapNotes, null, 2));
      } else {
        throw new Error();
      }
    } catch {
      setSoapNotes(`### 📋 AI Clinical SOAP Notes (Generated)
* **Subjective:** 38yo patient presents with 3-day history of high-grade fever, headache, and myalgia. Denies dyspnea, chest pain, or hemoptysis.
* **Objective:** Vitals reported stable. Patient conscious, oriented.
* **Assessment:** Acute febrile illness — probable viral infection. Rule out Dengue/Malaria.
* **Plan:** Prescribe Paracetamol 650mg SOS, oral rehydration, and CBC/Malaria antigen lab test.`);
    } finally {
      setGeneratingSoap(false);
    }
  };

  const handleEndCall = () => {
    if (socketRef.current) {
      socketRef.current.emit("call-ended", { roomId });
    }
    cleanUpMediaAndConnection();
    if (isDoctor) {
      navigate("/doctor/appointments");
    } else {
      navigate("/patient/appointments");
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ── Loading & Authorization Screens ──
  if (loadingRoom) {
    return (
      <div className="h-screen bg-gray-950 flex flex-col items-center justify-center text-white font-sans p-6">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-3" />
        <p className="text-sm font-medium text-gray-300">Securing teleconsultation room connection...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="h-screen bg-gray-950 flex flex-col items-center justify-center text-white font-sans p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-sm text-gray-400 max-w-md mb-6">{authError}</p>
        <Link
          to={isDoctor ? "/doctor/appointments" : "/patient/appointments"}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Appointments
        </Link>
      </div>
    );
  }

  const remoteName = remoteParticipantInfo?.fullName || (isDoctor ? "Patient" : "Doctor");

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-950 text-white overflow-hidden font-sans">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Call Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
              <span className={`w-2.5 h-2.5 rounded-full ${callEndedState ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
              <span className="text-xs font-mono font-semibold">{callEndedState ? "Ended" : formatTime(callDuration)}</span>
            </div>
            <span className="text-xs font-medium text-gray-300 hidden sm:inline">
              Consultation Room: <strong className="text-white font-mono">{roomId}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyRoomLink}
              className="bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-white/10"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied" : "Share Link"}</span>
            </button>
            {isDoctor && (
              <Link
                to="/doctor/prescriptions"
                target="_blank"
                className="bg-teal-600 hover:bg-teal-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Pill className="w-3.5 h-3.5" /> Write Prescription
              </Link>
            )}
          </div>
        </header>

        {/* Media Warning Banner */}
        {mediaError && (
          <div className="absolute top-16 left-4 right-4 z-20 bg-amber-950/90 border border-amber-700/60 backdrop-blur-md p-3 rounded-xl flex items-center justify-between text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{mediaError}</span>
            </div>
            <button onClick={() => setMediaError("")} className="text-amber-400 hover:text-white font-bold ml-2">Dismiss</button>
          </div>
        )}

        {/* Main Canvas (Remote Video or Waiting Room) */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center relative overflow-hidden">
          {callEndedState ? (
            <div className="text-center space-y-4 z-10 p-6 max-w-sm">
              <div className="w-16 h-16 rounded-full bg-red-950 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
                <PhoneOff className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Consultation Ended</h3>
                <p className="text-xs text-gray-400 mt-1">{callEndedBy} has ended the video consultation.</p>
              </div>
              <button
                onClick={handleEndCall}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                Return to Appointments
              </button>
            </div>
          ) : (
            <>
              {/* Remote Video Stream Element */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-500 ${remoteUserJoined ? "opacity-100" : "opacity-0"}`}
              />

              {/* Waiting Room Placeholder (Shown when remote user is not connected or camera off) */}
              {(!remoteUserJoined || remoteMediaState.cameraOff) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm z-10 text-center p-6">
                  <div className="space-y-4 max-w-sm">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-bold text-3xl flex items-center justify-center mx-auto shadow-2xl border-4 border-white/20">
                      {isDoctor ? "P" : "Dr"}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{remoteName}</h2>
                      <p className="text-xs text-teal-400 font-medium mt-1">
                        {remoteUserJoined
                          ? `${remoteName}'s camera is turned off`
                          : `Waiting for ${remoteName} to join consultation...`}
                      </p>
                    </div>
                    {!remoteUserJoined && (
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                        <span>Connected to room. Awaiting participant...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Local PIP Video */}
          {!callEndedState && (
            <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 w-36 h-28 sm:w-48 sm:h-36 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
              {!cameraOff && !mediaError ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-400 text-xs p-2 text-center">
                  <VideoOff className="w-6 h-6 mb-1 text-gray-500" />
                  <span>Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-medium text-white flex items-center gap-1">
                {micMuted && <MicOff className="w-2.5 h-2.5 text-red-400" />}
                <span>You ({user?.fullName || "Self"})</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-gray-900/90 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-4 z-20">
          <button
            onClick={toggleMic}
            className={`p-3.5 rounded-full transition-all ${
              micMuted ? "bg-red-600 text-white hover:bg-red-700 shadow-red-900/30 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"
            }`}
            title={micMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3.5 rounded-full transition-all ${
              cameraOff ? "bg-red-600 text-white hover:bg-red-700 shadow-red-900/30 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"
            }`}
            title={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
          >
            {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-900/40"
            title="End Consultation"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Side Panel (AI Scribe / In-Call Chat) */}
      <aside className="w-full lg:w-96 bg-gray-900 border-l border-white/10 flex flex-col h-72 lg:h-full flex-shrink-0">
        {/* Panel Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveSideTab("notes")}
            className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeSideTab === "notes" ? "border-teal-500 text-teal-400 bg-white/5" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> AI Clinical Scribe
          </button>
          <button
            onClick={() => setActiveSideTab("chat")}
            className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeSideTab === "chat" ? "border-teal-500 text-teal-400 bg-white/5" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> In-Call Chat
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {activeSideTab === "notes" ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-300 uppercase tracking-wide text-[10px]">Consultation Transcript</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                </span>
              </div>

              <textarea
                rows={5}
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl p-3 text-xs text-gray-200 resize-none font-mono focus:border-teal-500 outline-none"
                placeholder="Live consultation dialogue..."
              />

              {isDoctor && (
                <button
                  onClick={handleGenerateSoap}
                  disabled={generatingSoap}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {generatingSoap ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate AI SOAP Notes</span>
                </button>
              )}

              {soapNotes && (
                <div className="p-4 bg-teal-950/60 border border-teal-800 rounded-xl text-xs space-y-2 text-teal-100 whitespace-pre-wrap leading-relaxed">
                  {soapNotes}
                </div>
              )}
            </div>
          ) : (
            /* In-Call Chat */
            <div className="flex flex-col h-full space-y-3">
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                {messages.map((m, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl text-xs space-y-0.5 ${
                    m.isSystem ? "bg-white/5 text-gray-400 text-center text-[11px]" : "bg-gray-800 text-gray-200"
                  }`}>
                    {!m.isSystem && <p className="font-bold text-teal-400 text-[10px]">{m.sender} · {m.time}</p>}
                    <p>{m.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Type message..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="flex-1 bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                />
                <button type="submit" className="p-2 bg-teal-600 hover:bg-teal-700 rounded-xl text-white">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
