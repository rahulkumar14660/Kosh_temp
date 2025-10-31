import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import './MyAssets.css';
import Loader from '../../components/common/Loader';
const MyAssets = () => {
  const [assignments, setAssignments] = useState([]);
  const [returnedAssets, setReturnedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('current'); 
  const { user } = useContext(AuthContext);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const currentRes = await axios.get(`${apiUrl}/api/v1/assignAsset/my-assignments`, { withCredentials: true });
        const currentAssignments = currentRes.data.data.filter(a => a.status === 'Assigned');
        setAssignments(currentAssignments);
        const returnedRes = await axios.get(`${apiUrl}/api/v1/assignAsset/my-returned-assets`, { withCredentials: true });
        setReturnedAssets(returnedRes.data.data);
      } catch (err) {
        setError('Failed to fetch assets.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchAssets();
    }
  }, [user, apiUrl]);
  return (
    <div className="my-assets-layout">
      <Sidebar />
      <main className="my-assets-main-content"> 
        {loading && <p>Loading...</p>}
        <header className="my-assets-header">
          <h2>My Assets</h2>
        </header>
        <div className="tabs-container">
          <button 
            className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Currently Assigned
          </button>
          <button 
            className={`tab-button ${activeTab === 'returned' ? 'active' : ''}`}
            onClick={() => setActiveTab('returned')}
          >
            Asset History
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
        {activeTab === 'current' && (
          assignments.length > 0 ? (
            <div className="assets-list-vertical">
              {assignments.map(({ assetId: asset, assignedDate }) => (
                <div key={asset._id} className="asset-card-vertical">
                  <div className="asset-card-header">
                    <h3>{asset.assetName}</h3>
                    <span className={`status-badge assigned`}>Assigned</span>
                  </div>
                  <div className="asset-card-body">
                    <p><strong>Serial Number:</strong> {asset.serialNumber}</p>
                    <p><strong>Category:</strong> {asset.assetCategory}</p>
                    <p><strong>Assigned On:</strong> {new Date(assignedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="asset-card-footer">
                    <p>{asset.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-assets-message">
              <p>You currently have no assets assigned to you.</p>
            </div>
          )
        )}
        {activeTab === 'returned' && (
          returnedAssets.length > 0 ? (
            <div className="assets-list-vertical">
              {returnedAssets.map(({ assetId: asset, assignedDate, actualReturnDate }) => (
                <div key={asset._id} className="asset-card-vertical returned">
                  <div className="asset-card-header">
                    <h3>{asset.assetName}</h3>
                    <span className={`status-badge returned`}>Returned</span>
                  </div>
                  <div className="asset-card-body">
                    <p><strong>Serial Number:</strong> {asset.serialNumber}</p>
                    <p><strong>Assigned On:</strong> {new Date(assignedDate).toLocaleDateString()}</p>
                    <p><strong>Returned On:</strong> {new Date(actualReturnDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-assets-message">
              <p>User has no returned assets in their history.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
};
export default MyAssets;
