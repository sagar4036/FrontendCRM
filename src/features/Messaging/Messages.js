import React, { useState, useEffect, useRef } from 'react';
import "../../styles/messaging.css"
import { 
  FaPaperPlane, 
  FaSearch, 
  FaCircle, 
  FaUsers, 
  FaStar, 
  FaPhone, 
  FaVideo,
  FaFile,
  FaImage,
  FaSmile,
  FaEllipsisV,
  FaUserPlus,
  FaCrown,
  FaShieldAlt,
  FaRocket,
  FaBolt,
  FaMagic,
 
} from 'react-icons/fa';
import SidebarToggle from "../admin/SidebarToggle";

const Messages = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all'); // all, teams, starred, online
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeUsers, setActiveUsers] = useState(new Set());
  const [theme, setTheme] = useState('default');
  const messagesEndRef = useRef(null);
  const sidebarCollapsed = localStorage.getItem("adminSidebarExpanded") === "false";

  const themes = {
    default: { primary: '#667eea', secondary: '#764ba2', accent: '#4299e1' },
    ocean: { primary: '#00b4db', secondary: '#0083b0', accent: '#48cae4' },
    sunset: { primary: '#ff6b6b', secondary: '#ee5a24', accent: '#ff9ff3' },
    forest: { primary: '#2ecc71', secondary: '#27ae60', accent: '#6c5ce7' },
    royal: { primary: '#8e44ad', secondary: '#9b59b6', accent: '#e17055' },
    cosmic: { primary: '#0f3460', secondary: '#16537e', accent: '#533a7b' }
  };

  const reactions = ['❤️', '👍', '😂', '🚀', '🔥', '⚡', '✨', '🎉'];

  // Enhanced mock data with teams
  useEffect(() => {
    setTimeout(() => {
      setTeams([
        {
          id: 'team-1',
          name: 'Development Team',
          icon: '💻',
          color: '#667eea',
          members: [3, 5, 6],
          isOnline: true,
          lastActivity: '5 min ago'
        },
        {
          id: 'team-2', 
          name: 'Marketing Squad',
          icon: '📢',
          color: '#ff6b6b',
          members: [2, 7, 8],
          isOnline: true,
          lastActivity: '2 min ago'
        },
        {
          id: 'team-3',
          name: 'Executive Board',
          icon: '👑',
          color: '#8e44ad',
          members: [1, 4],
          isOnline: false,
          lastActivity: '1 hour ago'
        }
      ]);

      setContacts([
        {
          id: 1,
          name: 'John Executive',
          role: 'CEO',
          avatar: 'J',
          lastMessage: 'Hey, I need help with the client presentation...',
          timestamp: '2 min ago',
          unread: 3,
          online: true,
          starred: true,
          status: 'In a meeting',
          mood: '🎯',
          level: 'executive'
        },
        {
          id: 2,
          name: 'Sarah Manager',
          role: 'Marketing Manager',
          avatar: 'S',
          lastMessage: 'The campaign results look amazing! 🚀',
          timestamp: '5 min ago',
          unread: 0,
          online: true,
          starred: false,
          status: 'Available',
          mood: '✨',
          level: 'manager'
        },
        {
          id: 3,
          name: 'Mike Developer',
          role: 'Senior Dev',
          avatar: 'M',
          lastMessage: 'Can you review the latest changes?',
          timestamp: '1 hour ago',
          unread: 1,
          online: true,
          starred: true,
          status: 'Coding',
          mood: '⚡',
          level: 'developer'
        },
        {
          id: 4,
          name: 'Lisa Client',
          role: 'Premium Client',
          avatar: 'L',
          lastMessage: 'Thank you for the quick response!',
          timestamp: '2 hours ago',
          unread: 0,
          online: false,
          starred: false,
          status: 'Offline',
          mood: '💼',
          level: 'client'
        },
        {
          id: 5,
          name: 'Alex Designer',
          role: 'UI/UX Designer',
          avatar: 'A',
          lastMessage: 'New mockups are ready for review ✨',
          timestamp: '30 min ago',
          unread: 2,
          online: true,
          starred: false,
          status: 'Designing',
          mood: '🎨',
          level: 'developer'
        },
        {
          id: 6,
          name: 'Tom Backend',
          role: 'Backend Engineer',
          avatar: 'T',
          lastMessage: 'API integration is complete',
          timestamp: '45 min ago',
          unread: 0,
          online: true,
          starred: false,
          status: 'Building',
          mood: '🔧',
          level: 'developer'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Enhanced messages with reactions and types
  useEffect(() => {
    if (selectedContact) {
      const sampleMessages = [
        {
          id: 1,
          senderId: selectedContact.id,
          senderName: selectedContact.name,
          content: 'Hi there! How are you doing today? 😊',
          timestamp: new Date(Date.now() - 60000),
          isOwnMessage: false,
          type: 'text',
          reactions: { '👍': 2, '❤️': 1 }
        },
        {
          id: 2,
          senderId: 'admin',
          senderName: 'You',
          content: 'Hello! I\'m doing great, thanks for asking. How can I help you?',
          timestamp: new Date(Date.now() - 30000),
          isOwnMessage: true,
          type: 'text'
        },
        {
          id: 3,
          senderId: selectedContact.id,
          senderName: selectedContact.name,
          content: 'I need some assistance with the latest project updates.',
          timestamp: new Date(Date.now() - 15000),
          isOwnMessage: false,
          type: 'text',
          reactions: { '🚀': 1 }
        }
      ];
      
      setMessages(sampleMessages);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate active users
    const interval = setInterval(() => {
      setActiveUsers(new Set([1, 2, 3, Math.floor(Math.random() * 6) + 1]));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedContact) {
      const newMessage = {
        id: messages.length + 1,
        senderId: 'admin',
        senderName: 'You',
        content: message.trim(),
        timestamp: new Date(),
        isOwnMessage: true,
        type: 'text'
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyMessage = {
          id: messages.length + 2,
          senderId: selectedContact.id,
          senderName: selectedContact.name,
          content: 'Thanks for your message! I\'ll get back to you shortly. 👍',
          timestamp: new Date(),
          isOwnMessage: false,
          type: 'text'
        };
        setMessages(prev => [...prev, replyMessage]);
      }, 2000);
    }
  };

  const addReaction = (messageId, reaction) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions } || {};
        reactions[reaction] = (reactions[reaction] || 0) + 1;
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const getFilteredContacts = () => {
    let filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (selectedTab) {
      case 'teams':
        return teams;
      case 'starred':
        return filtered.filter(contact => contact.starred);
      case 'online':
        return filtered.filter(contact => contact.online);
      default:
        return filtered;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'executive': return <FaCrown className="level-icon executive" />;
      case 'manager': return <FaShieldAlt className="level-icon manager" />;
      case 'developer': return <FaBolt className="level-icon developer" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="msg-admin-wrapper">
        <div className="msg-admin-loading">
          <div className="loading-animation">
            <div className="pulse-dot"></div>
            <div className="pulse-dot"></div>
            <div className="pulse-dot"></div>
          </div>
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <div className={`msg-admin-layout ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
    <aside className="msg-admin-sidebar">
      <SidebarToggle />
    </aside>
    <div className="msg-admin-wrapper" style={{ '--theme-primary': themes[theme].primary, '--theme-secondary': themes[theme].secondary, '--theme-accent': themes[theme].accent }}>
      <div className="msg-admin-header">
        <h1 className="msg-admin-title">
          <FaMagic className="title-icon" />
          Messages
        </h1>
        
        <div className="header-controls">
          <div className="theme-selector">
            {Object.keys(themes).map(themeName => (
              <button
                key={themeName}
                className={`theme-btn ${theme === themeName ? 'active' : ''}`}
                onClick={() => setTheme(themeName)}
                style={{ background: themes[themeName].primary }}
              />
            ))}
          </div>
          
          <div className="active-count">
            <FaCircle className="active-indicator" />
            {activeUsers.size} active
          </div>
        </div>
      </div>
      
      <div className="msg-admin-container">
        {/* Enhanced Contacts List */}
        <div className="msg-admin-contacts">
          <div className="msg-admin-search">
            <FaSearch className="msg-admin-search-icon" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="msg-admin-search-input"
            />
          </div>

          {/* Tab Navigation */}
          <div className="contact-tabs">
            {[
              { id: 'all', label: 'All', icon: FaUsers },
              { id: 'teams', label: 'Teams', icon: FaUsers },
              { id: 'starred', label: 'Starred', icon: FaStar },
              { id: 'online', label: 'Online', icon: FaCircle }
            ].map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${selectedTab === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedTab(tab.id)}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="msg-admin-contacts-list">
            {selectedTab === 'teams' ? (
              // Team Groups
              teams.map(team => (
                <div
                  key={team.id}
                  className="team-item"
                  onClick={() => setSelectedContact(team)}
                >
                  <div className="team-avatar" style={{ background: team.color }}>
                    <span className="team-icon">{team.icon}</span>
                  </div>
                  <div className="team-info">
                    <div className="team-header">
                      <span className="team-name">{team.name}</span>
                      <span className="team-time">{team.lastActivity}</span>
                    </div>
                    <div className="team-members">
                      {team.members.length} members
                      <div className="member-indicators">
                        {team.members.slice(0, 3).map((memberId, index) => (
                          <div 
                            key={memberId}
                            className="mini-avatar"
                            style={{ zIndex: 3 - index, marginLeft: index > 0 ? '-8px' : '0' }}
                          >
                            {contacts.find(c => c.id === memberId)?.avatar}
                          </div>
                        ))}
                        {team.members.length > 3 && (
                          <div className="more-members">+{team.members.length - 3}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  {team.isOnline && <div className="team-online-indicator" />}
                </div>
              ))
            ) : (
              // Individual Contacts
              getFilteredContacts().map(contact => (
                <div
                  key={contact.id}
                  className={`msg-admin-contact-item ${selectedContact?.id === contact.id ? 'selected' : ''} ${contact.online ? 'online' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="msg-admin-contact-avatar">
                    <div className="msg-admin-avatar-circle">
                      {contact.avatar}
                      {getLevelIcon(contact.level)}
                    </div>
                    {contact.online && <FaCircle className="msg-admin-online-indicator" />}
                    <span className="mood-indicator">{contact.mood}</span>
                  </div>
                  <div className="msg-admin-contact-info">
                    <div className="msg-admin-contact-header">
                      <span className="msg-admin-contact-name">
                        {contact.name}
                        {contact.starred && <FaStar className="star-icon" />}
                      </span>
                      <span className="msg-admin-contact-time">{contact.timestamp}</span>
                    </div>
                    <div className="msg-admin-contact-preview">
                      <span className="msg-admin-contact-role">{contact.role}</span>
                      <span className="msg-admin-last-message">{contact.lastMessage}</span>
                      <span className="contact-status">{contact.status}</span>
                    </div>
                  </div>
                  {contact.unread > 0 && (
                    <div className="msg-admin-unread-badge pulse">{contact.unread}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enhanced Chat Area */}
        <div className="msg-admin-chat">
          {selectedContact ? (
            <>
              {/* Enhanced Chat Header */}
              <div className="msg-admin-chat-header">
                <div className="msg-admin-chat-user">
                  <div className="msg-admin-avatar-circle">
                    {selectedContact.icon || selectedContact.avatar}
                  </div>
                  <div className="msg-admin-chat-user-info">
                    <h3>{selectedContact.name}</h3>
                    <span className={`msg-admin-status ${selectedContact.online || selectedContact.isOnline ? 'online' : 'offline'}`}>
                      {selectedContact.online || selectedContact.isOnline ? 'Online' : 'Offline'}
                      {selectedContact.status && ` • ${selectedContact.status}`}
                    </span>
                  </div>
                </div>
                
                <div className="chat-actions">
                  <button className="action-btn"><FaPhone /></button>
                  <button className="action-btn"><FaVideo /></button>
                  <button className="action-btn"><FaUserPlus /></button>
                  <button className="action-btn"><FaEllipsisV /></button>
                </div>
              </div>

              {/* Enhanced Messages */}
              <div className="msg-admin-messages">
                {messages.map(msg => (
                  <div key={msg.id} className="message-wrapper">
                    <div className={`msg-admin-message ${msg.isOwnMessage ? 'own' : 'other'} fade-in`}>
                      <div className="msg-admin-message-content">
                        <p>{msg.content}</p>
                        <span className="msg-admin-message-time">
                          {formatTime(msg.timestamp)}
                        </span>
                        
                        {/* Message Reactions */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className="message-reactions">
                            {Object.entries(msg.reactions).map(([reaction, count]) => (
                              <span key={reaction} className="reaction-bubble">
                                {reaction} {count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Quick Reactions */}
                      <div className="quick-reactions">
                        {reactions.slice(0, 3).map(reaction => (
                          <button
                            key={reaction}
                            className="quick-reaction-btn"
                            onClick={() => addReaction(msg.id, reaction)}
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    {selectedContact.name} is typing...
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Message Input */}
              <form onSubmit={handleSendMessage} className="msg-admin-input-form">
                <div className="msg-admin-input-container">
                  <button type="button" className="attachment-btn">
                    <FaFile />
                  </button>
                  <button type="button" className="attachment-btn">
                    <FaImage />
                  </button>
                  
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="msg-admin-input"
                  />
                  
                  <button 
                    type="button" 
                    className="emoji-btn"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <FaSmile />
                  </button>
                  
                  <button
                    type="submit"
                    className="msg-admin-send-btn"
                    disabled={!message.trim()}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
                
                {/* Quick Emoji Picker */}
                {showEmojiPicker && (
                  <div className="emoji-picker">
                    {reactions.map(emoji => (
                      <button
                        key={emoji}
                        className="emoji-option"
                        onClick={() => {
                          setMessage(message + emoji);
                          setShowEmojiPicker(false);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="msg-admin-empty">
              <div className="empty-animation">
                <FaRocket className="rocket-icon" />
                <div className="sparkles">
                  <span>✨</span>
                  <span>💫</span>
                  <span>⭐</span>
                </div>
              </div>
              <h3>Select a conversation</h3>
              <p>Choose from your existing conversations, teams, or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Messages;