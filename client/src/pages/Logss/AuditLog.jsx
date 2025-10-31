import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { NavLink } from 'react-router-dom';
import './AuditLog.css';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchLogs = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/api/audit-logs?page=${page}&limit=${limit}`, {
        withCredentials: true,
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="log-screen">
      <nav className="log-navbar">
        <h1 className="log-title">System Audit Logs</h1>
        <NavLink to="/home" className="home-link">Go Home</NavLink>
      </nav>

      <div className="log-content">
        {loading ? (
          <div className="log-loading">Fetching logs...</div>
        ) : logs.length === 0 ? (
          <div className="log-empty">No logs available.</div>
        ) : (
          <div className="log-lines">
            {logs.map((log, idx) => (
              <div key={idx} className="log-entry">
                <div className="log-header">
                  <span className="log-time">
                    <span className="log-date">{moment(log.timestamp).format('YYYY-MM-DD')}</span>{' '}
                    <span className="log-clock">{moment(log.timestamp).format('HH:mm:ss')}</span>
                  </span>
                  <span className="log-user">{log.performedBy?.name || 'Unknown'}</span>
                </div>
                <div className="log-body">
                  <span className="log-label">Action:</span>
                  <span className="log-value log-action">{log.action}</span>
                </div>
                <div className="log-body">
                  <span className="log-label">Target:</span>
                  <span className="log-value log-target">{log?.target?.role || log?.target?.serialNumber || log?.target?.title || "N/A"} - {log?.target?.employeeId  || log?.target?.assetName || log?.target?.author || 'N/A'} ({log?.target?.name || log?.target?.assetCategory || log?.target?.genre || "N/A"})</span>
                </div>
                <div className="log-divider" />
              </div>
            ))}
          </div>

        )}

        <div className="log-pagination">
          <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
            ◀ Prev
          </button>
          <span>Page {page}</span>
          <button onClick={() => setPage((prev) => prev + 1)} disabled={logs.length < limit}>Next ▶</button>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
