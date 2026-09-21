import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../services/inventoryService';
import shopService from '../services/shopService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';

const OwnerInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getInventory();
      setInventory(data.data || []);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await inventoryService.deleteInventory(deleteId);
      setDeleteId(null);
      fetchInventory();
    } catch (err) {
      alert('Failed to delete inventory item');
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const term = search.toLowerCase();
    const nameMatch = item.medicine_details?.medicine_name?.toLowerCase().includes(term) ||
                      item.medicine_details?.brand_name?.toLowerCase().includes(term) ||
                      item.batch_number?.toLowerCase().includes(term);

    if (!nameMatch) return false;

    if (statusFilter === 'AVAILABLE') return item.stock_status === 'AVAILABLE';
    if (statusFilter === 'LOW_STOCK') return item.stock_status === 'LOW_STOCK';
    if (statusFilter === 'OUT_OF_STOCK') return item.stock_status === 'OUT_OF_STOCK';
    if (statusFilter === 'EXPIRED') return item.is_expired;

    return true;
  });

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Inventory Management</h2>
          <p className="text-muted mb-0">View, search, filter, and update medicine stock levels and prices.</p>
        </div>
        <Link to="/owner/inventory/add" className="btn btn-primary-custom rounded-pill px-4 fw-semibold">
          <i className="bi bi-plus-lg me-1"></i> Add Medicine Stock
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="custom-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by medicine name, brand, or batch number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-2 justify-content-md-end flex-wrap">
              {['ALL', 'AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`btn btn-sm rounded-pill px-3 ${statusFilter === st ? 'btn-primary' : 'btn-outline-secondary'}`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="custom-card p-4">
        {loading ? (
          <LoadingSpinner text="Loading shop inventory dataset..." />
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
            <h5>No inventory items found matching your filter</h5>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Batch No</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-bold text-dark">{item.medicine_details?.medicine_name}</div>
                      <small className="text-muted">{item.medicine_details?.dosage} ({item.medicine_details?.dosage_form})</small>
                    </td>
                    <td>{item.medicine_details?.brand_name}</td>
                    <td><span className="badge bg-light text-dark border">{item.medicine_details?.category}</span></td>
                    <td className="fw-bold">{item.quantity}</td>
                    <td className="fw-bold text-success">₹{item.price}</td>
                    <td><small className="text-muted">{item.batch_number}</small></td>
                    <td>
                      <small className={item.is_expired ? 'text-danger fw-bold' : ''}>
                        {item.expiry_date}
                        {item.is_expired && <span className="ms-1 badge bg-danger">Expired</span>}
                      </small>
                    </td>
                    <td><StatusBadge type="stock" status={item.stock_status} /></td>
                    <td className="text-end">
                      <Link to={`/owner/inventory/edit/${item.id}`} className="btn btn-sm btn-light border me-1" title="Edit Inventory">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button onClick={() => setDeleteId(item.id)} className="btn btn-sm btn-outline-danger" title="Delete Stock Record">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Inventory Stock Record?"
        message="Are you sure you want to remove this medicine batch from your shop inventory? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete Stock"
      />
    </div>
  );
};

export default OwnerInventoryPage;
