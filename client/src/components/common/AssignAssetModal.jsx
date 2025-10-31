import React from 'react';

const AssignAssetModal = ({
  asset,
  userEmail,
  setUserEmail,
  error,
  onAssign,
  onCancel
}) => {
  return (
    <div className="books-modal-overlay">
      <div className="books-modal">
        <h3>Assign Asset</h3>
        <p>Assigning: <strong>{asset?.assetName}</strong></p>
        <form onSubmit={(e) => {
          e.preventDefault();
          onAssign();
        }}>
          <input
            type="email"
            name="email"
            required
            placeholder="User's Email Address"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <div className="books-modal-buttons">
            <button type="submit" className="assign-btn">Assign</button>
            <button
              type="button"
              className="cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignAssetModal;
