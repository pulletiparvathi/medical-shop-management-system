import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authService.getUsers(roleFilter);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">User Accounts Management</h2>
          <p className="text-muted mb-0">List of registered Admins, Shop Owners, and Customers.</p>
        </div>

        <div className="d-flex gap-2">
          {['', 'ADMIN', 'SHOP_OWNER', 'CUSTOMER'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`btn btn-sm rounded-pill px-3 ${roleFilter === r ? 'btn-primary' : 'btn-outline-secondary'}`}
            >
              {r || 'ALL ROLES'}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-card p-4">
        {loading ? (
          <LoadingSpinner text="Loading platform user database..." />
        ) : users.length === 0 ? (
          <div className="text-center py-4 text-muted">No users found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold text-dark">{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'bg-danger' : u.role === 'SHOP_OWNER' ? 'bg-primary' : 'bg-success'} text-uppercase`}>
                        {u.role}
                      </span>
                    </td>
                    <td><small className="text-muted">{new Date(u.created_at).toLocaleDateString()}</small></td>
                    <td>
                      {u.is_active ? (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Disabled</span>
                      )}
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

export default AdminUsersPage;
