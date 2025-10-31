import React from 'react';

const DeleteConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="books-modal-overlay">
      <div className="books-modal confirmation-modal">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this asset? This action cannot be undone.</p>
        <div className="books-modal-buttons">
          <button
            type="button"
            className="delete-btn-confirm"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
          <button
            type="button"
            className="cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
