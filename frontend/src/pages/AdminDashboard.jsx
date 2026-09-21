import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../services/inventoryService';
import shopService from '../services/shopService';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingShops, setPendingShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await inventoryService.getAdminStats();
      setStats(statsRes.data);

      const pendingRes = await shopService.getShops({ status: 'pending' });
      setPendingShops(pendingRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (shopId) => {
    try {
      await shopService.approveShop(shopId);
      alert('Shop approved successfully!');
      fetchAdminData();
    } catch (err) {
      alert('Failed to approve shop');
    }
  };

  const handleReject = async (shopId) => {
    try {
      await shopService.rejectShop(shopId);
      alert('Shop verification rejected');
      fetchAdminData();
    } catch (err) {
      alert('Failed to reject shop');
    }
  };

  if (loading && !stats) return <LoadingSpinner text="Loading Admin Platform Metrics..." />;

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-shield-lock-fill text-danger me-2"></i>Admin Platform Portal
          </h2>
          <p className="text-muted mb-0">System administration, shop verification, master data, & overall statistics.</p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/shops" className="btn btn-outline-primary rounded-pill px-3">
            <i className="bi bi-shop me-1"></i> All Shops ({stats?.total_shops || 0})
          </Link>
          <Link to="/admin/medicines" className="btn btn-outline-success rounded-pill px-3">
            <i className="bi bi-capsule me-1"></i> Master Medicines ({stats?.total_medicines || 0})
          </Link>
          <Link to="/admin/users" className="btn btn-outline-secondary rounded-pill px-3">
            <i className="bi bg-people me-1"></i> Users ({stats?.total_users || 0})
          </Link>
        </div>
      </div>

      {/* Admin Stat Cards */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <StatCard title="Total Users" value={stats.total_users} icon="people" color="blue" subtext={`Owners: ${stats.users_by_role.shop_owners} | Cust: ${stats.users_by_role.customers}`} />
          </div>
          <div className="col-md-3">
            <StatCard title="Total Shops" value={stats.total_shops} icon="shop" color="green" subtext={`Verified: ${stats.verified_shops} | Pending: ${stats.pending_shops}`} />
          </div>
          <div className="col-md-3">
            <StatCard title="Master Medicines" value={stats.total_medicines} icon="capsule" color="purple" subtext="Master drug catalog" />
          </div>
          <div className="col-md-3">
            <StatCard title="Low Stock Items" value={stats.low_stock_items} icon="exclamation-triangle" color="yellow" subtext={`Out of Stock: ${stats.out_of_stock_items}`} />
          </div>
        </div>
      )}

      {/* Pending Shop Approvals Queue */}
      <div className="custom-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">
            <i className="bi bi-clock-history text-warning me-2"></i>Pending Shop Approvals Queue ({pendingShops.length})
          </h5>
          <Link to="/admin/shops" className="small text-primary text-decoration-none fw-semibold">View All Shops &rarr;</Link>
        </div>

        {pendingShops.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-check-circle fs-2 d-block mb-1 text-success"></i>
            No pending medical shop registration requests.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Owner</th>
                  <th>License No</th>
                  <th>Area / City</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th className="text-end">Verification Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingShops.map((shop) => (
                  <tr key={shop.id}>
                    <td className="fw-bold text-dark">{shop.shop_name}</td>
                    <td>{shop.owner_details?.full_name} ({shop.owner_details?.email})</td>
                    <td><small className="text-muted fw-mono">{shop.license_number}</small></td>
                    <td>{shop.area}, {shop.city}</td>
                    <td>{shop.phone}</td>
                    <td><StatusBadge type="verification" status={false} /></td>
                    <td className="text-end">
                      <button onClick={() => handleApprove(shop.id)} className="btn btn-sm btn-success rounded-pill px-3 me-2">
                        <i className="bi bi-check-lg me-1"></i> Approve
                      </button>
                      <button onClick={() => handleReject(shop.id)} className="btn btn-sm btn-outline-danger rounded-pill px-3">
                        <i className="bi bi-x-lg me-1"></i> Reject
                      </button>
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

export default AdminDashboard;
