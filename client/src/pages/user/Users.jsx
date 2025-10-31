import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUserShield, FaUser, FaEnvelope, FaCalendarAlt, FaIdCard, FaTable, FaThLarge } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import Loader from '../../components/common/Loader';
import './Users.css';
import { GoogleGenAI } from "@google/genai";
const UserCard = ({ user }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();
  const handleProfileClick = (e) => {
    e.stopPropagation();
    navigate(`/user/${user._id}`);
  };
  const cardVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };
  return (
    <motion.div
      className="user-card-container"
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="user-card"
        animate={isFlipped ? 'back' : 'front'}
        variants={cardVariants}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        { }
        <div className="card-face card-front">
          <div className="card-header-bg"></div>
          <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="card-content">
            <h2 className="user-name">{user.name}</h2>
            <p className={`user-role ${user.role}`}>{user.role}</p>
          </div>
        </div>
        { }
        <div className="card-face card-back">
          <h3 className="card-back-title">Details</h3>
          <div className="user-details">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Books Borrowed:</strong> {user.borrowedBooks.length}</p>
          </div>
          <button className="profile-button" onClick={handleProfileClick}>View Profile</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const ai = new GoogleGenAI({ apiKey: "AIzaSyB1T-IrYYueecCAYoAeXyLpZycnlHyFjDk" });
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/user/all`, { withCredentials: true });
        setUsers(response.data.users);
      } catch (err) {
        setError('Failed to fetch users.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [apiUrl]);
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (loading) {
    return (
      <div className="users-layout">
        <Sidebar />
        <main className="users-main-content"><Loader /></main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="users-layout">
        <Sidebar />
        <main className="users-main-content"><div className="error-container">{error}</div></main>
      </div>
    );
  }
  
  return (
    <div className="users-layout">
      <Sidebar />
      <main className="users-main-content">
        <header className="users-header">
          <h1>Manage Users</h1>
          <div className="users-controls">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="view-toggle">
              <button onClick={() => setViewMode('table')} className={viewMode === 'table' ? 'active' : ''}><FaTable /></button>
              <button onClick={() => setViewMode('card')} className={viewMode === 'card' ? 'active' : ''}><FaThLarge /></button>
            </div>
          </div>
        </header>
        {filteredUsers.length > 0 ? (
          viewMode === 'card' ? (
            <div className="users-grid">
              {filteredUsers.map(user => <UserCard key={user._id} user={user} />)}
            </div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className={`role-pill ${user.role}`}>{user.role}</span></td>
                      <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                      <td><button className="table-action-button" onClick={() => navigate(`/user/${user._id}`)}>Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <p className="no-users-found">No users found.</p>
        )}
      </main>
    </div>
  );
};
export default Users;
