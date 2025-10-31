import React from 'react';

const AssignmentDetailsModal = ({
  selectedAssignment,
  onClose,
  onMarkReturned
}) => {
  if (!selectedAssignment) return null;

  return (
    <div className="books-modal-overlay">
      <div className="books-modal assignment-details-modal">
        <h3>Assignment Details</h3>

        <div className="details-section">
          <h4>Asset Information</h4>
          <p><strong>Name:</strong> {selectedAssignment?.assetId?.assetName}</p>
          <p><strong>Serial:</strong> {selectedAssignment?.assetId?.serialNumber}</p>
          <p><strong>Category:</strong> {selectedAssignment?.assetId?.assetCategory}</p>
        </div>

        <div className="details-section">
          <h4>User Information</h4>
          <p><strong>Name:</strong> {selectedAssignment?.userId?.name}</p>
          <p><strong>Email:</strong> {selectedAssignment?.userId?.email}</p>
        </div>

        <div className="details-section">
          <h4>Assignment Timeline</h4>
          <p><strong>Assigned On:</strong> {new Date(selectedAssignment?.assignedDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {selectedAssignment?.status}</p>
          {selectedAssignment?.returnDate && (
            <p><strong>Returned On:</strong> {new Date(selectedAssignment?.returnDate).toLocaleDateString()}</p>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="cancel" onClick={onClose}>
            Close
          </button>
          {selectedAssignment?.status !== 'Returned' && (
            <button
              type="button"
              className="save-btn"
              onClick={() => onMarkReturned(selectedAssignment?.assetId?.serialNumber)}
            >
              Mark as Returned
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailsModal;
