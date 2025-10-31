import React from 'react';
import ReactDOM from 'react-dom';
import './ConfirmationModal.css';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  if (!isOpen) {
    return null;
  }
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <FaExclamationTriangle className="modal-icon" />
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-btn cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn confirm-btn" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};
export default ConfirmationModal;
