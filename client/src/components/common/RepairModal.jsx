import React from 'react'

const RepairModal = ({
  selectedAsset,
  setActiveModal,
  repairRemarks,
  setRepairRemarks,
  handleRepairSubmit,
  currentAction
}) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{currentAction === 'repair' ? 'Send for Repair' : 'Mark as Repaired'}</h2>
        <p>Asset: <strong>{selectedAsset?.assetName}</strong></p>
        <form onSubmit={handleRepairSubmit}>
          <div className="form-group">
            <label htmlFor="remarks">Remarks</label>
            <textarea
              id="remarks"
              value={repairRemarks}
              onChange={(e) => setRepairRemarks(e.target.value)}
              placeholder="Add any relevant notes or details..."
              rows="4"
            ></textarea>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-confirm">Submit</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RepairModal