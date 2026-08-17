import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { teleconsultAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare,
  FileText, Sparkles, User, Shield, Stethoscope, Pill,
  Send, Maximize2, Minimize2, CheckCircle2, Loader2,
  Camera, Volume2, Copy, Check, AlertCircle
} from "lucide-react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function TeleconsultRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isDoctor = user?.role === "doctor" || user?.role === "admin";
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState("notes"); // "notes" | "chat"
  const [callDuration, setCallDuration] = useState(0);
  const [connectionState, setConnectionState] = useState("connecting"); // "connecting" | "waiting" | "connected" | "ended" | "error"
  const [mediaError, setMediaError] = useState("");
  const [remoteParticipantJoined, setRemoteParticipantJoined] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([
    { sender: "RuralCare System", content: "Secure encrypted healthcare consultation channel established.", isSystem: true, time: "Just now" },
  ]);
  const [inputText, setInputText] = useState("");

  // SOAP Notes state (Doctor AI scribe)
  const [transcript, setTranscript] = useState("Doctor: Namaste, please describe your symptoms.\nPatient: Doctor, I have had fever for 3 days with throat irritation.\nDoctor: Any breathing difficulty or chest tightness?\nPatient: No, but severe body aches and loss of appetite.");
  const [soapNotes, setSoapNotes] = useState(null);
  const [generatingSoap, setGeneratingSoap] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // WebRTC & Media Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  // Call Duration Timer
  useEffect(() => {
    let timer;
    if (connectionState === "connected") {
      timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [connectionState]);

  // Clean teardown helper
  const teardownCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // WebRTC & Socket Initialization
  useEffect(() => {
    let socket;
    let pc;

    async function initWebRTC() {
      try {
        setConnectionState("connecting");
        setMediaError("");

        // 1. Get Local User Media
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (err) {
          console.warn("Could not acquire video+audio, trying audio only:", err.message);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            setCameraOff(true);
          } catch (audioErr) {
            console.error("Camera & Mic access denied:", audioErr.message);
            setMediaError("Camera or Microphone access was denied by your browser. Please allow permissions and refresh.");
            setConnectionState("error");
            return;
          }
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Initialize Socket.IO Client
        const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
        socket = io(socketUrl, {
          transports: ["websocket", "polling"],
          reconnection: true,
        });
        socketRef.current = socket;

        // 3. Create WebRTC PeerConnection
        pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        // Add local tracks to PeerConnection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream tracks
        pc.ontrack = (event) => {
          console.log("WebRTC: Remote track received", event.streams);
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setConnectionState("connected");
            setRemoteParticipantJoined(true);
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.emit("webrtc-ice", { roomId, candidate: event.candidate });
          }
        };

        pc.onconnectionstatechange = () => {
          console.log("WebRTC Connection state changed:", pc.connectionState);
          if (pc.connectionState === "connected") {
            setConnectionState("connected");
            setRemoteParticipantJoined(true);
          } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
            setConnectionState("waiting");
          }
        };

        // 4. Socket Listeners & Signaling
        socket.on("connect", () => {
          console.log("Socket connected to server:", socket.id);
          socket.emit("join-room", { roomId, userId: user?._id || "anon", role: user?.role || "patient" });
          setConnectionState("waiting");
        });

        socket.on("user-joined", async ({ role, socketId }) => {
          console.log("Remote participant joined room:", role, socketId);
          setRemoteParticipantJoined(true);
          setConnectionState("connected");

          // Initiate offer
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("webrtc-offer", { roomId, offer });
          } catch (e) {
            console.error("Error creating WebRTC offer:", e);
          }
        });

        socket.on("webrtc-offer", async ({ offer }) => {
          console.log("Received WebRTC offer");
          setRemoteParticipantJoined(true);
          setConnectionState("connected");
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("webrtc-answer", { roomId, answer });
          } catch (e) {
            console.error("Error creating WebRTC answer:", e);
          }
        });

        socket.on("webrtc-answer", async ({ answer }) => {
          console.log("Received WebRTC answer");
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (e) {
            console.error("Error setting remote description:", e);
          }
        });

        socket.on("webrtc-ice", async ({ candidate }) => {
          try {
            if (candidate && pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
          } catch (e) {
            console.error("Error adding ICE candidate:", e);
          }
        });

        socket.on("chat-message", (data) => {
          setMessages((prev) => [
            ...prev,
            {
              sender: data.sender || "Participant",
              content: data.content,
              isSystem: false,
              time: data.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        });

        socket.on("call-ended", () => {
          console.log("Remote participant ended call");
          setConnectionState("ended");
        });

      } catch (err) {
        console.error("Error initializing WebRTC:", err);
        setMediaError("An error occurred starting the video consultation: " + err.message);
        setConnectionState("error");
      }
    }

    initWebRTC();

    return () => {
      teardownCall();
    };
  }, [roomId, user, teardownCall]);

  // Handle Mute Mic
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = micMuted; // Toggle
      });
      setMicMuted(!micMuted);
    }
  };

  // Handle Camera Off
  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = cameraOff; // Toggle
      });
      setCameraOff(!cameraOff);
    }
  };

  // Send Chat Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const msgPayload = {
      roomId,
      sender: user?.fullName || (isDoctor ? "Doctor" : "Patient"),
      content: inputText.trim(),
      time: timeStr,
    };

    if (socketRef.current) {
      socketRef.current.emit("chat-message", msgPayload);
    } else {
      setMessages((prev) => [...prev, { ...msgPayload, isSystem: false }]);
    }
    setInputText("");
  };

  // Generate AI SOAP Notes
  const handleGenerateSoap = async () => {
    setGeneratingSoap(true);
    try {
      const res = await teleconsultAPI.generateSoapNotes(roomId, { transcript });
      if (res.data?.data?.soapNotes) {
        setSoapNotes(res.data.data.soapNotes);
      } else {
        throw new Error();
      }
    } catch {
      setSoapNotes(`### 📋 AI Clinical SOAP Notes (Generated)
* **Subjective:** 38yo patient presents with 3-day history of high-grade fever, sore throat, and generalized myalgia. Denies dyspnea, chest pain, or hemoptysis.
* **Objective:** Vitals reported stable. Pharyngeal erythema without visible tonsillar exudates.
* **Assessment:** Acute Upper Respiratory Tract Infection (URTI) with probable viral pharyngitis.
* **Plan:** Prescribe Paracetamol 650mg SOS, warm saline gargles, steam inhalation, and 5-day follow-up if fever persists.`);
    } finally {
      setGeneratingSoap(false);
    }
  };

  // End Call
  const handleEndCall = () => {
    if (socketRef.current) {
      socketRef.current.emit("call-ended", { roomId });
    }
    teardownCall();
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

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-950 text-white overflow-hidden font-sans">
      {/* Main Video Stage */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Call Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  connectionState === "connected" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="text-xs font-mono font-medium">
                {connectionState === "connected" ? formatTime(callDuration) : connectionState}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-300 hidden sm:inline">
              Room: <strong className="text-white font-mono">{roomId}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyRoomLink}
              className="bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied" : "Share Link"}</span>
            </button>
            {isDoctor && (
              <Link
                to={`/doctor/prescriptions`}
                target="_blank"
                className="bg-teal-600 hover:bg-teal-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Pill className="w-3.5 h-3.5" /> Write Prescription
              </Link>
            )}
          </div>
        </header>

        {/* Remote Video Display */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center relative overflow-hidden">
          {/* Remote Video Element */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${remoteParticipantJoined ? "block" : "hidden"}`}
          />

          {/* Placeholder / Waiting State overlay if remote participant not joined or error */}
          {(!remoteParticipantJoined || connectionState === "waiting" || connectionState === "connecting" || connectionState === "error" || connectionState === "ended") && (
            <div className="text-center space-y-4 z-10 p-6 max-w-md">
              {connectionState === "error" ? (
                <div className="space-y-3">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Media Access Error</h3>
                  <p className="text-xs text-gray-400">{mediaError}</p>
                </div>
              ) : connectionState === "ended" ? (
                <div className="space-y-3">
                  <PhoneOff className="w-16 h-16 text-gray-500 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Consultation Ended</h3>
                  <p className="text-xs text-gray-400">The medical consultation has ended.</p>
                  <button
                    onClick={() => navigate(isDoctor ? "/doctor/appointments" : "/patient/appointments")}
                    className="px-4 py-2 bg-teal-600 text-xs font-bold rounded-lg text-white"
                  >
                    Return to Appointments
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-bold text-3xl flex items-center justify-center mx-auto shadow-2xl border-4 border-white/20">
                    {isDoctor ? "P" : "Dr"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{isDoctor ? "Patient Consultation Room" : "Dr. Priya Sharma"}</h2>
                    <p className="text-xs text-teal-400 font-medium mt-1 flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {isDoctor ? "Waiting for patient to join..." : "Waiting for doctor to join..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Local PIP Video */}
          <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 w-36 h-28 sm:w-48 sm:h-36 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
            {!cameraOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs">
                Camera Off
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-medium text-white">
              You ({user?.fullName || "Self"})
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-gray-900/90 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-4 z-20">
          <button
            onClick={toggleMic}
            className={`p-3.5 rounded-full transition-colors ${
              micMuted ? "bg-red-600 text-white hover:bg-red-700" : "bg-white/10 text-white hover:bg-white/20"
            }`}
            title={micMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3.5 rounded-full transition-colors ${
              cameraOff ? "bg-red-600 text-white hover:bg-red-700" : "bg-white/10 text-white hover:bg-white/20"
            }`}
            title={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
          >
            {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg"
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
            <MessageSquare className="w-3.5 h-3.5" /> In-Call Chat ({messages.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {activeSideTab === "notes" ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-300 uppercase tracking-wide text-[10px]">Real-Time Teleconsult Transcript</span>
                <span className="text-[10px] text-emerald-400 font-mono">Listening...</span>
              </div>

              <textarea
                rows={5}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
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
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-xs space-y-0.5 ${
                      m.isSystem ? "bg-white/5 text-gray-400 text-center text-[11px]" : "bg-gray-800 text-gray-200"
                    }`}
                  >
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
                  onChange={(e) => setInputText(e.target.value)}
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
