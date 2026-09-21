import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../services/inventoryService';
import shopService from '../services/shopService';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const ShopOwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [recentInventory, setRecentInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (shopId = '') => {
    setLoading(true);
    try {
      const myShopsRes = await shopService.getMyShops();
      const myShops = myShopsRes.data || [];
      setShops(myShops);

      const activeShopId = shopId || (myShops.length > 0 ? myShops[0].id : '');
      if (!shopId && activeShopId) {
        setSelectedShopId(activeShopId);
      }

      const statsRes = await inventoryService.getDashboardStats(activeShopId);
      setStats(statsRes.data);

      const invRes = await inventoryService.getInventory({ shop_id: activeShopId });
      setRecentInventory((invRes.data || []).slice(0, 8));
    } catch (err) {
      console.error('Failed to fetch owner dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleShopChange = (e) => {
    const sId = e.target.value;
    setSelectedShopId(sId);
    fetchDashboardData(sId);
  };

  if (loading && !stats) return <LoadingSpinner text="Loading your medical shop dashboard..." />;

  return (
    <div className="container py-4">
      {/* Header & Shop Selection */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Medical Shop Dashboard</h2>
          <p className="text-muted mb-0">Manage inventory, monitor low stock alerts, and track stock valuation.</p>
        </div>

        {shops.length > 0 ? (
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-semibold">Active Shop:</span>
            <select className="form-select border-primary" value={selectedShopId} onChange={handleShopChange}>
              {shops.map(s => (
                <option key={s.id} value={s.id}>{s.shop_name} ({s.area})</option>
              ))}
            </select>
          </div>
        ) : (
          <Link to="/owner/shop-profile" className="btn btn-primary-custom rounded-pill px-4">
            <i className="bi bi-plus-circle me-1"></i> Register Shop Profile
          </Link>
        )}
      </div>

      {shops.length === 0 && (
        <div className="alert alert-warning p-4 rounded-4 mb-4">
          <h5 className="fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>No Registered Shop Found</h5>
          <p className="mb-2">You need to register your medical shop profile before managing inventory.</p>
          <Link to="/owner/shop-profile" className="btn btn-dark rounded-pill btn-sm">Register Shop Profile</Link>
        </div>
      )}

      {/* Dashboard Stat Cards */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-4 col-lg-2-4">
            <StatCard
              title="Total Medicines"
              value={stats.total_medicines}
              icon="capsule"
              color="blue"
              subtext="Catalog items"
            />
          </div>
          <div className="col-md-4 col-lg-2-4">
            <StatCard
              title="Available"
              value={stats.available_medicines}
              icon="check-circle"
              color="green"
              subtext="Active stock"
            />
          </div>
          <div className="col-md-4 col-lg-2-4">
            <StatCard
              title="Low Stock"
              value={stats.low_stock}
              icon="exclamation-triangle"
              color="yellow"
              subtext="Below min limit"
            />
          </div>
          <div className="col-md-4 col-lg-2-4">
            <StatCard
              title="Out of Stock"
              value={stats.out_of_stock}
              icon="x-circle"
              color="red"
              subtext="Zero quantity"
            />
          </div>
          <div className="col-md-4 col-lg-2-4">
            <StatCard
              title="Inventory Value"
              value={`₹${stats.total_inventory_value.toLocaleString('en-IN')}`}
              icon="currency-rupee"
              color="purple"
              subtext="Total stock valuation"
            />
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="custom-card p-3 mb-4 bg-white">
        <div className="d-flex flex-wrap gap-2">
          <Link to="/owner/inventory/add" className="btn btn-primary-custom rounded-pill">
            <i className="bi bi-plus-lg me-1"></i> Add New Medicine Stock
          </Link>
          <Link to="/owner/inventory" className="btn btn-outline-primary rounded-pill">
            <i className="bi bi-box-seam me-1"></i> Full Inventory Table
          </Link>
          <Link to="/owner/low-stock" className="btn btn-outline-warning text-dark rounded-pill">
            <i className="bi bi-exclamation-circle me-1"></i> Low Stock System
          </Link>
          <Link to="/owner/expiry" className="btn btn-outline-danger rounded-pill">
            <i className="bi bi-calendar-event me-1"></i> Expiry Management
          </Link>
          <Link to="/owner/shop-profile" className="btn btn-outline-secondary rounded-pill ms-auto">
            <i className="bi bi-gear me-1"></i> Edit Shop Profile
          </Link>
        </div>
      </div>

      {/* Recent Inventory Table */}
      <div className="custom-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">Current Inventory Overview</h5>
          <Link to="/owner/inventory" className="small text-primary text-decoration-none fw-semibold">
            View All ({stats?.total_medicines || 0}) &rarr;
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-custom align-middle">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Batch No</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentInventory.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">No inventory items found. Click "Add New Medicine Stock" to begin.</td>
                </tr>
              ) : (
                recentInventory.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-bold text-dark">{item.medicine_details?.medicine_name}</td>
                    <td>{item.medicine_details?.brand_name}</td>
                    <td><span className="badge bg-light text-dark border">{item.medicine_details?.category}</span></td>
                    <td className="fw-bold">{item.quantity}</td>
                    <td className="text-success fw-semibold">₹{item.price}</td>
                    <td><small className="text-muted">{item.batch_number}</small></td>
                    <td><small className={item.is_expired ? 'text-danger fw-bold' : ''}>{item.expiry_date}</small></td>
                    <td><StatusBadge type="stock" status={item.stock_status} /></td>
                    <td>
                      <Link to={`/owner/inventory/edit/${item.id}`} className="btn btn-sm btn-light border me-1" title="Edit Item">
                        <i className="bi bi-pencil"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;
