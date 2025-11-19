// src/components/LoginMaster.js
import React, { useState } from 'react';
import '../../styles/masterlogin.css';
import { Link, useNavigate } from 'react-router-dom';
import { useMaster } from '../../context/MasterContext';

const LoginMaster = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useMaster();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form); // Call context login
      navigate('/master/dashboard'); // ✅ correct
    } catch (err) {
      console.error('Login failed:', err);
      alert(err.error || 'Login failed');
    }
  };

  return (
    <div className="auth-wrapper updated-ui">
      <div className="auth-box new-ui-card">
        <h2 className="auth-title">Sign in</h2>
        <p className="subtitle">Welcome back! Please login.</p>

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
          <button type="submit" className="submit-btn wide-btn">Login</button>
        </form>

        <p className="footer-text">
          Don’t have an account? <Link to="/master/signupmaster">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginMaster;
