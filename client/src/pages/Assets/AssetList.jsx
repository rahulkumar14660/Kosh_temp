import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import '../user/Books.css';
import Loader from '../../components/common/Loader';
import RepairModal from '../../components/common/RepairModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import AddAssetModal from '../../components/common/AddAssetModal';
import EditAssetModal from '../../components/common/EditAssetModal';
import AssetDetailsModal from '../../components/common/AssetDetailsModal';
import AssetTable from '../../components/Assets/AssetTable';
import DeleteConfirmModal from '../../components/common/DeleteConfirmationModal';
import AssignAssetModal from '../../components/common/AssignAssetModal';

const AssetList = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { user, isAdmin, refreshAuthContext } = useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAsset, setNewAsset] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editedAsset, setEditedAsset] = useState(null);
  const [actionMenuState, setActionMenuState] = useState({ openId: null, direction: 'down' });
  const [userEmail, setUserEmail] = useState('');
  const [repairRemarks, setRepairRemarks] = useState('');
  const [currentAction, setCurrentAction] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeModal, setActiveModal] = useState(null);




  useEffect(() => {
    fetchAssets();
  }, [refreshAuthContext]);


  useEffect(() => {
    let filtered = assets;
    if (selectedCategory) {
      filtered = filtered.filter(asset => asset?.assetCategory === selectedCategory);
    }
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(asset =>
        (asset.assetName && asset.assetName.toLowerCase().includes(lowercasedQuery)) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(lowercasedQuery)) ||
        (asset.assetCategory && asset.assetCategory.toLowerCase().includes(lowercasedQuery))
      );
    }
    setFilteredAssets(filtered);
  }, [searchQuery, selectedCategory, assets]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.actions-dropdown-container')) {
        setActionMenuState({ openId: null, direction: 'down' });
      }
    };
    if (actionMenuState.openId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuState.openId]);

  useEffect(() => {
    if (selectedCategory === '') {
      setFilteredAssets(assets);
    } else {
      const filtered = assets.filter(asset => asset?.assetCategory === selectedCategory);
      setFilteredAssets(filtered);
    }
  }, [selectedCategory, assets]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/v1/asset/assets`, { withCredentials: true });
      setAssets(response?.data?.assets);
      const uniqueCategories = [...new Set(response?.data?.assets?.map(asset => asset.assetCategory))];
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError('Failed to fetch assets.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAsset({ ...newAsset, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAsset({ ...editedAsset, [name]: value });
  };

  const handleUpdateAsset = async () => {
    try {

      const response = await axios.put(
        `${apiUrl}/api/v1/asset/assets/${editedAsset?.serialNumber}`,
        editedAsset,
        { withCredentials: true }
      );

      const updated = response.data?.data;

      setAssets(prevAssets => prevAssets.map(asset => asset._id === updated.asset._id ? updated.asset : asset));

      setActiveModal(null);
      setError('');
    } catch (err) {
      console.error('Error updating asset:', err);
      setError(err.response?.data?.message || 'Failed to update asset. Please try again.');
    }
  };

  const handleDeleteAsset = async () => {
    try {
      await axios.delete(
        `${apiUrl}/api/v1/asset/assets/${selectedAsset?.serialNumber}`,
        { withCredentials: true }
      );
      setAssets(assets.filter(asset => asset?.serialNumber !== selectedAsset?.serialNumber));
      setShowDeleteConfirm(false);
      setActiveModal(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete asset.');
    }
  };

  const handleAssignAsset = async (e) => {
    e?.preventDefault();

    if (!userEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/assignAsset/recordAssetAssignment/${selectedAsset.serialNumber}`,
        { email: userEmail },
        { withCredentials: true }
      );

      setAssets(assets.map(asset => {
        if (asset?.serialNumber === selectedAsset?.serialNumber) {
          return {
            ...response.data?.data?.asset
          };
        }
        return asset;
      }));
      setUserEmail('');
      setError('');
      setActiveModal(null);
    } catch (err) {
      console.error('Error assigning asset:', err);
      setError(err.response?.data?.message || 'Failed to assign asset. Please try again.');
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/v1/asset/assets`, newAsset, { withCredentials: true });
      setActiveModal(null);
      fetchAssets();
      setNewAsset({});
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add asset. Check console.');
    }
  };

  const handleActionMenuToggle = (event, assetId) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 150;
    const direction = spaceBelow < dropdownHeight ? 'up' : 'down';
    if (actionMenuState.openId === assetId) {
      setActionMenuState({ openId: null, direction: 'down' });
    } else {
      setActionMenuState({ openId: assetId, direction: direction });
    }
  };

  const handleRepairSubmit = async (e) => {
    e.preventDefault();
    if (!repairRemarks.trim()) {
      setError('Please provide remarks for this action.');
      return;
    }

    try {
      let endpoint = '';
      const serialNumber = selectedAsset.serialNumber;

      if (currentAction === 'repair') {
        endpoint = `${apiUrl}/api/v1/assignAsset/recordAssetRepair/${serialNumber}`;
      } else if (currentAction === 'repaired') {
        endpoint = `${apiUrl}/api/v1/assignAsset/recordAssetRepaired/${serialNumber}`;
      } else {
        return;
      }

      const response = await axios.post(
        endpoint,
        {
          remarks: repairRemarks,
        },
        { withCredentials: true }
      );

      const updatedAsset = response?.data?.data;

      if (updatedAsset) {
        setAssets(assets.map(asset =>
          asset?._id === selectedAsset?._id ? updatedAsset : asset
        ));
      } else {
        setAssets(assets.map(asset => {
          if (asset?._id === selectedAsset?._id) {
            const newStatus = currentAction === 'repaired'
              ? (asset.previousStatus || 'Available')
              : 'Under Maintenance';

            return {
              ...asset,
              status: newStatus,
              ...(currentAction === 'repair' && { previousStatus: asset.status }),
              repairHistory: [
                ...(asset.repairHistory || []),
                {
                  date: new Date().toISOString(),
                  action: currentAction === 'repair' ? 'Sent for Repair' : 'Marked as Repaired',
                  remarks: repairRemarks
                }
              ]
            };
          }
          return asset;
        }));
      }

      setActiveModal(null);
      setRepairRemarks('');
      setError('');
    } catch (err) {
      console.error('Error in handleRepairSubmit:', err);
      setError(err.response?.data?.message || `Failed to process ${currentAction} action. Please try again.`);
    }
  };

  const handleAction = async (action, asset) => {
    try {
      let endpoint = '';

      if (action === 'retire') {
        endpoint = `${apiUrl}/api/v1/assignAsset/recordAssetRetired/${asset.serialNumber}`;
      } else if (action === 'return') {
        endpoint = `${apiUrl}/api/v1/assignAsset/recordAssetReturn/${asset.serialNumber}`;
      } else {
        throw new Error('Invalid action');
      }

      const response = await axios.post(
        endpoint,
        { remarks: `${action === 'retire' ? 'Asset retired' : 'Asset returned'}` },
        { withCredentials: true }
      );

      setAssets(assets.map(a =>
        a?._id === asset?._id ? {
          ...a,
          status: action === 'retire' ? 'Retired' : 'Available',
          ...(action === 'return' && {
            assignedTo: null,
            lastAssignedDate: null
          })
        } : a
      ));

      setError('');
      return true;
    } catch (err) {
      console.error(`Error in handleAction (${action}):`, err);
      setError(err.response?.data?.message || `Failed to ${action} asset. Please try again.`);
      return false;
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleShowRepairModal = (action, asset) => {
    setCurrentAction(action);
    setSelectedAsset(asset);
    setRepairRemarks('');
    setActiveModal('repair');
    setActionMenuState({ openId: null, direction: 'down' });
  };

  const handleShowDetailsModal = (asset) => {
    setSelectedAsset(asset);
    setActiveModal('details');
  };

  const handleShowEditModal = (asset) => {
    setSelectedAsset(asset);
    setEditedAsset({ ...asset });
    setActiveModal('edit');
  };

  const handleShowAssignModal = (asset) => {
    setSelectedAsset(asset);
    setUserEmail('');
    setError('');
    setActiveModal('assign');
    setActionMenuState({ openId: null, direction: 'down' });
  };

  if (loading) {
    return (
      <div className="books-container">
        <Sidebar />
        <main className="books-main-content">
          <Loader />
        </main>
      </div>
    );
  }


  return (
    <div className="books-container">
      
      <Sidebar />
      <main className="books-main-content">
        <header className="books-header">
          <h2>Assets Collection</h2>
          <div className="controls">
            <input
              type="text"
              placeholder="Search by name, sno or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select value={selectedCategory} onChange={handleCategoryChange} className="category-filter">
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {isAdmin(user, ["Admin", "AssetManager"]) && (
              <button onClick={() => setActiveModal('add')} className="add-book-btn">Add New Asset</button>
            )}
          </div>
        </header>
        <section className="books-section">
          <div className="table-container">
            {activeModal === 'repair' && (
              <RepairModal
                selectedAsset={selectedAsset}
                setActiveModal={setActiveModal}
                repairRemarks={repairRemarks}
                setRepairRemarks={setRepairRemarks}
                handleRepairSubmit={handleRepairSubmit}
                currentAction={currentAction}
              />
            )}

            <AssetTable
              filteredAssets={filteredAssets}
              handleShowDetailsModal={handleShowDetailsModal}
              handleShowEditModal={handleShowEditModal}
              handleActionMenuToggle={handleActionMenuToggle}
              handleShowAssignModal={handleShowAssignModal}
              handleShowRepairModal={handleShowRepairModal}
              setSelectedAsset={setSelectedAsset}
              setConfirmMessage={setConfirmMessage}
              setConfirmAction={setConfirmAction}
              setActiveModal={setActiveModal}
              actionMenuState={actionMenuState}
              setActionMenuState={setActionMenuState}
            />

          </div>
        </section>
        {activeModal === 'add' && (
          <AddAssetModal
            handleAddAsset={handleAddAsset}
            handleInputChange={handleInputChange}
            error={error}
            setActiveModal={setActiveModal}
          />
        )}

        {activeModal === 'edit' && editedAsset && (
          <EditAssetModal
            editedAsset={editedAsset}
            handleEditInputChange={handleEditInputChange}
            handleUpdateAsset={handleUpdateAsset}
            setShowDeleteConfirm={setShowDeleteConfirm}
            setActiveModal={setActiveModal}
            setError={setError}
            error={error}
          />
        )}

        {activeModal === 'details' && selectedAsset && (
          <AssetDetailsModal
            selectedAsset={selectedAsset}
            setActiveModal={setActiveModal}
          />
        )}

        {showDeleteConfirm && (
          <DeleteConfirmModal
            onConfirm={handleDeleteAsset}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
        {activeModal === 'assign' && selectedAsset && (
          <AssignAssetModal
            asset={selectedAsset}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            error={error}
            onAssign={handleAssignAsset}
            onCancel={() => {
              setActiveModal(null);
              setError('');
            }}
          />
        )}
        {activeModal === 'confirm' && (
          <ConfirmModal
            confirmMessage={confirmMessage}
            confirmAction={confirmAction}
            selectedAsset={selectedAsset}
            actionLabel={confirmAction}
            setActiveModal={setActiveModal}
            setSelectedAsset={setSelectedAsset}
            setConfirmAction={setConfirmAction}
            handleAction={handleAction}
          />
        )}

      </main>
    </div>
  );
};

export default AssetList;