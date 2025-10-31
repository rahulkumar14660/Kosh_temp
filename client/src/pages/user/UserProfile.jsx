import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/layout/Sidebar';
import Loader from '../../components/common/Loader';
import './UserProfile.css';
import { FaUserShield, FaUser, FaEnvelope, FaCalendarAlt, FaIdCard, FaBuilding, FaBriefcase, FaCheckCircle, FaClock, FaArrowLeft } from 'react-icons/fa';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/user/all/${id}`, { withCredentials: true });
        setUser(response.data.user);
      } catch (err) {
        setError('Failed to fetch user details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, apiUrl]);

  if (loading) {
    return (
      <div className="user-profile-layout">
        <Sidebar />
        <main className="user-profile-main"><Loader /></main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-layout">
        <Sidebar />
        <main className="user-profile-main"><div className="error-container">{error}</div></main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="user-profile-layout">
      <Sidebar />
      <main className="user-profile-main">
        <div className="profile-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="profile-avatar">
            {user?.url ? <img src={user.url} alt="User Avatar" /> : <div className="avatar-fallback">{user?.name?.[0]?.toUpperCase() || "U"}</div>}
          </div>
          <div className="profile-info">
            <h1>{user?.name || "N/A"}</h1>
            <p className={`role-tag ${user?.role}`}>{user?.role || "N/A"}</p>
          </div>
        </div>
        <div className="profile-details-grid">
          <div className="detail-card">
            <h4><FaBriefcase /> Professional Details</h4>
            <div className="card-content">
              <p><span className="detail-label">Department:</span><span className="detail-value">{user?.department || "N/A"}</span></p>
              <p><span className="detail-label">Designation:</span><span className="detail-value">{user?.designation || "N/A"}</span></p>
            </div>
          </div>
          <div className="detail-card">
            <h4><FaUserShield /> Account Status</h4>
            <div className="card-content">
              <p><span className="detail-label">Email:</span><span className="detail-value">{user?.email || "N/A"}</span></p>
              <p><span className="detail-label">Account Verified:</span><span className="detail-value"><span className={user?.accountVerified ? 'status-verified' : 'status-not-verified'}>{user?.accountVerified ? 'Yes' : 'No'}</span></span></p>
            </div>
          </div>
          <div className="detail-card full-width">
            <h4><FaClock /> Activity Timeline</h4>
            <div className="card-content">
              <p><span className="detail-label"><FaCalendarAlt /> Joined On:</span><span className="detail-value">{new Date(user?.createdAt).toLocaleString('en-IN')}</span></p>
              <p><span className="detail-label"><FaCalendarAlt /> Last Updated:</span><span className="detail-value">{new Date(user?.updatedAt).toLocaleString('en-IN')}</span></p>
              <p><span className="detail-label"><FaIdCard /> Total Books Borrowed:</span><span className="detail-value">{user?.borrowedBooks?.length || 0}</span></p>
              <p><span className="detail-label"><FaIdCard /> Assets Assigned Currently :</span><span className="detail-value">{user?.assignedAssets?.filter(asset => asset?.returned === false).length || 0}</span></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
