import React from "react";
import { createPortal } from "react-dom";

// Sound utility class
class SoundManager {
    constructor() {
        this.sounds = {};
        this.initializeSounds();
    }

    initializeSounds() {
        this.sounds = {
            success: { frequency: 880, duration: 200, type: 'success' },
            error: { frequency: 200, duration: 300, type: 'error' },
            warning: { frequency: 440, duration: 250, type: 'warning' },
            info: { frequency: 660, duration: 150, type: 'info' }
        };
    }

    playSound(type) {
        if (!this.sounds[type]) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (type === 'success') {
            this.playTone(audioContext, 523, 150);
            setTimeout(() => this.playTone(audioContext, 659, 150), 100);
        } else if (type === 'error') {
            this.playTone(audioContext, 200, 300, 'square');
        } else if (type === 'warning') {
            this.playTone(audioContext, 440, 100);
            setTimeout(() => this.playTone(audioContext, 370, 100), 120);
            setTimeout(() => this.playTone(audioContext, 440, 100), 240);
        } else if (type === 'info') {
            this.playTone(audioContext, 523, 100);
            setTimeout(() => this.playTone(audioContext, 659, 100), 80);
            setTimeout(() => this.playTone(audioContext, 784, 100), 160);
        }
    }

    playTone(audioContext, frequency, duration, waveType = 'sine') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = waveType;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    }
}

// Initialize sound manager
const soundManager = new SoundManager();

const Alert = ({ alerts, onClose, playSound }) => {
    if (!alerts.length) return null;

    return createPortal(
        <div className="alert-overlay active">
            {alerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`alert-popup ${alert.type} animate-in`}
                >
                    <div className="alert-header">
                        <div className="alert-icon-container">
                            <span className={`alert-icon ${alert.type}`}>
                                {alert.type === "success" && "✅"}
                                {alert.type === "error" && "❌"}
                                {alert.type === "warning" && "⚠️"}
                                {alert.type === "info" && "ℹ️"}
                            </span>
                        </div>
                        <button className="alert-close" onClick={() => onClose(alert.id)}>
                            ✕
                        </button>
                    </div>
                    <div className="alert-content">
                        <h2 className="alert-title">{alert.title}</h2>
                        <p className="alert-message">{alert.message}</p>
                    </div>
                    <div className="alert-actions">
                        {alert.confirm && (
                            <button
                                className="alert-btn confirm"
                                onClick={() => {
                                    alert.onConfirm();
                                    onClose(alert.id);
                                }}
                            >
                                Confirm
                            </button>
                        )}
                        <button className="alert-btn cancel" onClick={() => onClose(alert.id)}>
                            {alert.confirm ? "Cancel" : "OK"}
                        </button>
                    </div>
                    {alert.duration && (
                        <div className="alert-progress">
                            <div
                                className="alert-progress-bar"
                                style={{ animationDuration: `${alert.duration}ms` }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>,
        document.body
    );
};

// Export both the Alert component and soundManager
export { Alert, soundManager };

