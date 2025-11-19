import React, { useState, useRef, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import { useNavigate } from "react-router-dom";
import '../../styles/verify.css'; 

const Verify = () => {
  const { verifyExecutiveOTP, handleResendExecutiveOtp, otpResendLoading, otpResendError } = useApi();
  const [email, setEmail] = useState(null); // Start as null
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State for popup
  const inputRefs = useRef([]);

  useEffect(() => {
    const stored = localStorage.getItem("executiveData");
    if (!stored) {
      navigate("/login"); // If not present, redirect
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.email) {
        setEmail(parsed.email);
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Invalid localStorage format:", err);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-close popup after 3 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length === 6) {
      const newOtp = digits.split('');
      setOtp(newOtp);
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyExecutiveOTP(email, otpString);
      
      // Check if response has the expected structure
      if (response && response.message) {
        setSuccess(true);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      // Customize error message for specific backend error
      const backendError = err.response?.data?.error || err.response?.data?.message || 'Something went wrong. Please try again.';
      if (backendError === "No unverified user found with this email.") {
        setError("This email is already verified and in use.");
      } else {
        setError(backendError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email not found. Please try logging in again.');
      return;
    }

    setCanResend(false);
    setCountdown(60);
    setError('');
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0].focus();

    try {
      await handleResendExecutiveOtp(email);
      setShowPopup(true); // Show popup on success
    } catch (err) {
      // Customize error message for specific backend error
      const backendError = otpResendError || err.response?.data?.error || 'Failed to resend OTP. Please try again.';
      if (backendError === "No unverified user found with this email.") {
        setError("This email is already verified and in use.");
      } else {
        setError(backendError);
      }
      setCanResend(true); // Allow retry on failure
      setCountdown(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (success) {
    return (
      <div className="verify-container">
        <div className="verify-card">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Verification Successful!</h2>
          <p className="success-message">
            Your phone number has been verified successfully.
          </p>
          <button className="continue-button">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-container">
      <div className="verify-card">
        <div className="verify-header">
          <h2 className="verify-title">Verify Your Phone</h2>
          <p className="verify-subtitle">
            We've sent a 6-digit code to<br />
            <strong>{email || '+1 (555) 123-4567'}</strong>
          </p>
        </div>

        <div className="verify-form">
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`otp-input ${error ? 'otp-input-error' : ''} ${digit ? 'otp-input-filled' : ''}`}
                autoComplete="off"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <div className="verify-error">{error}</div>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`submit-button ${isLoading ? 'submit-button-loading' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button>
        </div>

        <div className="verify-footer">
          <p className="resend-text">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                onClick={handleResend}
                className="resend-button"
                disabled={otpResendLoading}
              >
                {otpResendLoading ? 'Resending...' : 'Resend Code'}
              </button>
            ) : (
              <span className="countdown">
                Resend in {formatTime(countdown)}
              </span>
            )}
          </p>
        </div>
        <div style={{color:"black"}}>Code will expire in 10 minutes</div>
      </div>

      {showPopup && (
        <div className="otp-popup">
          <div className="otp-popup-content">
            <span className="otp-popup-icon">✓</span>
            <p>OTP has been resent to {email}!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;