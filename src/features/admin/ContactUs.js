






import React, { useState, useEffect } from "react";
import '../../styles/contactUs.css';
import SidebarToggle from "./SidebarToggle";
import { useLoading } from "../../context/LoadingContext";
import AdminSpinner from "../spinner/AdminSpinner";
import { Alert, soundManager } from "../modal/alert";

const ContactUs = () => {
  const { isLoading, variant, showLoader, hideLoader } = useLoading();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferred: "phone",
    message: "",
  });
  const [alerts, setAlerts] = useState([]); // Added for alert.js integration

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlerts([
      ...alerts,
      {
        id: Date.now(),
        type: "success",
        title: "Message Submitted",
        message: "Your message has been submitted successfully!",
        duration: 5000,
      },
    ]);
    soundManager.playSound("success");
  };

  // Handle alert close
  const handleAlertClose = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  useEffect(() => {
    try {
      showLoader("Loading ContactUs...", "admin");
      const timeout = setTimeout(() => {
        hideLoader();
      }, 400); // Show for at least 400ms
      return () => clearTimeout(timeout);
    } catch (err) {
      console.error("Failed to load ContactUs:", err);
      setAlerts([
        ...alerts,
        {
          id: Date.now(),
          type: "error",
          title: "Load Failed",
          message: "Failed to load ContactUs page: " + (err.message || "Unknown error"),
          duration: 5000,
        },
      ]);
      soundManager.playSound("error");
      hideLoader();
    }
}, [alerts, hideLoader, showLoader]);
  return (
    <>
      <SidebarToggle />
      <div className="page-wrapper">
        <div className="contact-container">
          {isLoading && variant === "admin" && (
            <AdminSpinner text="Loading ContactUs..." />
          )}
          <div className="contact-left">
            <h2>Contact Us</h2>
            <p>Feel like contacting us? Submit your queries here and we will get back to you as soon as possible.</p>
          </div>

          <div className="contact-form">
            <h3>Send us a Message</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <div className="communication-method">
                <p Petit>Preferred method of communication</p>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="preferred"
                      value="email"
                      checked={formData.preferred === "email"}
                      onChange={handleChange}
                    />
                    Email
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="preferred"
                      value="phone"
                      checked={formData.preferred === "phone"}
                      onChange={handleChange}
                    />
                    Phone
                  </label>
                </div>
              </div>

              <textarea
                placeholder="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              />

              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
      <Alert alerts={alerts} onClose={handleAlertClose} />
    </>
  );
};

export default ContactUs;