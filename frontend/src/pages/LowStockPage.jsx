import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../services/inventoryService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const LowStockPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      setLoading(true);
      try {
        const data = await inventoryService.getLowStock();
        setItems(data.data || []);
      } catch (err) {
        console.error('Failed to fetch low stock items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>Low Stock & Replenishment Alerts
          </h2>
          <p className="text-muted mb-0">Items where quantity &le; minimum stock limit or out of stock.</p>
        </div>
        <Link to="/owner/inventory/add" className="btn btn-primary-custom rounded-pill px-4">
          <i className="bi bi-plus-lg me-1"></i> Restock Medicine
        </Link>
      </div>

      <div className="custom-card p-4">
        {loading ? (
          <LoadingSpinner text="Analyzing inventory threshold limits..." />
        ) : items.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-check-circle-fill text-success fs-1 mb-3 d-block"></i>
            <h4 className="fw-bold text-dark">Healthy Inventory Level</h4>
            <p className="text-muted">All medicine stock levels are currently above configured minimum thresholds.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Current Quantity</th>
                  <th>Min Limit Threshold</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={item.quantity === 0 ? 'table-danger bg-opacity-10' : 'table-warning bg-opacity-10'}>
                    <td className="fw-bold text-dark">{item.medicine_details?.medicine_name}</td>
                    <td>{item.medicine_details?.brand_name}</td>
                    <td><span className="badge bg-light text-dark border">{item.medicine_details?.category}</span></td>
                    <td className="fw-bold text-danger fs-6">{item.quantity} units</td>
                    <td className="text-muted">{item.minimum_stock_level} units</td>
                    <td className="fw-bold">₹{item.price}</td>
                    <td><StatusBadge type="stock" status={item.stock_status} /></td>
                    <td className="text-end">
                      <Link to={`/owner/inventory/edit/${item.id}`} className="btn btn-sm btn-primary rounded-pill px-3">
                        <i className="bi bi-plus-circle me-1"></i> Update Quantity
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockPage;
