import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import '../user/Books.css';
import './Assignments.css';
import Loader from '../../components/common/Loader';
import AssignmentDetailsModal from '../../components/common/AssignmentDetailsModal';
import { FaCalendarAlt, FaBoxOpen, FaUserAlt, FaUser } from 'react-icons/fa';


const getInitials = (name) => {
  if (!name) return '??';
  const nameParts = name.trim().split(/\s+/);
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
};

const Assignments = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { refreshAuthContext } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState(assignments);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, [refreshAuthContext]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = assignments.filter(item => {
      return (
        item?.assetId?.assetName?.toLowerCase().includes(lowercasedFilter) ||
        item?.assetId?.serialNumber?.toLowerCase().includes(lowercasedFilter) ||
        item?.userId?.name?.toLowerCase().includes(lowercasedFilter) || 
        item?.userId?.email?.toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredAssignments(filteredData);
  }, [searchTerm, assignments]);

  const fetchAssignments = () => {
    setLoading(true);
    axios.get(`${apiUrl}/api/v1/assignAsset/getAllAssignments`, { withCredentials: true })
      .then(res => {
        setAssignments(res?.data?.assignments || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching assignments:", err);
        setError('Failed to fetch assignments.');
        setLoading(false);
      });
  };

  const handleReturnAsset = (serialNumber) => {
    axios.post(`${apiUrl}/api/v1/assignAsset/recordAssetReturn/${serialNumber}`, {}, { withCredentials: true })
      .then(res => {
        fetchAssignments();
        setShowDetailsModal(false);
      })
      .catch(err => {
        console.error("Error returning asset:", err);
        setError(err.response?.data?.message || 'Failed to return asset.');
      });
  };

  const handleShowDetailsModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
  };

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
          <h2>Asset Assignments</h2>
          <div className="controls">
            <input
              type="text"
              placeholder="Search by Asset Name or S/No.."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>
        {error && <p className="error">{error}</p>}
        <section className="assignments-timeline-section">
          {filteredAssignments.length > 0 ? (
            <div className="assignments-timeline">
              {filteredAssignments.reverse().map((item, index) => {
                const status = item.returned;
                const statusClass = ((status=="Returned") ? 'returned' : 'assigned');
                
                return (
                  <div 
                    key={item._id} 
                    className={`assignment-timeline-item assignment-status-${statusClass}`}
                    onClick={() => handleShowDetailsModal(item)}
                  >
                    <div className="assignment-timeline-dot">
                      {status=="Returned" ? (
                        <FaBoxOpen className="assignment-timeline-icon" />
                      ) : (
                        <span className="assignment-user-initials">
                          {getInitials(item.userId?.name)}
                        </span>
                      )}
                    </div>
                    <div className="assignment-timeline-content">
                      <div className="assignment-timeline-header">
                        <h4 className="assignment-asset-name">{item.assetId?.assetName || 'Unknown Asset'}</h4>
                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="assignment-serial-number">S/N: {item.assetId?.serialNumber || 'N/A'}</p>
                      <div className="assignment-details">
                        <p>
                          <FaUser className="assignment-detail-icon" />
                          <span className="assignment-detail-label">Assigned To:</span>
                          <span className="assignment-detail-value">{item.userId?.name || 'Unassigned'}</span>
                        </p>
                        <p>
                          <FaCalendarAlt className="assignment-detail-icon" />
                          <span className="assignment-detail-label">Assigned On:</span>
                          <span className="assignment-detail-value">
                            {item.assignedDate ? new Date(item.assignedDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </span>
                        </p>
                        {status=="Returned" && item.returnDate && (
                          <p>
                            <FaCalendarAlt className="assignment-detail-icon" />
                            <span className="assignment-detail-label">Returned On:</span>
                            <span className="assignment-detail-value">
                              {new Date(item.returnDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-assignments-message">No assignments found matching your search.</p>
          )}
        </section>
        {showDetailsModal && selectedAssignment && (
          <AssignmentDetailsModal
            selectedAssignment={selectedAssignment}
            onClose={() => setShowDetailsModal(false)}
            onMarkReturned={handleReturnAsset}
          />
        )}

      </main>
    </div>
  );
};
export default Assignments;