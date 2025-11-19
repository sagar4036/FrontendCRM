import React, { useState, useEffect, useRef } from "react";
import "../../styles/adminsettings.css";
import SidebarToggle from "../admin/SidebarToggle";
import PageAccessControl from "../admin-settings/PageAccessControl";
import { useApi } from "../../context/ApiContext";
import { useLoading } from "../../context/LoadingContext";
import AdminSpinner from "../spinner/AdminSpinner";
import { Alert, soundManager } from "../modal/alert";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const TLSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { showLoader, hideLoader, isLoading, variant } = useLoading();
  const { getAllProfile, handleUpdateUserProfile, isUserProfileUpdating ,isPasswordUpdating , handleChangePassword} = useApi();
  const hasLoaded = useRef(false);
  const [alerts, setAlerts] = useState([]); 

  const [tlProfile, setTlProfile] = useState({
    id: "",
    username: "",
    email: "",
    profile_picture: "",
    firstname: "",
    lastname: "",
    country: "",
    city: "",
    state: "",
    postal_code: "",
    role: "",
    tax_id: "",
  });

  useEffect(() => {
    const handleSidebarToggle = () => {
      const expanded = localStorage.getItem("adminSidebarExpanded") !== "false";
      document.body.classList.toggle("sidebar-collapsed", !expanded);
      document.body.classList.toggle("sidebar-expanded", expanded);
    };

    handleSidebarToggle();
    window.addEventListener("sidebarToggle", handleSidebarToggle);

    const init = async () => {
      if (hasLoaded.current) return;
      hasLoaded.current = true;

      try {
        showLoader("Loading TL profile...", "admin");
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (!currentUser?.id) throw new Error("No TL ID found");

        // Fetch all profiles using getAllProfile
        const profiles = await getAllProfile();
        
        // Filter for the user with role "TL" and matching ID
        const tlData = profiles.find(
          (profile) => profile.role === "TL" && profile.id === currentUser.id
        );

        if (!tlData) throw new Error("No TL profile found");

        setTlProfile({
          id: tlData.id || "",
          username: tlData.username || "",
          email: tlData.email || "",
          profile_picture: tlData.profile_picture || "",
          firstname: tlData.firstname || "",
          lastname: tlData.lastname || "",
          country: tlData.country || "",
          city: tlData.city || "",
          state: tlData.state || "",
          postal_code: tlData.postal_code || "",
          role: tlData.role || "",
          tax_id: tlData.tax_id || "",
        });
      } catch (err) {
        console.error("Failed to load TL profile:", err);
        setAlerts([
          ...alerts,
          {
            id: Date.now(),
            type: "error",
            title: "Load Failed",
            message: "Failed to load TL profile.",
            duration: 5000,
          },
        ]);
        soundManager.playSound("error");
      } finally {
        hideLoader();
      }
    };

    init();

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
    };
  }, [getAllProfile, showLoader, hideLoader,alerts]);

  // Handle alert close
  const handleAlertClose = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!tlProfile.username || !tlProfile.email || !tlProfile.firstname || !tlProfile.lastname) {
      setAlerts([
        ...alerts,
        {
          id: Date.now(),
          type: "warning",
          title: "Missing Required Fields",
          message: "Please fill in all required fields (Username, Email, First Name, Last Name)",
          duration: 5000,
        },
      ]);
      soundManager.playSound("warning");
      return;
    }

    try {
      showLoader("Updating profile...", "admin");

      const updateData = {
        username: tlProfile.username,
        email: tlProfile.email,
        profile_picture: tlProfile.profile_picture,
        firstname: tlProfile.firstname,
        lastname: tlProfile.lastname,
        country: tlProfile.country,
        city: tlProfile.city,
        state: tlProfile.state,
        postal_code: tlProfile.postal_code,
        tax_id: tlProfile.tax_id,
      };

      console.log("Updating profile with data:", updateData);
      console.log("User ID:", tlProfile.id);

      // Use handleUpdateUserProfile from ApiContext
      const result = await handleUpdateUserProfile(tlProfile.id, updateData);
      
      console.log("Update result:", result);
      setAlerts([
        ...alerts,
        {
          id: Date.now(),
          type: "success",
          title: "Profile Updated",
          message: "TL profile updated successfully!",
          duration: 5000,
        },
      ]);
      soundManager.playSound("success");

      // Update local state with the returned data
      if (result.user) {
        setTlProfile((prevProfile) => ({
          ...prevProfile,
          ...result.user,
        }));
      }
    } catch (err) {
      console.error("Update failed:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update TL profile";
      setAlerts([
        ...alerts,
        {
          id: Date.now(),
          type: "error",
          title: "Update Failed",
          message: `Update failed: ${errorMessage}`,
          duration: 5000,
        },
      ]);
      soundManager.playSound("error");
    } finally {
      hideLoader();
    }
  };

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "password", label: "Password" },
    { key: "pageAccess", label: "Page Access Controller" },
    { key: "team", label: "Team" },
    { key: "plan", label: "Plan" },
    { key: "billing", label: "Billing" },
    { key: "integrations", label: "Integrations" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "pageAccess":
        return <PageAccessControl />;
      case "plan":
        return (
          <div className="blur-overlay-wrapper">
            <div className="section-block">
              <h3>Current Plan</h3>
              <p>
                You are on the <strong>Pro</strong> plan. Next billing: <strong>May 10, 2025</strong>
              </p>
              <button className="primary-btn">Upgrade Plan</button>
            </div>
          </div>
        );
      case "billing":
        return (
          <div className="blur-overlay-wrapper">
            <div className="section-block">
              <h3>Billing History</h3>
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>April 10</td>
                    <td>$49</td>
                    <td>Paid</td>
                    <td><button className="mini-btn">Download</button></td>
                  </tr>
                  <tr>
                    <td>March 10</td>
                    <td>$49</td>
                    <td>Paid</td>
                    <td><button className="mini-btn">Download</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "team":
        return (
          <div className="blur-overlay-wrapper">
            <div className="section-block">
              <h3>Team Members</h3>
              <ul className="team-list">
                {[
                  { id: 1, name: "Sakshi Verma", email: "sakshi@example.com", role: "Executive" },
                  { id: 2, name: "Rohan Malhotra", email: "rohan@example.com", role: "Manager" },
                  { id: 3, name: "Neha Sinha", email: "neha@example.com", role: "Admin" },
                ].map((member) => (
                  <li key={member.id}>
                    <span><strong>ID:</strong> {member.id}</span>
                    <span><strong>Name:</strong> {member.name}</span>
                    <span><strong>Email:</strong> {member.email}</span>
                    <span><strong>Role:</strong> {member.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "integrations":
        return (
          <div className="blur-overlay-wrapper">
            <div className="section-block">
              <h3>Connected Apps</h3>
              <ul className="integration-list">
                <li>Slack <button className="mini-btn">Disconnect</button></li>
                <li>Google Drive <button className="mini-btn">Disconnect</button></li>
                <li>Connect new <button className="mini-btn">Add Integration</button></li>
              </ul>
            </div>
          </div>
        );
      case "password":
        return (
          <>
            <h3>Change Password</h3>
            <form
              className="profile-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const currentPassword = e.target.currentPassword.value;
                const newPassword = e.target.newPassword.value;
                const confirmPassword = e.target.confirmPassword.value;

                if (newPassword !== confirmPassword) {
                  setAlerts([
                    ...alerts,
                    {
                      id: Date.now(),
                      type: "warning",
                      title: "Password Mismatch",
                      message: "New password and confirm password do not match.",
                      duration: 5000,
                    },
                  ]);
                  soundManager.playSound("warning");
                  return;
                }

                try {
                  await handleChangePassword(currentPassword, newPassword); // Use the generic function
                  setAlerts([
                    ...alerts,
                    {
                      id: Date.now(),
                      type: "success",
                      title: "Password Updated",
                      message: "Password updated successfully!",
                      duration: 5000,
                    },
                  ]);
                  soundManager.playSound("success");
                } catch (err) {
                  setAlerts([
                    ...alerts,
                    {
                      id: Date.now(),
                      type: "error",
                      title: "Password Update Failed",
                      message: err.message || "Something went wrong.",
                      duration: 5000,
                    },
                  ]);
                  soundManager.playSound("error");
                }
              }}
            >
              <div className="form-group full">
                <label>Current Password</label>
                <input name="currentPassword" type="password" placeholder="••••••••" required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>New Password</label>
                  <input name="newPassword" type="password" placeholder="New password" required />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input name="confirmPassword" type="password" placeholder="Confirm password" required />
                </div>
              </div>
              <div className="form-group full save-btn-wrapper">
                <button className="save-btn" type="submit" disabled={isPasswordUpdating}>
                  {isPasswordUpdating ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </>
        );
      case "profile":
      default:
        return (
          <>
            <h3>Profile</h3>
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="form-group full profile-pic">
                <label>Your Photo</label>
                <div className="pic-wrapper">
                <AccountCircleIcon style={{width:"80px", height:"80px"}} />
                  <div className="pic-actions">
                    <button type="button">Delete</button>
                    <button type="button">Update</button>
                  </div>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={tlProfile.firstname}
                    onChange={(e) => setTlProfile({ ...tlProfile, firstname: e.target.value })}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={tlProfile.lastname}
                    onChange={(e) => setTlProfile({ ...tlProfile, lastname: e.target.value })}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={tlProfile.email}
                    onChange={(e) => setTlProfile({ ...tlProfile, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={tlProfile.username}
                    onChange={(e) => setTlProfile({ ...tlProfile, username: e.target.value })}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" value={tlProfile.role} readOnly />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={tlProfile.country}
                    onChange={(e) => setTlProfile({ ...tlProfile, country: e.target.value })}
                    placeholder="Enter country"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={tlProfile.city}
                    onChange={(e) => setTlProfile({ ...tlProfile, city: e.target.value })}
                    placeholder="Enter city"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={tlProfile.state}
                    onChange={(e) => setTlProfile({ ...tlProfile, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={tlProfile.postal_code}
                    onChange={(e) => setTlProfile({ ...tlProfile, postal_code: e.target.value })}
                    placeholder="Enter postal code"
                  />
                </div>
                <div className="form-group">
                  <label>Tax ID</label>
                  <input
                    type="text"
                    value={tlProfile.tax_id}
                    onChange={(e) => setTlProfile({ ...tlProfile, tax_id: e.target.value })}
                    placeholder="Enter tax ID"
                  />
                </div>
                <div className="form-group">
                  <label>Profile Picture URL</label>
                  <input
                    type="url"
                    value={tlProfile.profile_picture}
                    onChange={(e) => setTlProfile({ ...tlProfile, profile_picture: e.target.value })}
                    placeholder="Enter profile picture URL"
                  />
                </div>
              </div>
              <div className="form-group full save-btn-wrapper">
                <button className="save-btn" type="submit" disabled={isLoading || isUserProfileUpdating}>
                  {isLoading || isUserProfileUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </>
        );
    }
  };

  return (
    <div className="admin-settings">
      <SidebarToggle />
      {(isLoading || isUserProfileUpdating) && variant === "admin" && (
        <AdminSpinner text="Loading Settings..." />
      )}
      <div className="settings-header">
        <h2>TL Settings</h2>
      </div>
      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="settings-card">{renderTabContent()}</div>
      <Alert alerts={alerts} onClose={handleAlertClose} />
    </div>
  );
};

export default TLSettings;