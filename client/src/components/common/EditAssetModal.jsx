import React from 'react';

const EditAssetModal = ({
  editedAsset,
  handleEditInputChange,
  handleUpdateAsset,
  setShowDeleteConfirm,
  setActiveModal,
  setError,
  error,
}) => {
  if (!editedAsset) return null;

  return (
    <div className="books-modal-overlay">
      <div className="books-modal edit-asset-modal modal-close-btnn-container">
        <button
          className="modal-close-btnn"
          onClick={() => setActiveModal(null)}
          aria-label="Close"
        >
          &times;
        </button>

        <h3>Edit Asset</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateAsset();
          }}
        >
          <div className="form-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Asset Name</label>
                <input
                  type="text"
                  name="assetName"
                  value={editedAsset.assetName}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="assetCategory"
                  value={editedAsset.assetCategory}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cost (₹)</label>
                <input
                  type="number"
                  name="cost"
                  value={editedAsset.cost || ''}
                  onChange={handleEditInputChange}
                  placeholder="e.g., 50000"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={
                    editedAsset.purchaseDate
                      ? new Date(editedAsset.purchaseDate).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Warranty Expiry</label>
                <input
                  type="date"
                  name="warrantyExpiry"
                  value={
                    editedAsset.warrantyExpiry
                      ? new Date(editedAsset.warrantyExpiry).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="assetDescription"
                  value={editedAsset.assetDescription || ''}
                  onChange={handleEditInputChange}
                  rows="3"
                  maxLength="500"
                ></textarea>
              </div>
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-footer">
            <button
              type="button"
              className="delete-btn"
              onClick={() => {
                setShowDeleteConfirm(true);
                setActiveModal(null);
              }}
            >
              Delete
            </button>

            <div className="footer-actions">
              <button
                type="button"
                className="cancel"
                onClick={() => {
                  setActiveModal(null);
                  setError('');
                }}
              >
                Cancel
              </button>

              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssetModal;
