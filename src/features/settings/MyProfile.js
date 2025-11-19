import React, { useState, useEffect, useRef } from "react";
import { useApi } from "../../context/ApiContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import img2 from "../../assets/img3.jpg";

const MyProfile = () => {
  const [editingSections, setEditingSections] = useState({
    header: false,
    personal: false,
    address: false,
  });
  const { fetchSettings, userSettings, updateSettings, setUserSettings } =
    useApi();
  const [profile, setProfile] = useState({});
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchSettings();
      hasFetched.current = true;
    }
  }, [userSettings,fetchSettings]);

  useEffect(() => {
    if (userSettings) {
      const mappedProfile = {
        firstname: userSettings?.user?.firstname
          ? userSettings.user.firstname.trim()
          : "First Name",
        lastname: userSettings?.user?.lastname
          ? userSettings.user.lastname.trim()
          : "",
        username: userSettings?.user?.username
          ? userSettings.user.username.trim()
          : "Not set",
        email: userSettings?.user?.email
          ? userSettings.user.email.trim()
          : "Not set",
        phone: userSettings?.user?.phone
          ? userSettings.user.phone.trim()
          : "Not set",
        profile_picture:
          userSettings.profile_picture || img2,
        city:
          userSettings?.user.city && userSettings?.user.state
            ? `${userSettings.user.city}, ${userSettings.user.state}`
            : userSettings?.user.city
            ? userSettings.user.city
            : userSettings?.user.state
            ? userSettings.user.state
            : "Not set",
        country: userSettings?.user?.country
          ? userSettings.user.country.trim()
          : "Not set",
        postal_code: userSettings?.user?.postal_code
          ? userSettings.user.postal_code.trim()
          : "Not set",
        tax_id: userSettings?.user?.tax_id
          ? userSettings.user.tax_id.trim()
          : "Not set",
        role: userSettings?.user?.role
          ? userSettings.user.role.trim()
          : "No role specified",
      };
      setProfile(mappedProfile);
    }
  }, [userSettings]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSection = (section) => {
    setEditingSections((prev) => {
      const newEditingState = { ...prev, [section]: !prev[section] };
      if (!prev[section]) {
        setProfile({
          firstname: userSettings?.user?.firstname || "",
          lastname: userSettings?.user?.lastname || "",
          username: userSettings?.user?.username || "",
          email: userSettings?.user?.email || "",
          role: userSettings?.user?.role || "",
          phone: userSettings?.user?.phone || "",
          country: userSettings?.user?.country || "",
          tax_id: userSettings?.user?.tax_id || "",
          city: userSettings?.user?.city || "",
          state: userSettings?.user?.state || "",
          postal_code: userSettings?.user?.postal_code || "",
        });
      }
      return newEditingState;
    });
  };

  const isEditing = Object.values(editingSections).some(Boolean);
  const handleSaveAll = async () => {
    try {
      const updated = await updateSettings(profile); // ✅ wait for API call to finish

      if (updated) {
        setUserSettings(updated); // ✅ set updated user from response (not local profile)
      }
      setEditingSections({
        header: false,
        personal: false,
        address: false,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const renderField = (label, name, span = false) => (
    <div
      className="field-group"
      style={span ? { gridColumn: "1 / span 2" } : {}}
    >
      <span className="field-label">{label}</span>
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={profile[name] || ""}
          onChange={handleChange}
          className="field-input"
        />
      ) : (
        <span className="field-value">{profile[name] || "Not Available"}</span>
      )}
    </div>
  );

  const profileStyles = `
    .my-profile {
      padding: 20px;
      max-width: 1500px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      color: #2d3748;
      line-height: 1.6;
      width: 100%;
      overflow-x: hidden;

    }

    .my-profile h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      text-align: center;
    }

    .profile-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  overflow-x: hidden;
}


    .profile-box {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
}


    .profile-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }

    .profile-box:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }

    .profile-box h4 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .profile-box h4::before {
      content: '';
      width: 6px;
      height: 6px;
      background: #667eea;
      border-radius: 50%;
    }

    .edit-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .edit-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .edit-btn:active {
      transform: translateY(0);
    }

    .left {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .profile-image {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #e2e8f0;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      margin-right: 1rem;
    }

    .profile-image:hover {
      border-color: #667eea;
      transform: scale(1.05);
    }

    .profile-header h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
    }

    .profile-header p {
      margin: 0.25rem 0;
      color: #4a5568;
      font-size: 0.875rem;
    }

    .profile-header strong {
      color: #2d3748;
      font-weight: 600;
    }

    .profile-fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field-label {
      font-weight: 600;
      color: #2d3748;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .field-value {
      color: #4a5568;
      font-size: 1rem;
      padding: 0.75rem;
      background: #f7fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      min-height: 20px;
    }

    .field-input {
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .field-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .field-input::placeholder {
      color: #a0aec0;
    }

    .save-btn {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .save-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
    }

    .save-btn:active {
      transform: translateY(0);
    }

    /* Mobile Styles */
    @media (max-width: 768px) {
      .my-profile {
        padding: 1rem;
      }

      .my-profile h2 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .profile-box {
        padding: 1rem;
      }

      .left {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
      }

      .profile-image {
        width: 80px;
        height: 80px;
      }

      .profile-fields {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .field-input {
        padding: 0.625rem;
        font-size: 0.875rem;
      }

      .edit-btn {
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
      }

      .save-btn {
        width: 100%;
        padding: 1rem;
      }

      .profile-box h4 {
        font-size: 1.125rem;
      }
    }

    /* Tablet Styles */
    @media (min-width: 769px) and (max-width: 1024px) {
      .my-profile {
        padding: 1.5rem;
      }

      .profile-fields {
        grid-template-columns: repeat(2, 1fr);
      }

      .left {
        gap: 1.5rem;
      }

      .profile-image {
        width: 90px;
        height: 90px;
      }
    }

    /* Desktop Styles */
    @media (min-width: 1025px) {
      .profile-section {
        gap: 2rem;
      }

      .profile-box {
        padding: 2rem;
      }

      .profile-fields {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }

      .left {
        gap: 2rem;
      }
    }
      @media (min-width: 1220px) and (max-width: 1350px) {
  .profile-fields {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}


    /* Large Desktop Styles */
    @media (min-width: 1200px) {
      .profile-fields {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    /* Animation for section transitions */
    .profile-box {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Enhanced input styles for edit mode */
    .profile-header .field-input {
      margin-bottom: 0.75rem;
      width: 100%;
      max-width: 300px;
    }

    .profile-header .field-input:last-child {
      margin-bottom: 0;
    }

    /* Responsive edit section layout */
    @media (max-width: 768px) {
      .profile-header .field-input {
        max-width: 100%;
      }
    }

    /* Focus states for better accessibility */
    .edit-btn:focus,
    .save-btn:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }

    /* Better spacing for profile info display */
    .profile-header div:not(.left) {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    /* Improved responsive behavior for very small screens */
    @media (max-width: 480px) {
      .my-profile {
        padding: 0.75rem;
      }

      .profile-box {
        padding: 0.75rem;
        margin: 0 -0.25rem;
      }

      .profile-box > div:first-child {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .edit-btn {
        align-self: flex-end;
      }
    }
  `;

  return (
    <>
      <style>{profileStyles}</style>
      <div className="my-profile">
        <h2>My Profile</h2>
        <div className="profile-section">
          {/* Profile Header */}
          <div className="profile-box">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h4>Profile Info</h4>
              <button
                className="edit-btn"
                onClick={() => toggleSection("header")}
              >
                {editingSections.header ? (
                  "Cancel ❌"
                ) : (
                  <>
                    Edit{" "}
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      style={{ marginLeft: "6px" }}
                    />
                  </>
                )}
              </button>
            </div>
            <div className="profile-header">
              <div className="left">
                {editingSections.header ? (
                  <input
                    type="text"
                    name="profileImage"
                    value={profile.profileImage || ""}
                    onChange={handleChange}
                    className="field-input"
                    placeholder="Profile Image URL"
                    style={{ width: "100px", minWidth: "100px" }}
                  />
                ) : (
                  <img
                    src={
                      profile.profileImage || img2
                    }
                    alt="Profile"
                    className="profile-image"
                  />
                )}
                <div>
                  {editingSections.header ? (
                    <>
                      <input
                        type="text"
                        name="firstname"
                        value={profile.firstname || ""}
                        onChange={handleChange}
                        className="field-input"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        name="lastname"
                        value={profile.lastname || ""}
                        onChange={handleChange}
                        className="field-input"
                        placeholder="Last Name"
                      />
                      <input
                        type="text"
                        name="username"
                        value={profile?.username || ""}
                        onChange={handleChange}
                        className="field-input"
                        placeholder="Username"
                      />
                      <input
                        type="text"
                        name="role"
                        value={profile.role || ""}
                        onChange={handleChange}
                        className="field-input"
                        placeholder="Role"
                      />
                      <input
                        type="text"
                        name="city"
                        value={profile.city || ""}
                        onChange={handleChange}
                        className="field-input"
                        placeholder="City"
                      />
                    </>
                  ) : (
                    <>
                      <h3>
                        {userSettings?.user?.firstname || "First Name"}{" "}
                        {userSettings?.user?.lastname || ""}
                      </h3>
                      <p>
                        <strong>Username:</strong>{" "}
                        {userSettings?.user?.username || "Not set"}
                      </p>
                      <p>
                        <strong>Role:</strong>{" "}
                        {userSettings?.user?.role || "No role specified"}
                      </p>
                      <p>
                        <strong>City:</strong>{" "}
                        {userSettings?.user?.city || "Not set"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="profile-box">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h4>Personal Information</h4>
              <button
                className="edit-btn"
                onClick={() => toggleSection("personal")}
              >
                {editingSections.personal ? (
                  "Cancel ❌"
                ) : (
                  <>
                    Edit{" "}
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      style={{ marginLeft: "6px" }}
                    />
                  </>
                )}
              </button>
            </div>
            <div className="profile-fields">
              {renderField("Email Address", "email")}
              {renderField("Phone", "phone")}
            </div>
          </div>

          {/* Address Information */}
          <div className="profile-box">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h4>Address</h4>
              <button
                className="edit-btn"
                onClick={() => toggleSection("address")}
              >
                {editingSections.address ? (
                  "Cancel ❌"
                ) : (
                  <>
                    Edit{" "}
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      style={{ marginLeft: "6px" }}
                    />
                  </>
                )}
              </button>
            </div>
            <div className="profile-fields">
              {renderField("Country", "country")}
              {renderField("City/State", "city")}
              {renderField("Postal Code", "postal_code")}
              {renderField("TAX ID", "tax_id")}
            </div>
          </div>

          {/* Save Button at the Bottom */}
          {isEditing && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button className="save-btn" onClick={handleSaveAll}>
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyProfile;

