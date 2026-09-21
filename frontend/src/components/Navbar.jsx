import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isShopOwner, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active fw-bold text-primary' : '';

  return (
    <nav className="navbar navbar-expand-lg glass-nav sticky-top shadow-sm py-2">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary fs-4" to="/">
          <span className="fs-3">🏥</span>
          <span>Medical<span className="text-dark">Shop</span></span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center ms-3">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/medicines')}`} to="/medicines">Find Medicines</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/shops')}`} to="/shops">Medical Shops</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/prescription-scanner')}`} to="/prescription-scanner">
                <i className="bi bi-file-earmark-medical text-primary me-1"></i>
                Prescription Scanner
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/nearby')}`} to="/nearby">
                <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                Nearby Shops
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                {isShopOwner && (
                  <Link to="/owner/dashboard" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                    <i className="bi bi-speedometer2 me-1"></i> Shop Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin/dashboard" className="btn btn-outline-danger btn-sm rounded-pill px-3">
                    <i className="bi bi-shield-lock me-1"></i> Admin Portal
                  </Link>
                )}

                <div className="dropdown">
                  <button
                    className="btn btn-light btn-sm rounded-pill dropdown-toggle d-flex align-items-center gap-2 border px-3"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <span className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28, fontSize: 13 }}>
                      {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                    </span>
                    <span className="fw-medium text-dark">{user.full_name}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                    <li className="dropdown-header">
                      <div className="fw-bold">{user.full_name}</div>
                      <small className="text-muted">{user.email}</small>
                      <div>
                        <span className="badge bg-secondary text-uppercase mt-1" style={{ fontSize: 10 }}>{user.role}</span>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i> Profile
                      </Link>
                    </li>
                    {isShopOwner && (
                      <li>
                        <Link className="dropdown-item" to="/owner/inventory">
                          <i className="bi bi-box-seam me-2"></i> Manage Inventory
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-primary rounded-pill px-4">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary-custom rounded-pill px-4">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
