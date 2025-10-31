import React from 'react';

const ConfirmModal = ({
  confirmMessage,
  confirmAction,
  selectedAsset,
  actionLabel,
  setActiveModal,
  setSelectedAsset,
  setConfirmAction,
  handleAction
}) => {
  if (!confirmAction || !selectedAsset) return null;

  const handleConfirm = async () => {
    await handleAction(confirmAction, selectedAsset);
    setActiveModal(null);
  };

  const handleCancel = () => {
    setActiveModal(null);
    setSelectedAsset(null);
    setConfirmAction(null);
  };

  return (
    <div className="books-modal-overlay">
      <div className="books-modal confirmation-modal">
        <h3>Confirm Action</h3>
        <p>{confirmMessage}</p>
        <div className="books-modal-buttons">
          <button
            type="button"
            className="delete-btn-confirm"
            onClick={handleConfirm}
          >
            Yes, {actionLabel || confirmAction}
          </button>
          <button
            type="button"
            className="cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
