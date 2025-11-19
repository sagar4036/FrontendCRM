import React from 'react';
import ScheduleMeeting from '../features/schedule-meet/ScheduleMeeting';
import "../styles/schedule.css";

const ScheduleRoutes = () => {
  return (
    <div className="app-container">
      <div>
        <ScheduleMeeting/>
      </div>
    </div>
    
  );
};

export default ScheduleRoutes;