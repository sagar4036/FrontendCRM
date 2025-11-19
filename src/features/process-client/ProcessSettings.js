import React, { useEffect, useState} from 'react';
import { FaEdit, FaRegCopy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useProcessService } from '../../context/ProcessServiceContext';
const ProcessSetting = () => {
  const [profileImage, setProfileImage] = useState(null);
    
  const{profile,getProfile,handleProfileSettings,profiles}=useProcessService();
   const[loading,setLoading]=useState()
  const [detailsExist, setDetailsExist] = useState(false);
   const[showMessage,setShowMessage]=useState("");
  const navigate = useNavigate();
 const [formData, setFormData] = useState({
  customerId: '',
  dob: '',
  id: '',
  nationality: '',
  passportNumber: '',
  phone: '',
  updatedAt: '',
  createdAt: '',
});
const user = JSON.parse(localStorage.getItem("user"));

const fullName = user?.fullName || " ";
const role=user?.type || "";
const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
useEffect(() => {
  const fetchProfile = async () => {
    setLoading(true);
    const data = await getProfile(); // <- Get response
    setLoading(false);

    if (data && Object.keys(data).length > 0) {
      setFormData({
        customerId: data.customerId || '',
        dob: data.dob || '',
        id: data.id || '',
        nationality: data.nationality || '',
        passportNumber: data.passportNumber || '',
        phone: data.phone || '',
        updatedAt: data.updatedAt || '',
        createdAt: data.createdAt || '',
        profession: data.profession || '',
        location: data.location || '',
        bio: data.bio || '',
        updates: data.updates || false,
        profileView: data.profileView || false,
      });
      setDetailsExist(true);
    } else {
      // New user – clear form
      setFormData({
        customerId: '',
        dob: '',
        id: '',
        nationality: '',
        passportNumber: '',
        phone: '',
        updatedAt: '',
        createdAt: '',
        profession: '',
        location: '',
        bio: '',
        updates: false,
        profileView: false,
      });
      setDetailsExist(false);
    }
  };

  fetchProfile();
}, [getProfile]);

useEffect(() => {
  if (profiles && Object.keys(profiles).length > 0) {
    setFormData({
      customerId: profiles.customerId || '',
      dob: profiles.dob || '',
      id: profiles.id || '',
      nationality: profiles.nationality || '',
      passportNumber: profiles.passportNumber || '',
      phone: profiles.phone || '',
      updatedAt: profiles.updatedAt || '',
      createdAt: profiles.createdAt || '',
      profession: profiles.profession || '',
      location: profiles.location || '',
      bio: profiles.bio || '',
      updates: profiles.updates || false,
      profileView: profiles.profileView || false,
    });
    setDetailsExist(true);
  } else {
    // Ensure no stale data shows up
    setFormData({
      customerId: '',
      dob: '',
      id: '',
      nationality: '',
      passportNumber: '',
      phone: '',
      updatedAt: '',
      createdAt: '',
      profession: '',
      location: '',
      bio: '',
      updates: false,
      profileView: false,
    });
    setDetailsExist(false);
  }
}, [profiles]);

   const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (detailsExist) {
        // Always PUT if detailsExist is true
        await handleProfileSettings(formData);
        setShowMessage(`${capitalizedRole} details updated successfully`);
      } else {
        try {
          await profile(formData);
          setShowMessage(`${capitalizedRole} details created successfully`);
          setDetailsExist(true); // Now mark as exist
        } catch (err) {
          // Check if error is 'Customer details already exist', then switch to PUT
          if (err.error === 'Customer details already exist') {
            await handleProfileSettings(formData);
            setShowMessage(`${capitalizedRole} details updated successfully`);
            setDetailsExist(true);
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.error || err.message || 'Operation failed');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleCopyLink = () => {
    const link = "https://www.portfoliolink.com";
    navigator.clipboard.writeText(link);
    alert("Profile link copied!");
  };
useEffect(() => {
  if (showMessage) {
    const timer = setTimeout(() => {
      setShowMessage("");
    }, 2000); // 3 seconds
    return () => clearTimeout(timer);
  }
}, [showMessage]);
  return (
    <div className="process-settings-container">
          {showMessage && (
  <div className="p-success-message">
    <div className="p-message-box">
      <div className="p-checkmark">
        <svg className="p-circle-animation" viewBox="0 0 52 52">
          <circle className="p-circle" cx="26" cy="26" r="24" fill="none" />
          <polyline className="p-tick" points="14,27 22,35 38,18" />
        </svg>
      </div>
      <h2>Success!</h2>
      <p>{showMessage}</p>
      {/* <button className="p-ok-button" onClick={() => setShowMessage("")}>
        OK
      </button> */}
    </div>
  </div>
)}
      <div className="process-breadcrumb">Home / Settings</div>
      <div className="process-settings-wrapper">
        {/* Sidebar */}
        <div className="process-sidebar">
          <h2 className="process-sidebar-heading">Settings</h2>
          <div className="process-profile-card">
            <div className="process-avatar-wrapper">
              <div className="process-avatar-circle">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <label htmlFor="profile-upload" className="process-edit-icon">
                <FaEdit />
              </label>
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
            <h3 className="process-profile-name">{fullName}</h3>
            <p className="process-profile-title">{capitalizedRole}</p>
            {/* <p className="process-profile-desc">
              Creative designer passionate about clean UI and user experience.
            </p> */}

            <div className="process-link-section">
              <hr className="process-divider" />
              <label>Profile Link</label>
              <div className="process-link-box">
                <input type="text" value="https://www.example.com" readOnly />
                <FaRegCopy className="process-copy-icon" onClick={handleCopyLink} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="process-main-content">
          <div className="process-tab-bar">
            <span className="active">General</span>
              <span onClick={() => navigate("/process/client/create-template")}>Create Template</span>
          
            {localStorage.getItem("userType") === "processperson" ? (
              <span onClick={() => navigate("/process/client/create-client")}>Create Client</span>
            ) : (
              <span>Billings</span>

            )}
          </div>

          <form className="process-settings-form" onSubmit={handleSubmit}>
            <section>
              <h4>Profile</h4>
              <div className="process-row">
                <div className="process-field">
                  <label>Nationality</label>
                 <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="Enter Nationality"
                />
                </div>
                <div className="process-field">
                  <label>Phone</label>
                 <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone"
                  />
                </div>
              </div>
               <div className="process-row">
                 <div className="process-field">
                  <label>DOB</label>
                 <input
                   type="text"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      placeholder="Enter your DOB"
                    />
                </div>
                   <div className="process-field">
                  <label>Passport Number</label>
               <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="Enter Passport Number"
              /></div>
                </div>
              <div className="process-field">
                <label>Profession</label>
                <select name="profession" value={formData.profession} onChange={handleChange}>
                  <option>Select your title</option>
                  <option>UI/UX Designer</option>
                  <option>Developer</option>
                  <option>Manager</option>
                </select>
              </div>

              <div className="process-field">
                <label>Location</label>
                <select name="location" value={formData.location} onChange={handleChange}>
                  <option>Select your location</option>
                  <option>Hyderabad</option>
                  <option>Delhi</option>
                  <option>Bangalore</option>
                </select>
              </div>

              <div className="process-field">
                <label>Bio</label>
                <textarea
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Short bio here"
                />
              </div>

              <h4>Account</h4>
              <div className="process-row">
                <div className="process-field">
                  <label>Email</label>
                  <input
                    type="number"
                    // name="phone"
                    // value={profiles.phone}
                    onChange={handleChange}
                   
                  />
                </div>
                <div className="process-field">
                  <label>Password</label>
                  <input
                    type="number"
                    // name="dob"
                    // value={profiles.dob}
                    onChange={handleChange}
                    placeholder="password"
                  />
                </div>
              </div>

              <h4>Preferences</h4>
              <label className="process-checkbox">
                <input
                  type="checkbox"
                  name="updates"
                  checked={formData.updates}
                  onChange={handleChange}
                />
                Receive monthly product updates
                <span>Get emails about new features and what we’re building.</span>
              </label>

              <label className="process-checkbox">
                <input
                  type="checkbox"
                  name="profileView"
                  checked={formData.profileView}
                  onChange={handleChange}
                />
                Show others when I view their profile
                <span>We’ll let others know when you look at their profile.</span>
              </label>
            </section>

            <button type="submit" className="process-save-btn">Save Information</button>
          </form>
        </div>
      </div>
     {loading && (
  <div className="loader-container">
    <svg className="pl" width="240" height="240" viewBox="0 0 240 240">
      <circle
        className="pl__ring pl__ring--a"
        cx="120"
        cy="120"
        r="105"
        fill="none"
        stroke="#000"
        strokeWidth="20"
        strokeDasharray="0 660"
        strokeDashoffset="-330"
        strokeLinecap="round"
      ></circle>
      <circle
        className="pl__ring pl__ring--b"
        cx="120"
        cy="120"
        r="35"
        fill="none"
        stroke="#000"
        strokeWidth="20"
        strokeDasharray="0 220"
        strokeDashoffset="-110"
        strokeLinecap="round"
      ></circle>
      <circle
        className="pl__ring pl__ring--c"
        cx="85"
        cy="120"
        r="70"
        fill="none"
        stroke="#000"
        strokeWidth="20"
        strokeDasharray="0 440"
        strokeLinecap="round"
      ></circle>
      <circle
        className="pl__ring pl__ring--d"
        cx="155"
        cy="120"
        r="70"
        fill="none"
        stroke="#000"
        strokeWidth="20"
        strokeDasharray="0 440"
        strokeLinecap="round"
      ></circle>
    </svg>
  </div>
)}
    </div>
  );
};

export default ProcessSetting;