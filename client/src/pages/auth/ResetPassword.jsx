import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';
import KoshLogo from './KoshLogo';

const ResetPassword = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    navigate('/forgot-password');
    return null; 
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsWaiting(true);
    setMessage('');
    setError('');

    try {
      await axios.post(`${apiUrl}/api/v1/auth/verifyForgetpassOTP`, 
        { email, otp: parseInt(otp), password });
      
      setIsWaiting(false);
      setMessage('Your password has been reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setIsWaiting(false);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = (e) => {
    e.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <KoshLogo />
      </div>
      <div className="auth-right">
        <div className="login-static-container">
          <div className="login-heading">Reset Password</div>
          <p className="login-message">Enter the OTP sent to your email and set a new password.</p>
        </div>
        <form className="login-form forget-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              required
              autoFocus
              name="otp"
              id="otp"
              className="form-input"
              placeholder="Enter the OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              inputMode="numeric"
            />
          </div>
          
          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                name="password"
                id="password"
                className="form-input"
                placeholder="Create a new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                name="confirmPassword"
                id="confirmPassword"
                className="form-input"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {error && <p className="error">{error}</p>}
          {message && <p className="message" style={{color: '#16a34a', textAlign: 'center'}}>{message}</p>}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className={`form-button ${isWaiting ? 'wait' : ''}`}
              disabled={isWaiting}
            >
              {isWaiting ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        </form>
        
        <div className="auth-footer">
          <p>Remembered your password? <Link to="/login" className="text-link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
