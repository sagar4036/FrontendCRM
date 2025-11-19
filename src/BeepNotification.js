import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { FaTimes, FaBell, FaCheck } from 'react-icons/fa';
import { BeepSettingsContext } from './context/BeepSettingsContext';
import { SoundGenerator, soundOptions } from './features/settings/SoundGenerator';
import '../src/styles/beepNotification.css';

const BeepNotification = ({ 
  notifications, 
  unreadCount, 
  onDismissPopup, 
}) => {
  const { settings } = useContext(BeepSettingsContext);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const timeoutRef = useRef(null);
  const dismissTimeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const soundGeneratorRef = useRef(null);

  // Initialize sound generator
  useEffect(() => {
    soundGeneratorRef.current = new SoundGenerator();
    
    return () => {
      if (soundGeneratorRef.current) {
        soundGeneratorRef.current.close();
      }
    };
  }, []);

  const playNotificationSound = useCallback(async () => {
    if (settings.enabled && soundGeneratorRef.current) {
      const selectedSound = soundOptions.find(s => s.id === settings.selectedSound);
      if (selectedSound) {
        try {
          await selectedSound.generator(soundGeneratorRef.current, settings.volume);
        } catch (error) {
          console.log('Audio play failed:', error);
        }
      }
    }
  }, [settings.enabled, settings.selectedSound, settings.volume]);

  // Function to determine notification type and generate appropriate messages
  const getNotificationMessages = useCallback((notifications) => {
    if (!notifications || notifications.length === 0) {
      return { 
        initialMessage: 'New notification', 
        reminderMessage: "Haven't you checked the notification yet?",
        type: 'general'
      };
    }

    // Get the latest unread notification to determine type
    const latestUnread = notifications.find(n => !n.is_read);
    
    if (!latestUnread) {
      return { 
        initialMessage: 'New notification', 
        reminderMessage: "Haven't you checked the notification yet?",
        type: 'general'
      };
    }

    const message = latestUnread.message?.toLowerCase() || '';

    // Check for lead assignment notifications
    if (message.includes('you have been assigned a new lead')) {
      return {
        initialMessage: 'New leads assigned',
        reminderMessage: "Haven't you checked the new leads yet?",
        type: 'lead'
      };
    }
    
    // Check for reminder notifications (follow-up or meeting)
    if (message.includes('reminder:') || message.includes('⏰ reminder:')) {
      if (message.includes('follow up')) {
        return {
          initialMessage: 'Follow-up reminder',
          reminderMessage: "Don't forget your follow-up task!",
          type: 'followup'
        };
      } else if (message.includes('meeting')) {
        return {
          initialMessage: 'Meeting reminder',
          reminderMessage: "You have an upcoming meeting!",
          type: 'meeting'
        };
      } else {
        return {
          initialMessage: 'Reminder notification',
          reminderMessage: "Don't forget your scheduled task!",
          type: 'reminder'
        };
      }
    }
    
    // Default for other notification types
    return {
      initialMessage: 'New notification',
      reminderMessage: "Haven't you checked the notification yet?",
      type: 'general'
    };
  }, []);

  const showNotificationPopup = useCallback((message) => {
    setPopupMessage(message);
    setShowPopup(true);
    playNotificationSound();
  }, [playNotificationSound]);

  const handleDismissPopup = useCallback(() => {
    setShowPopup(false);
    
    // Clear all timeouts and intervals
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Set timeout for reminder message
    dismissTimeoutRef.current = setTimeout(() => {
      if (unreadCount > 0) {
        showNotificationPopup(reminderMessage);
        setIsFirstMessage(false);
      }
    }, (settings.reminderDelay || 30) * 1000);
    
    if (onDismissPopup) onDismissPopup();
  }, [unreadCount, onDismissPopup, reminderMessage, showNotificationPopup, settings.reminderDelay]);

  // Effect to handle beep interval when popup is shown
  useEffect(() => {
    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (showPopup && unreadCount > 0 && settings.enabled && settings.timing > 0) {
      // Set new interval based on current settings
      intervalRef.current = setInterval(() => {
        playNotificationSound();
      }, settings.timing * 1000);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [showPopup, unreadCount, settings.enabled, settings.timing, playNotificationSound]);

  // Effect to handle notification logic
  useEffect(() => {
    if (unreadCount > 0) {
      const { initialMessage, reminderMessage: remMessage, type } = getNotificationMessages(notifications);
      
      setReminderMessage(remMessage);
      setNotificationType(type);
      
      if (isFirstMessage) {
        showNotificationPopup(initialMessage);
        timeoutRef.current = setTimeout(() => {
          if (showPopup) {
            setPopupMessage(remMessage);
            setIsFirstMessage(false);
          }
        }, 30000);
      } else {
        showNotificationPopup(remMessage);
      }
    } else {
      setShowPopup(false);
      setIsFirstMessage(true);
      
      // Clear all timeouts and intervals when no unread messages
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [unreadCount, notifications, isFirstMessage, showNotificationPopup, showPopup, getNotificationMessages]);

  // Update first message state when popup message changes
  useEffect(() => {
    if (popupMessage === reminderMessage) {
      setIsFirstMessage(false);
    }
  }, [popupMessage, reminderMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!showPopup) return null;

  // Get appropriate title based on notification type
  const getNotificationTitle = () => {
    switch (notificationType) {
      case 'lead':
        return 'New Lead Assignment';
      case 'followup':
        return 'Follow-up Reminder';
      case 'meeting':
        return 'Meeting Reminder';
      case 'reminder':
        return 'Task Reminder';
      default:
        return 'Notification Alert';
    }
  };

  // Get appropriate button text based on message type
  const getButtonText = () => {
    if (popupMessage === reminderMessage) {
      switch (notificationType) {
        case 'lead':
          return "Yes, I'll check leads";
        case 'followup':
          return "Yes, I'll follow up";
        case 'meeting':
          return "Yes, I'll check meeting";
        case 'reminder':
          return "Yes, I'll check task";
        default:
          return "Yes, I'll check";
      }
    }
    return 'Dismiss';
  };

  return (
    <>
      <div className="beep-notification-overlay">
        <div className="beep-notification-popup">
          <div className="beep-notification-header">
            <div className="beep-notification-icon">
              <FaBell size={24} />
            </div>
            <div className="beep-notification-content">
              <h3 className="beep-notification-title">{getNotificationTitle()}</h3>
              <p className="beep-notification-message">{popupMessage}</p>
              {unreadCount > 0 && (
                <p className="beep-notification-count">
                  You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              className="beep-notification-close"
              onClick={handleDismissPopup}
              aria-label="Close notification"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="beep-notification-actions">
            <button
              className={`beep-notification-btn ${
                popupMessage === reminderMessage 
                  ? 'beep-notification-btn-primary' 
                  : 'beep-notification-btn-secondary'
              }`}
              onClick={handleDismissPopup}
            >
              {popupMessage === reminderMessage && <FaCheck size={16} />}
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BeepNotification;