import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaLaptopCode, FaUserTie, FaArrowRight, FaSignOutAlt, FaLinux } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { SystemContext } from '../../context/SystemContext';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { isAdmin, user, logout } = useContext(AuthContext);
  const { setSystem } = useContext(SystemContext);
  const navigate = useNavigate();

  const assetText = isAdmin(user, ["Admin", "Asset Manager"] ) ? "Manage Assets" : "My Assets";
  const employeeText = isAdmin(user, ["Admin", "HR"] ) ? "Manage Employees" : "My Employee";
  const libraryText = isAdmin(user, ["Admin", "Librarian"] ) ? "Manage Library" : "My Library";
  const assetDesc = isAdmin(user, ["Admin", "Asset Manager"] ) ? "Manage assets, assignments, and repairs." : "View your assigned assets.";
  const employeeDesc = isAdmin(user, ["Admin", "HR"] ) ? "Manage employees, departments, and HR functions." : "View your employee records.";
  const libraryDesc = isAdmin(user, ["Admin", "Librarian"] ) ? "Manage books, members, and borrowings." : "View your library records.";
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return 'Good morning';
    } else if (currentHour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      <div className="shape shape-3"></div>
      
      <main className="homepage-main-content">
        <header className="homepage-header">
          <h1>
            {getGreeting()}, <span className="user-name-gradient">{user?.name?.split(" ")[0][0].toUpperCase()+user?.name?.split(" ")[0].slice(1) || 'Guest'}!</span>
          </h1>
          <p>Your enterprise resource hub. Please select a system to continue.</p>
        </header>

        <div className="system-selection-container">
          <Link to="/dashboard" className="system-card library-card" onClick={() => setSystem('library')}>
            <FaBook className="card-bg-icon" />
            <h2>{libraryText}</h2>
            <p>{libraryDesc}</p>
            <div className="card-arrow">
              <FaArrowRight />
            </div>
          </Link>

          <Link to={isAdmin(user, ["Admin", "Asset Manager"] ) ? "/assets/home" : "/my-assets"} className="system-card asset-card" onClick={() => setSystem('asset')}>
            <FaLaptopCode className="card-bg-icon" />
            <h2>{assetText}</h2>
            <p>{assetDesc}</p>
            <div className="card-arrow">
              <FaArrowRight />
            </div>
          </Link>

          {isAdmin(user, ["Admin", "HR"] ) && (
            <Link to="/employees" className="system-card employee-card" onClick={() => setSystem('employee')}>
              <FaUserTie className="card-bg-icon" />
              <h2>{employeeText}</h2>
              <p>{employeeDesc}</p>
              <div className="card-arrow">
                <FaArrowRight />
              </div>
            </Link>
          )}
          {isAdmin(user, ["Admin"] ) && (
            <Link to="/logs" className="system-card audit-logs-card" onClick={() => setSystem('employee')}>
              <FaLinux className="card-bg-icon" />
              <h2>Audit Logs</h2>
              <p>View system audit logs</p>
              <div className="card-arrow">
                <FaArrowRight />
              </div>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;