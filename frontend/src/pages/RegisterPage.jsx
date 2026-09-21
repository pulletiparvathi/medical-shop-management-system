import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'SHOP_OWNER', // Default to Shop Owner or Customer
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      alert('Registration successful! Please login with your credentials.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      const errRes = err.response?.data;
      if (errRes?.errors) {
        if (typeof errRes.errors === 'object') {
          const firstKey = Object.keys(errRes.errors)[0];
          const firstErr = Array.isArray(errRes.errors[firstKey]) ? errRes.errors[firstKey][0] : errRes.errors[firstKey];
          setError(`${firstKey}: ${firstErr}`);
        } else {
          setError(String(errRes.errors));
        }
      } else {
        setError(errRes?.message || 'Registration failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="custom-card p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="fs-1">🏥</span>
              <h3 className="fw-bold text-dark mt-2">Create Account</h3>
              <p className="text-muted small">Register as a Pharmacy Shop Owner or Customer</p>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show small" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Account Role</label>
                  <div className="d-flex gap-3">
                    <div className="form-check custom-card p-3 flex-fill text-center m-0 cursor-pointer">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="role"
                        id="roleOwner"
                        value="SHOP_OWNER"
                        checked={formData.role === 'SHOP_OWNER'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label fw-bold d-block text-primary cursor-pointer" htmlFor="roleOwner">
                        <i className="bi bi-shop fs-4 d-block mb-1"></i> Medical Shop Owner
                      </label>
                    </div>

                    <div className="form-check custom-card p-3 flex-fill text-center m-0 cursor-pointer">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="role"
                        id="roleCustomer"
                        value="CUSTOMER"
                        checked={formData.role === 'CUSTOMER'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label fw-bold d-block text-success cursor-pointer" htmlFor="roleCustomer">
                        <i className="bi bi-person-heart fs-4 d-block mb-1"></i> Customer / Patient
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    className="form-control"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="owner@medicalshop.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary-custom btn-lg w-100 fw-bold mt-2"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>

            <div className="text-center border-top pt-3 mt-4 small text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
