import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import './Login.css';
import KoshLogo from './KoshLogo';

const ForgotPassword = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsWaiting(true);
    setMessage('');
    setError('');

    try {
      await axios.post(`${apiUrl}/api/v1/auth/request-password-reset`, { email });
      setIsWaiting(false);
      setMessage('If an account exists with this email, a password reset OTP has been sent.');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setIsWaiting(false);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      if (err.response?.data?.message === 'An OTP has already been sent. Please check your email.') {
        navigate('/reset-password', { state: { email } });
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1 className="branding-logo"><KoshLogo /></h1>
      </div>
      <div className="auth-right">
        <div className="auth-content-wrapper">
          <div className="login-static-container">
            <div className="login-heading">Forgot Password?</div>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                required
                autoFocus
                name="email"
                id="email"
                className="form-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {error && <p className="error">{error}</p>}
            {message && <p className="message" style={{color: '#16a34a', textAlign: 'center'}}>{message}</p>}
            
            <div className="form-actions">
              <button 
                type="submit" 
                className={`form-button ${isWaiting ? 'wait' : ''}`}
                disabled={isWaiting}
              >
                {isWaiting ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          </form>
          <div className="auth-footer">
            <p className='remember-password'>
            <NavLink to="/login" className="text-link">Remember your password? Sign In</NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
