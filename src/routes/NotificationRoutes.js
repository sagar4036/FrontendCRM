import React from 'react';
import Notification from '../features/executive/Notification';
import "../styles/notification.css";

const NotificationRoutes = () => {
  return (
    <div className="notification-page-wrapper">
      <div className="notification-content-area">
        <Notification />
      </div>
    </div>
  );
};

export default NotificationRoutes;