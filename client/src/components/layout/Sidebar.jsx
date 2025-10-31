import React, { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { SystemContext } from "../../context/SystemContext";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { FaHome, FaBook, FaClipboardList, FaUsers, FaUserPlus, FaBox, FaTasks, FaTools, FaSignOutAlt, FaKey, FaTachometerAlt, FaLandmark } from 'react-icons/fa';
import ConfirmationModal from '../common/ConfirmationModal';
import axios from "axios";
import KoshLogo from "../../pages/auth/KoshLogo";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useContext(AuthContext);
  const { system, setSystem } = useContext(SystemContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (location.pathname.startsWith('/assets') || location.pathname.startsWith('/my-assets')) {
      setSystem('asset');
    } else if (
      location.pathname.startsWith('/home') ||
      location.pathname.startsWith('/books') ||
      location.pathname.startsWith('/catalog') ||
      location.pathname.startsWith('/users')
    ) {
      setSystem('library');
    }
    
  }, [location.pathname, setSystem]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const libraryLinks = (
    <>
      <li>
        <NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <span><FaHome /></span>
          <span>Home</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <span><FaHome /></span>
          <span>Dashboard</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/books" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <span><FaBook /></span>
          <span>Books</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/catalog" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <span><FaClipboardList /></span>
          <span>Catalog</span>
        </NavLink>
      </li>
      {isAdmin(user, ["Admin", "Librarian"]) && (
        <li>
          <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span><FaUsers /></span>
            <span>Users</span>
          </NavLink>
        </li>
      )}
    </>
  );

  const assetLinks = (
    <>
      <li>
        <NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <span><FaHome /></span>
          <span>Home</span>
        </NavLink>
      </li>
      {isAdmin(user, ["Admin", "Asset Manager"]) ? (
        <>
          <li>
            <NavLink to="/assets/home" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span><FaTachometerAlt /></span>
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/assets/list" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span><FaBox /></span>
              <span>Asset List</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/assets/assignments" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span><FaTasks /></span>
              <span>Assignment Log</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/assets/repairs" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span><FaTools /></span>
              <span>Repair Log</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/assets/users" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span><FaUsers /></span>
              <span>Users</span>
            </NavLink>
          </li>
        </>
      ) : (
        <li>
          <NavLink to="/my-assets" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span><FaBox /></span>
            <span>My Assets</span>
          </NavLink>
        </li>
      )}
    </>
  );

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <FaLandmark />

          <h1>{system === 'library' ? 'LIBRARY' : 'ASSETS'}</h1>
        </div>
        <nav>
          <ul className="nav-list">
            {system === 'asset' ? assetLinks : libraryLinks}
          </ul>
        </nav>
      </div>

      <div className="user-profile-container" ref={profileRef}>
        {isProfileOpen && (
          <div className="profile-dropdown">
            <NavLink to={`/user/${user?.id}`} className="dropdown-item">
              <FaUserPlus /> Profile
            </NavLink>
            <NavLink to="/change-password" className="dropdown-item">
              <FaKey /> Change Password
            </NavLink>
            <button onClick={() => setLogoutModalOpen(true)} className="dropdown-item logout-button">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        )}
        <div
          className="user-profile"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <div className="user-avatar-initials">{user?.name.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <p className="user-name-sidebar">{user?.name}</p>
            <p className="user-role-sidebar">{user?.role}</p>
          </div>
          <svg className={`chevron-icon ${isProfileOpen ? 'open' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
      />
    </aside>
  );
};

export default Sidebar;
