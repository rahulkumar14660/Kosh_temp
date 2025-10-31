import React from 'react';

const AddAssetModal = ({
  handleAddAsset,
  handleInputChange,
  error,
  setActiveModal,
}) => {
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

        <h3>Add New Asset</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddAsset(e);
          }}
        >
          <div className="form-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Asset Name</label>
                <input
                  type="text"
                  name="assetName"
                  onChange={handleInputChange}
                  placeholder="e.g., Dell Latitude"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="assetCategory"
                  onChange={handleInputChange}
                  placeholder="e.g., Laptop"
                  required
                />
              </div>

              <div className="form-group">
                <label>Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  onChange={handleInputChange}
                  placeholder="e.g., DL-1025"
                  required
                />
              </div>

              <div className="form-group">
                <label>Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Warranty Expiry</label>
                <input
                  type="date"
                  name="warrantyExpiry"
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Cost (₹)</label>
                <input
                  type="number"
                  name="cost"
                  onChange={handleInputChange}
                  placeholder="e.g., 75000"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="assetDescription"
                  onChange={handleInputChange}
                  placeholder="Enter asset description"
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
              className="cancel"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </button>
            <div className="footer-actions">
              <button type="submit" className="save-btn">
                Create Asset
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetModal;
