import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // ✅ Import location hook

const CreateClient = () => {
  const location = useLocation(); // ✅ Read navigation state
  const selectedClient = location.state?.client;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    last_contacted: '',
    status: '',
  });

  // ✅ Autofill form if selected client exists
  useEffect(() => {
    if (selectedClient) {
      setFormData({
        name: selectedClient.name || '',
        email: selectedClient.email || '',
        phone: selectedClient.phone || '',
        country: selectedClient.country || '',
        last_contacted: selectedClient.last_contacted
          ? selectedClient.last_contacted.split('T')[0]
          : '',
        status: selectedClient.status || 'Converted',
      });
    }
  }, [selectedClient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      alert("Client created successfully!");
    } catch (err) {
      console.error("Create client error:", err);
      alert("Failed to create client.");
    }
  };

  return (
    <div className="process-settings-container">
      <div className="process-breadcrumb">Home / Create Client</div>
      <form className="process-settings-form" onSubmit={handleSubmit}>
        <h4>Create New Client</h4>

        <div className="process-row">
          <div className="process-field">
            <label>Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Full Name"
            />
          </div>
          <div className="process-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
            />
          </div>
        </div>

        <div className="process-row">
          <div className="process-field">
            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </div>
          <div className="process-field">
            <label>Country</label>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
            />
          </div>
        </div>

        <div className="process-row">
          <div className="process-field">
            <label>Last Contacted</label>
            <input
              type="date"
              name="last_contacted"
              value={formData.last_contacted}
              onChange={handleChange}
            />
          </div>
          <div className="process-field">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="">Select Status</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        <button className="process-save-btn" type="submit">Create Client</button>
      </form>
    </div>
  );
};

export default CreateClient;
