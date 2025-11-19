import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaUserShield } from "react-icons/fa";
import {useApi} from "../../context/ApiContext";


const ChangePassword = () => {
  const { handleChangePassword, isPasswordUpdating } = useApi(); // Get API functions
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordVisible, setPasswordVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on input change
    setSuccess(""); // Clear success on input change
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match!");
      return;
    }

    try {
      await handleChangePassword(formData.currentPassword, formData.newPassword);
      setSuccess("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(error.message || "Failed to change password. Please try again.");
    }
  };

  return (
    <div className="change-password">
      <style>
        {`/* Responsive adjustments for Change Password */
.change-password {
  max-width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.input-container {
  position: relative;
  width: 100%;
}

.input-container input {
  width: 100%;
  padding: 12px 40px 12px 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.password-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 8px;
}

.success-message {
  color: green;
  font-size: 14px;
  margin-top: 8px;
}

button {
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .password-form {
    padding: 0 10px;
  }
}
`}
      </style>
      <div className="contact-admin-container">
        <div className="contact-admin-box">
          <FaUserShield className="admin-icon" />
          <p className="change-password-text">
            Contact to Administrator for changing the password
          </p>
        </div>
      </div>

      <h2>Change Password</h2>

      <form onSubmit={handleSubmit} className="password-form">
        <div className="input-container">
          <input
            type={passwordVisible.currentPassword ? "text" : "password"}
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="Enter your current password"
            required
          />
          <span
            className="password-icon"
            onClick={() => togglePasswordVisibility("currentPassword")}
          >
            {passwordVisible.currentPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="input-container">
          <input
            type={passwordVisible.newPassword ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter a new password"
            required
          />
          <span
            className="password-icon"
            onClick={() => togglePasswordVisibility("newPassword")}
          >
            {passwordVisible.newPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="input-container">
          <input
            type={passwordVisible.confirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
            required
          />
          <span
            className="password-icon"
            onClick={() => togglePasswordVisibility("confirmPassword")}
          >
            {passwordVisible.confirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" disabled={isPasswordUpdating}>
          {isPasswordUpdating ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;