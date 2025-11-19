import React, { useState } from 'react';
import {
  FaBuilding,
  FaDatabase,
  FaLink,
  FaUser,
  FaLock,
  FaHashtag
} from 'react-icons/fa';
import { useCompany } from '../../context/CompanyContext'; 
import '../../styles/masterdash.css';

const AddCompanyModal = ({ onClose, onCreated }) => {
  const { addCompany } = useCompany(); 
  const [formData, setFormData] = useState({
    name: '',
    db_name: '',
    db_host: '',
    db_user: '',
    db_password: '',
    db_port: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCompany(formData);  
      onCreated();                 
      onClose();                  
    } catch (err) {
      console.error('Company creation failed:', err);
      alert(err.error || 'Failed to create company');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content refined-modal">
        <h2 className="modal-title">Create Company</h2>
        <p className="modal-subtitle">Fill out the form to create a new company.</p>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="m-form-group">
            <FaBuilding className="icon" />
            <input name="name" placeholder="Company Name" onChange={handleChange} required />
          </div>
          <div className="m-form-group">
            <FaDatabase className="icon" />
            <input name="db_name" placeholder="Database Name" onChange={handleChange} required />
          </div>
          <div className="m-form-group">
            <FaLink className="icon" />
            <input name="db_host" placeholder="Host" onChange={handleChange} required />
          </div>
          <div className="m-form-group">
            <FaUser className="icon" />
            <input name="db_user" placeholder="Database User" onChange={handleChange} required />
          </div>
          <div className="m-form-group">
            <FaLock className="icon" />
            <input type="password" name="db_password" placeholder="Password" onChange={handleChange} required />
          </div>
          <div className="m-form-group">
            <FaHashtag className="icon" />
            <input name="db_port" placeholder="Port" onChange={handleChange} required />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="create-btn-m">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyModal;
