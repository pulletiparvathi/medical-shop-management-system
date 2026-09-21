import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const CustomerProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await authService.updateProfile({
        full_name: formData.full_name,
        phone: formData.phone
      });
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="custom-card p-4 p-md-5">
            <h3 className="fw-bold text-dark mb-4">
              <i className="bi bi-person-gear text-primary me-2"></i>My Profile
            </h3>

            {message && (
              <div className="alert alert-info alert-dismissible fade show small" role="alert">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Account Role</label>
                <input type="text" className="form-control bg-light" value={user?.role} disabled />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input type="email" className="form-control bg-light" value={formData.email} disabled />
                <div className="form-text">Email address cannot be changed.</div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary-custom w-100 fw-bold" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
