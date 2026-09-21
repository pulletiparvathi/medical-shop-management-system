import React, { useState, useEffect } from 'react';
import shopService from '../services/shopService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await shopService.getShops();
      setShops(res.data || []);
    } catch (err) {
      console.error('Failed to load admin shops list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleApprove = async (id) => {
    await shopService.approveShop(id);
    fetchShops();
  };

  const handleReject = async (id) => {
    await shopService.rejectShop(id);
    fetchShops();
  };

  const handleToggleActive = async (id) => {
    await shopService.toggleShopActive(id);
    fetchShops();
  };

  const filteredShops = shops.filter(s => {
    if (filter === 'PENDING') return !s.is_verified;
    if (filter === 'VERIFIED') return s.is_verified;
    if (filter === 'DISABLED') return !s.is_active;
    return true;
  });

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Medical Shops Management</h2>
          <p className="text-muted mb-0">Approve, reject, or disable pharmacy registrations across the platform.</p>
        </div>

        <div className="d-flex gap-2">
          {['ALL', 'PENDING', 'VERIFIED', 'DISABLED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm rounded-pill px-3 ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-card p-4">
        {loading ? (
          <LoadingSpinner text="Fetching shop directory..." />
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-4 text-muted">No shops match the selected filter.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Owner</th>
                  <th>License No</th>
                  <th>Area / City</th>
                  <th>Verification</th>
                  <th>Active Status</th>
                  <th className="text-end">Admin Controls</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops.map((shop) => (
                  <tr key={shop.id}>
                    <td>
                      <div className="fw-bold text-dark">{shop.shop_name}</div>
                      <small className="text-muted">{shop.phone}</small>
                    </td>
                    <td>{shop.owner_details?.full_name} ({shop.owner_details?.email})</td>
                    <td><small className="text-muted fw-mono">{shop.license_number}</small></td>
                    <td>{shop.area}, {shop.city}</td>
                    <td><StatusBadge type="verification" status={shop.is_verified} /></td>
                    <td><StatusBadge type="active" status={shop.is_active} /></td>
                    <td className="text-end">
                      {!shop.is_verified && (
                        <button onClick={() => handleApprove(shop.id)} className="btn btn-sm btn-success rounded-pill px-3 me-1">
                          Approve
                        </button>
                      )}
                      {shop.is_verified && (
                        <button onClick={() => handleReject(shop.id)} className="btn btn-sm btn-outline-warning rounded-pill px-2 me-1">
                          Unverify
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleActive(shop.id)}
                        className={`btn btn-sm ${shop.is_active ? 'btn-outline-danger' : 'btn-outline-success'} rounded-pill px-3`}
                      >
                        {shop.is_active ? 'Disable' : 'Enable'}
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

export default AdminShopsPage;
