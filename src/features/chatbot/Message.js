import React from "react";
import { FaUser, FaRobot } from "react-icons/fa";

const Message = ({ text, isUser }) => {
    return (
        <div className={isUser ? "message user-message" : "message bot-message"}>
            {isUser ? <FaUser className="user-icon" /> : <FaRobot className="bot-icon" />}
            <div className="message-content">{text}</div>
        </div>
    );
};

export default Message;