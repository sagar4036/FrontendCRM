import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaPaperPlane, FaUser, FaStopCircle } from "react-icons/fa";
import { MdSmartToy } from "react-icons/md";
import { BsRecordCircle } from "react-icons/bs";
import { jwtDecode } from "jwt-decode";


const Chat = ({ isCallActive , token}) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [executiveId, setExecutiveId] = useState(null);
  const [executiveName, setExecutiveName] = useState("");

  const recordStartTimeRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  
  const [authToken, setAuthToken] = useState(token);

  useEffect(() => {
    // If token is passed as prop, use it
    if (token) {
      setAuthToken(token);
    } else {
      // Fallback: try to get from localStorage
      const localToken = localStorage.getItem("token");
      if (localToken) {
        setAuthToken(localToken);
      } else {
        // Fallback: try to get from URL params (for backward compatibility)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
          setAuthToken(urlToken);
        }
      }
    }
  }, [token]); 
useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://cdn.botpress.cloud/webchat/v3.0/webchat.js";
  script.async = true;
  script.onload = () => {
    window.botpressWebChat.init({
      configUrl: "https://files.bpcontent.cloud/2025/06/28/09/20250628095833-D0OMUHIV.json"
    });
  };
  document.body.appendChild(script);
}, []);



  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setExecutiveId(decoded.id);
        setExecutiveName(decoded.name);
        console.log("✅ Executive decoded:", decoded.id, decoded.name);
      } catch (err) {
        console.error("❌ Invalid token:", err);
      }
    }
  }, [token]);

  const handleSend = async (input) => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setUserInput("");
    setIsTyping(true);
  
    try {
      console.log("📤 Sending:", input);
      const response = await fetch("https://crm-backend-production-c208.up.railway.app/api/crew/crew/executive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "x-company-id": "0aa80c0b-0999-4d79-8980-e945b4ea700d",
        },
        body: JSON.stringify({ question: input }), // ✅ key change here
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch response");
  
      setMessages((prev) => [...prev, { text: data.answer, isUser: false }]); // backend sends { answer: "..." }
    } catch (error) {
      console.error("❌ API Error:", error);
      setMessages((prev) => [...prev, { text: "Error: Unable to get response.", isUser: false }]);
    } finally {
      setIsTyping(false);
    }
  };
  

  const toggleRecording = async () => {
  console.log("🎬 toggleRecording clicked");
  console.log("🎙️ isRecording state:", isRecording);

  if (!isRecording) {
    try {
      console.log("🎤 Requesting mic access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Mic permission granted");

      mediaRecorderRef.current = new MediaRecorder(stream);
      recordChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordChunksRef.current.push(e.data);
          console.log("📦 ondataavailable fired:", e.data.size);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log("🛑 onstop triggered");

        const blob = new Blob(recordChunksRef.current, { type: "audio/webm" });
        const fileName = `call_recording_${Date.now()}.webm`;
        const fakePath = `C:/Users/${executiveName}/Downloads/${fileName}`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);

        const storedClient = JSON.parse(localStorage.getItem("activeClient") || "{}");
        const clientName = storedClient.name || "Unknown";
        const clientPhone = storedClient.phone || "0000000000";

        const callStartTime = recordStartTimeRef.current?.toISOString() || new Date().toISOString();
        const callEndTime = new Date().toISOString();
        const duration = Math.floor((new Date(callEndTime) - new Date(callStartTime)) / 1000);

        console.log("📋 Call Metadata Preview:", {
          executiveId,
          executiveName,
          duration,
          clientName,
          clientPhone,
          callStartTime,
          callEndTime,
          fakePath,
        });

        if (!executiveId || !clientName || !clientPhone) {
          alert("❌ Missing metadata. Please select a client and try again.");
          return;
        }

        const formData = new FormData();
        formData.append("executiveId", executiveId);
        formData.append("duration", duration);
        formData.append("clientName", clientName);
        formData.append("clientPhone", clientPhone);
        formData.append("callStartTime", callStartTime);
        formData.append("callEndTime", callEndTime);
        formData.append("recordingPath", fakePath);

        try {
          const res = await fetch("https://crm-backend-production-c208.up.railway.app/api/calldetails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "x-company-id": "0aa80c0b-0999-4d79-8980-e945b4ea700d",
            },
            body: formData,
          });

          const data = await res.json();
          console.log("✅ Uploaded to backend:", data);
        } catch (err) {
          console.error("❌ Upload failed:", err);
          if (err instanceof TypeError) {
            console.warn("📛 Probably CORS or silent backend rejection");
          }
        }

        recordChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      console.log("▶️ mediaRecorder.start() successfully triggered");

      recordStartTimeRef.current = new Date(); // ✅ Capture accurate start time
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime((t) => t + 1), 1000);
    } catch (err) {
      console.error("❌ Mic access error:", err);
    }
  } else {
    console.log("🛑 Stopping recording...");
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordTime(0);
  }
};

  const handleMicClick = () => {
    if (isListening) stopSpeechRecognition();
    else startSpeechRecognition();
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported.");
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onresult = (event) => {
      let transcript = event.results[event.results.length - 1][0].transcript.trim();
      setUserInput(transcript);
      if (event.results[event.results.length - 1].isFinal) handleSend(transcript);
    };
    recognitionRef.current.onerror = (e) => console.error("Speech error:", e.error);
    recognitionRef.current.onend = () => {
      if (!isCallActive && isListening) recognitionRef.current.start();
    };
    recognitionRef.current.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.onend = null;
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <MdSmartToy size={30} className="chat-icon" />
          <h2 style={{color: "white"}}>AI ChatBot</h2>
        </div>

        <div className="chat-messages" ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <div className="message-row" key={index}>
              <div className="bot-side">
                {!msg.isUser ? (
                  <div className="message bot-message">
                    <MdSmartToy className="bot-icon" />
                    <div className="message-content">{msg.text}</div>
                  </div>
                ) : (
                  <div className="empty-placeholder" />
                )}
              </div>
              <div className="user-side">
                {msg.isUser ? (
                  <div className="message user-message">
                    <FaUser className="user-icon" />
                    <div className="message-content">{msg.text}</div>
                  </div>
                ) : (
                  <div className="empty-placeholder" />
                )}
              </div>
            </div>
          ))}
          {isTyping && <div className="typing-indicator">...</div>}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(userInput);
              }
            }}
            placeholder="Type your message..."
          />
          <button onClick={() => handleSend(userInput)} className="send-button">
            <FaPaperPlane />
          </button>
          <button onClick={handleMicClick} className={`mic-button ${isListening ? "active" : ""}`}>
            <FaMicrophone />
          </button>
          <button onClick={toggleRecording} className={`record-button ${isRecording ? "active" : ""}`}>
            {isRecording ? <FaStopCircle /> : <BsRecordCircle />}
          </button>
        </div>
 {/* Your existing chat UI */}
      {!authToken && (
        <div className="auth-warning">
          <p>⚠️ Authentication required. Please login to use all features.</p>
        </div>
      )}

        {isRecording && (
          <div style={{ textAlign: "center", color: "red", marginTop: "5px" }}>
            Recording Time: {recordTime}s
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;