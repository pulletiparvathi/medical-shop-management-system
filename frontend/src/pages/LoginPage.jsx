import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      const role = data.user?.role;
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'SHOP_OWNER') navigate('/owner/dashboard');
      else navigate(from === '/login' ? '/' : from);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.errors?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="custom-card p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="fs-1">🏥</span>
              <h3 className="fw-bold text-dark mt-2">Welcome Back</h3>
              <p className="text-muted small">Sign in to manage your medical shop or search inventory</p>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show small" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-lg fs-6"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg fs-6"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary-custom btn-lg w-100 fw-bold mb-3"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center border-top pt-3 mt-3 small text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
