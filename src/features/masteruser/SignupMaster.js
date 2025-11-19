// src/components/SignupMaster.js
import React, { useState } from 'react';
import '../../styles/masterlogin.css';
import { Link, useNavigate } from 'react-router-dom';
import { useMaster } from '../../context/MasterContext';

const SignupMaster = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { signup } = useMaster();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form); // Call context signup
      navigate('/master/loginmaster'); // redirect to login
    } catch (err) {
      console.error('Signup failed:', err);
      alert(err.error || 'Signup failed');
    }
  };

  return (
    <div className="auth-wrapper updated-ui">
      <div className="auth-box new-ui-card">
        <h2 className="auth-title">Sign up</h2>
        <p className="subtitle">Join the community today!</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="submit-btn wide-btn">Sign up</button>
        </form>

        <p className="footer-text">
          Already a member? <Link to="/master/loginmaster">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupMaster;
