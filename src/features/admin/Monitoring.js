import React, { useState, useEffect } from "react";
import { useApi } from "../../context/ApiContext";
import SidebarToggle from "./SidebarToggle";
import StreamPlayer from "../../pages/StreamPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDesktop, faVideo, faVolumeUp, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { useLoading } from "../../context/LoadingContext";
import AdminSpinner from "../spinner/AdminSpinner";
function Monitoring() {
  const [executives, setExecutives] = useState([]);
  const [selectedExec, setSelectedExec] = useState(null);
  const [showScreen, setShowScreen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showAudio, setShowAudio] = useState(false);

  const { fetchExecutivesAPI } = useApi();
  const { showLoader, hideLoader,isLoading,variant } = useLoading();
  useEffect(() => {
    const fetchExecs = async () => {
      try {
        showLoader("Loading executives...", "admin");
        const data = await fetchExecutivesAPI();
        setExecutives(data);
      } catch (error) {
        console.error("Failed to fetch executives", error);
      } finally {
        hideLoader();
      }
    };

    fetchExecs();
  }, [fetchExecutivesAPI, showLoader, hideLoader]);

  const selectedExecutive = executives.find(e => e.username === selectedExec);

  const triggerStream = async (type) => {
    if (!selectedExecutive) return;
    try {
      const res = await fetch("https://monitoring-w28p.onrender.com/trigger-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          executive_id: selectedExecutive.id,
          stream_type: type
        })
      });
      const result = await res.json();
      if (result.status === "triggered") {
        if (type === "screen") setShowScreen(true);
        if (type === "video") setShowVideo(true);
        if (type === "audio") setShowAudio(true);
      }
    } catch (err) {
      console.error("Trigger error:", err);
    }
  };

  const stopStream = (type) => {
    if (type === "screen") setShowScreen(false);
    if (type === "video") setShowVideo(false);
    if (type === "audio") setShowAudio(false);
  };

  return (
    <>
        <SidebarToggle />
            {isLoading && variant === "admin" && (
        <AdminSpinner text="Loading Executives..." />
      )}
      <div>
        <h1 style={{ textAlign: "center", marginTop: "20px" }}>Choose Executives</h1>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <select
            onChange={(e) => {
              setSelectedExec(e.target.value === "all" ? null : e.target.value);
              setShowScreen(false);
              setShowVideo(false);
              setShowAudio(false);
            }}
            style={{ padding: "10px", fontSize: "16px", borderRadius: "8px", minWidth: "200px" }}
          >
            <option value="all">All Executives</option>
            {executives.map((e, i) => (
              <option key={i} value={e.username}>{e.username}</option>
            ))}
          </select>
        </div>

        {!selectedExec && (
          <div className="exec-grid">
            {executives.map((e, i) => (
              <div className="exec-item" key={i}>
                <p className="exec-name">{e.username}</p>
                <div className="exec-box-wrapper">
                  <div className="exec-box">
                    <div className="exe-avatar">
                      {e.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedExec && selectedExecutive && (
          <>
            <div className="stream-section">
              {/* Screen Cast */}
              <div className="exec-box-wrapper">
                <div className="exec-box">
                  {showScreen ? (
                    <>
                      <StreamPlayer executiveId={selectedExecutive.id} executiveName={selectedExecutive.username} type="screen" />
                      <FontAwesomeIcon icon={faTimesCircle} size="lg" onClick={() => stopStream("screen")} style={{ cursor: "pointer", marginTop: "10px" }} />
                    </>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <p>Start Screen Cast</p>
                      <FontAwesomeIcon icon={faDesktop} size="2x" onClick={() => triggerStream("screen")} style={{ cursor: "pointer" }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Webcam Video */}
              <div className="exec-box-wrapper">
                <div className="exec-box">
                  {showVideo ? (
                    <>
                      <StreamPlayer executiveId={selectedExecutive.id} executiveName={selectedExecutive.username} type="video" />
                      <FontAwesomeIcon icon={faTimesCircle} size="lg" onClick={() => stopStream("video")} style={{ cursor: "pointer", marginTop: "10px" }} />
                    </>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <p>Start Webcam</p>
                      <FontAwesomeIcon icon={faVideo} size="2x" onClick={() => triggerStream("video")} style={{ cursor: "pointer" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Audio Stream */}
            <div className="audio-test-bar">
              {showAudio ? (
                <>
                  <StreamPlayer executiveId={selectedExecutive.id} executiveName={selectedExecutive.username} type="audio" />
                  <FontAwesomeIcon icon={faTimesCircle} size="lg" onClick={() => stopStream("audio")} style={{ cursor: "pointer", marginLeft: "15px" }} />
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <p>Start Audio Stream</p>
                  <FontAwesomeIcon icon={faVolumeUp} size="2x" onClick={() => triggerStream("audio")} style={{ cursor: "pointer" }} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Monitoring;