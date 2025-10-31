import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Sidebar from '../../components/layout/Sidebar';
import Loader from '../../components/common/Loader';
import { AuthContext } from '../../context/AuthContext';
import '../user/Books.css'; 
const RepairLog = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { refreshAuthContext } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchRepairLog = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/asset/repairs`, { withCredentials: true });
        setLogs(response.data.data.repairLogs.reverse());
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch repair logs.');
      }
      setLoading(false);
    };
    fetchRepairLog();
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
  return (
    <div className="books-container">
      <Sidebar />
      <main className="books-main-content">
        <header className="books-header">
          <h2>Asset Repair Log</h2>
        </header>
        {error && <p className="error">{error}</p>}
        <section className="timeline-section">
          {logs.length > 0 ? (
            <div className="timeline">
              {logs.map(log => (
                <div key={log._id} className={`timeline-item status-${log.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4 className="asset-name">{log?.assetId?.assetName}</h4>
                      <span className={`status-badge status-${log.status.toLowerCase()}`}>{log.status}</span>
                    </div>
                    <p className="serial-number">S/N: {log?.assetId?.serialNumber}</p>
                    <p className="problem-description"><strong>Remarks:</strong> {log?.remarks}</p>
                    <div className="timeline-footer">
                      <span>Created: {new Date(log?.createdAt).toLocaleDateString('en-IN')}</span>
                      {log?.handledBy && <span>Handled By: {log?.handledBy?.name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-assignments-message">No repair logs found.</p>
          )}
        </section>
      </main>
    </div>
  );
};
export default RepairLog;
