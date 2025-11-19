import React from "react";
import "../../styles/spinner.css";

const LoadingSpinner = ({ text = "Processing request..." }) => {
  return (
    <div className="atozee-loading-overlay">
      <div className="atozee-loading-container">
        <div className="atozee-spinner">
          <div className="atozee-orbit"></div>
          <div className="atozee-orbit atozee-orbit-2"></div>
        </div>
        <div className="atozee-loading-text">
          <span>{text}</span>
          <div className="atozee-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
