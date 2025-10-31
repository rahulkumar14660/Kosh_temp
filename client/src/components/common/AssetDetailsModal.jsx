import React from 'react';
import './AssetDetailsModal.css';

const AssetDetailsModal = ({ selectedAsset, setActiveModal }) => {
  if (!selectedAsset) return null;

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <header className="modal-header">
          <h2 className="modal-title">{selectedAsset.assetName}</h2>
          <button className="modal-close-btnn" onClick={() => setActiveModal(null)} aria-label="Close">
            &times;
          </button>
        </header>

        <main className="modal-body">
          <div className="details-container">
            <DetailRow label="Status" value={selectedAsset.status} type="status" />
            <DetailRow label="Category" value={selectedAsset.assetCategory} />
            <DetailRow label="Serial Number" value={selectedAsset.serialNumber} />
            {selectedAsset.status === 'Assigned' && selectedAsset.assignedTo && (
              <DetailRow label="Assigned To" value={selectedAsset.assignedTo.email} />
            )}
            <DetailRow label="Cost" value={selectedAsset.cost ? `₹${selectedAsset.cost.toLocaleString('en-IN')}` : 'N/A'} />
            <DetailRow label="Purchase Date" value={formatDate(selectedAsset.purchaseDate)} />
            <DetailRow label="Warranty Expiry" value={formatDate(selectedAsset.warrantyExpiry)} />
            <div className="detail-row full-width">
              <span className="detail-label">Description</span>
              <p className="detail-value-description">
                {selectedAsset.assetDescription || 'No description has been provided.'}
              </p>
            </div>
          </div>
        </main>

        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>
            Close
          </button>
        </footer>
        
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, type }) => (
  <div className="detail-row">
    <span className="detail-label">{label}</span>
    {type === 'status' ? (
      <span>
        {value}
      </span>
    ) : (
      <span className="detail-value">{value}</span>
    )}
  </div>
);

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

export default AssetDetailsModal;