import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaTasks, FaTools, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Sidebar from '../../components/layout/Sidebar';
import './AssetHome.css';
import Loader from '../../components/common/Loader';
ChartJS.register(ArcElement, Tooltip, Legend);
const StatCard = ({ icon, title, value, link, color, className }) => {
  const navigate = useNavigate();
  return (
    <div className={`stat-card-large ${className}`} onClick={() => navigate(link)}>
      <div className="stat-card-large-icon" style={{ backgroundColor: color }}>{icon}</div>
      <div className="stat-card-large-info">
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );
};
const AssetHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const { user, refreshAuthContext } = useContext(AuthContext);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/asset/dashboard/assets/stats`, { withCredentials: true });
        setStats(response.data.stats);
      } catch (err) {
        setError('Failed to fetch asset statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiUrl, refreshAuthContext]);
  if (loading) {
    return (
      <div className="books-container">
        <Sidebar />
        <main className="books-main-content">
          <Loader />
        </main>
      </div>
    );
  }
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  const chartData = {
    labels: ['Available', 'Assigned', 'Maintenance', 'Retired'],
    datasets: [
      {
        label: 'Asset Status',
        data: [stats.available, stats.assigned, stats.maintenance, stats.retired],
        backgroundColor: [
          'rgba(40, 167, 69, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(220, 53, 69, 0.7)',
          'rgba(108, 117, 125, 0.7)',
        ],
        borderColor: [
          '#28a745',
          '#ffc107',
          '#dc3545',
          '#6c757d',
        ],
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="asset-dashboard-layout">
      <Sidebar />
      <main className="asset-home-container">
        <header className="asset-home-header">
          <div className="header-greeting">
            <h2>Hi, {user?.name || 'Admin'}</h2>
            <p>Here is your asset overview for today.</p>
          </div>
          <div className="header-datetime">
            <p>{dateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h3>{dateTime.toLocaleTimeString('en-US')}</h3>
          </div>
        </header>
        <div className="asset-home-content">
          <div className="asset-stats-grid">
            <StatCard
              className="total-assets-card"
              icon={<FaBox />}
              title="Total Assets"
              value={stats.total}
              link="/assets/list"
              color="#007bff"
            />
            <StatCard
              icon={<FaCheckCircle />}
              title="Available"
              value={stats.available}
              link="/assets/list?status=Available"
              color="#28a745"
            />
            <StatCard
              icon={<FaTasks />}
              title="Assigned"
              value={stats.assigned}
              link="/assets/assignments"
              color="#ffc107"
            />
            <StatCard
              icon={<FaTools />}
              title="Maintenance"
              value={stats.maintenance}
              link="/assets/repairs"
              color="#dc3545"
            />
            <StatCard
              icon={<FaExclamationTriangle />}
              title="Retired"
              value={stats.retired}
              link="/assets/list?status=Retired"
              color="#6c757d"
            />
          </div>
          <div className="asset-chart-container">
            <h3>Asset Status Distribution</h3>
            <div className="chart-wrapper">
              <Pie data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default AssetHome;
