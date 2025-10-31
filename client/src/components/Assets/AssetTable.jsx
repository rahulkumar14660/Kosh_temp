import React from 'react';

const AssetTable = ({
  filteredAssets,
  handleShowDetailsModal,
  handleShowEditModal,
  handleActionMenuToggle,
  handleShowAssignModal,
  handleShowRepairModal,
  setSelectedAsset,
  setConfirmMessage,
  setConfirmAction,
  setActiveModal,
  actionMenuState,
  setActionMenuState,
}) => {
  return (
    <table className="books-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Serial No.</th>
          <th>Status</th>
          <th>Purchase Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredAssets.map((asset) => (
          <tr key={asset._id}>
            <td onClick={() => handleShowDetailsModal(asset)} className="asset-name-clickable">
              {asset?.assetName}
            </td>
            <td>{asset?.assetCategory}</td>
            <td>{asset?.serialNumber}</td>
            <td>
              <span className={`status-badge ${
                asset?.status === 'Available' ? 'active' :
                asset?.status === 'Assigned' ? 'assigned' : 'overdue'
              }`}>
                {asset?.status}
              </span>
            </td>
            <td>{new Date(asset?.purchaseDate).toLocaleDateString('en-IN')}</td>
            <td className="books-actions">
              <button onClick={() => handleShowEditModal(asset)} className="details-btn">Update</button>
              <div className="actions-dropdown-container">
                <button
                  onClick={(e) => handleActionMenuToggle(e, asset._id)}
                  className="actions-btn"
                >
                  Actions ▼
                </button>
                {actionMenuState.openId === asset._id && (
                  <div className={`actions-dropdown-menu ${actionMenuState.direction === 'up' ? 'up' : ''}`}>
                    {asset?.status === 'Available' && (
                      <>
                        <button onClick={() => {
                          handleShowAssignModal(asset);
                          setActionMenuState({ openId: null, direction: 'down' });
                        }}>Assign</button>

                        <button onClick={() => handleShowRepairModal('repair', asset)}>Send for Repair</button>

                        <button onClick={() => {
                          setSelectedAsset(asset);
                          setConfirmMessage('Are you sure you want to retire this asset? This action cannot be undone.');
                          setConfirmAction('retire');
                          setActiveModal('confirm');
                          setActionMenuState({ openId: null, direction: 'down' });
                        }}>Retire</button>
                      </>
                    )}

                    {asset?.status === 'Under Maintenance' && (
                      <button onClick={() => handleShowRepairModal('repaired', asset)}>Mark as Repaired</button>
                    )}

                    {asset?.status === 'Assigned' && (
                      <>
                        <button onClick={() => {
                          setSelectedAsset(asset);
                          setConfirmMessage('Are you sure you want to return this asset to available inventory?');
                          setConfirmAction('return');
                          setActiveModal('confirm');
                          setActionMenuState({ openId: null, direction: 'down' });
                        }}>Return</button>

                        <button onClick={() => handleShowRepairModal('repair', asset)}>Send for Repair</button>

                        <button onClick={() => {
                          setSelectedAsset(asset);
                          setConfirmMessage('Are you sure you want to retire this asset? This action cannot be undone.');
                          setConfirmAction('retire');
                          setActiveModal('confirm');
                          setActionMenuState({ openId: null, direction: 'down' });
                        }}>Retire</button>
                      </>
                    )}

                    {asset?.status === 'Retired' && <p>No actions available</p>}
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AssetTable;
