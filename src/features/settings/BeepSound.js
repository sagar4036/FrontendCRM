import React, { useState, useContext, useRef, useEffect } from "react";
import { ThemeContext } from "../admin/ThemeContext";
import { BeepSettingsContext } from "../../context/BeepSettingsContext";
import { SoundGenerator, soundOptions } from "./SoundGenerator";
import Swal from "sweetalert2"; // Import SweetAlert2

function BeepSound() {
  const { theme } = useContext(ThemeContext);
  const { settings: committedSettings, setSettings: setCommittedSettings } =
    useContext(BeepSettingsContext);
  const [draftSettings, setDraftSettings] = useState(committedSettings);
  const soundGeneratorRef = useRef(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem("beepSoundSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setDraftSettings(parsed);
      setCommittedSettings(parsed);
    } else {
      setDraftSettings(committedSettings);
    }
 }, [committedSettings, setCommittedSettings]);
 
  useEffect(() => {
    // Initialize sound generator
    soundGeneratorRef.current = new SoundGenerator();

    // Cleanup on unmount
    return () => {
      if (soundGeneratorRef.current) {
        soundGeneratorRef.current.close();
      }
    };
  }, []);

  const timingOptions = [
    { value: 1, label: "1 second" },
    { value: 3, label: "3 seconds" },
    { value: 5, label: "5 seconds" },
    { value: 10, label: "10 seconds" },
    { value: 15, label: "15 seconds" },
    { value: 30, label: "30 seconds" },
    { value: 60, label: "1 minute" },
  ];

  const handleSoundChange = (soundId) => {
    setDraftSettings((prev) => ({
      ...prev,
      selectedSound: soundId,
    }));
  };

  const handleVolumeChange = (e) => {
    setDraftSettings((prev) => ({
      ...prev,
      volume: parseInt(e.target.value),
    }));
  };

  const handleTimingChange = (timing) => {
    setDraftSettings((prev) => ({
      ...prev,
      timing: timing,
    }));
  };

  const handleEnabledChange = (e) => {
    setDraftSettings((prev) => ({
      ...prev,
      enabled: e.target.checked,
    }));
  };

  const handleReminderDelayChange = (e) => {
    setDraftSettings((prev) => ({
      ...prev,
      reminderDelay: parseInt(e.target.value),
    }));
  };

  const testSound = async (soundId = null) => {
    const soundToTest = soundId || draftSettings.selectedSound;
    const selectedSound = soundOptions.find((s) => s.id === soundToTest);

    if (selectedSound && soundGeneratorRef.current) {
      try {
        await selectedSound.generator(
          soundGeneratorRef.current,
          draftSettings.volume
        );
      } catch (error) {
        console.log("Sound test failed:", error);
      }
    }
  };

  const saveSettings = () => {
    setCommittedSettings(draftSettings);
    localStorage.setItem("beepSoundSettings", JSON.stringify(draftSettings));
    Swal.fire({
      icon: "success",
      title: "Settings Saved",
      text: "Settings saved successfully!",
      confirmButtonColor: "#28a745",
      background: "#f4f4f4",
      timer: 2000,
    });
  };

  const resetSettings = () => {
    const defaultSettings = {
      selectedSound: "beep1",
      volume: 50,
      timing: 5,
      enabled: true,
      reminderDelay: 30, // default in seconds
    };
    setDraftSettings(defaultSettings);
    setCommittedSettings(defaultSettings);
    localStorage.setItem("beepSoundSettings", JSON.stringify(defaultSettings));
  };

  return (
    <div className="beep-sound-settings" data-theme={theme}>
      <div className="settings-header">
        <div>
          <h2>Beep Sound Settings</h2>
          <p>
            Customize your notification sounds and timing preferences
          </p>
        </div>
      </div>

      <div className="settings-sections">
        <section className="settings-section">
          <div className="section-header">
            <h3>Change Sound</h3>
            <p>Select your preferred notification sound</p>
          </div>

          <div className="sound-options">
            {soundOptions.map((sound) => (
              <div
                key={sound.id}
                className={`sound-option ${
                  draftSettings.selectedSound === sound.id ? "selected" : ""
                }`}
                onClick={() => handleSoundChange(sound.id)}
              >
                <div className="sound-info">
                  <span className="sound-name">{sound.name}</span>
                  <button
                    className="test-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      testSound(sound.id);
                    }}
                  >
                    🔊 Test
                  </button>
                </div>
                <div className="sound-indicator">
                  {draftSettings.selectedSound === sound.id && (
                    <span className="checkmark">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="volume-control">
            <label htmlFor="volume">Volume: {draftSettings.volume}%</label>
            <input
              type="range"
              id="volume"
              min="0"
              max="100"
              value={draftSettings.volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        </section>

        <section className="settings-section">
          <div className="section-header">
            <h3>Change Timings</h3>
            <p>Set how often notifications should sound</p>
          </div>

          <div className="timing-options">
            {timingOptions.map((option) => (
              <div
                key={option.value}
                className={`timing-option ${
                  draftSettings.timing === option.value ? "selected" : ""
                }`}
                onClick={() => handleTimingChange(option.value)}
              >
                <span className="timing-label">{option.label}</span>
                {draftSettings.timing === option.value && (
                  <span className="checkmark">✓</span>
                )}
              </div>
            ))}
          </div>

          <div className="reminder-delay-control">
            <div className="section-header">
              <h3>Reminder Message Timing</h3>
              <p>Control how long after dismissing the popup to remind again</p>
            </div>
            <h3>Reminder Delay: {draftSettings.reminderDelay} seconds</h3>
            <input
              type="range"
              id="reminderDelay"
              min="10"
              max="300"
              step="10"
              value={draftSettings.reminderDelay}
              onChange={handleReminderDelayChange}
              className="volume-slider"
            />
          </div>
          <div className="toggle-section">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={draftSettings.enabled}
                onChange={handleEnabledChange}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Enable sound notifications</span>
            </label>
          </div>
        </section>
      </div>

      <div className="settings-actions">
        <button className="btn btn-secondary" onClick={resetSettings}>
          Reset to Default
        </button>
        <button className="btn btn-primary" onClick={saveSettings}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default BeepSound;