import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold d-flex align-items-center gap-2 text-primary">
              <span>🏥</span> MedicalShop
            </h5>
            <p className="text-secondary small mt-3">
              Production-grade Medical Shop & Pharmacy Inventory System. Find real-time medicine stock, locate nearby registered pharmacies, and access location-aware REST APIs ready for <strong>MediFinder</strong> integration.
            </p>
            <div className="d-flex gap-3 text-secondary mt-3">
              <i className="bi bi-shield-check text-success fs-5"></i> Verified Pharmacies
              <i className="bi bi-lightning-charge text-warning fs-5"></i> Live Inventory
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold text-white mb-3">Quick Links</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
              <li className="mb-2"><Link to="/medicines" className="text-secondary text-decoration-none">Medicine Search</Link></li>
              <li className="mb-2"><Link to="/shops" className="text-secondary text-decoration-none">Medical Shops</Link></li>
              <li className="mb-2"><Link to="/nearby" className="text-secondary text-decoration-none">Nearby Finder</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3">For Medical Shops</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2"><Link to="/register" className="text-secondary text-decoration-none">Register Shop</Link></li>
              <li className="mb-2"><Link to="/owner/dashboard" className="text-secondary text-decoration-none">Owner Dashboard</Link></li>
              <li className="mb-2"><Link to="/owner/inventory" className="text-secondary text-decoration-none">Inventory Control</Link></li>
              <li className="mb-2"><Link to="/owner/low-stock" className="text-secondary text-decoration-none">Low Stock Alerts</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3">MediFinder API Integration</h6>
            <p className="text-secondary small">
              Our REST APIs expose real-time medicine availability, stock counts, batch expiry data, and Haversine distance coordinates for third-party medical aggregators.
            </p>
            <code className="text-info bg-secondary bg-opacity-25 p-2 rounded d-block small mt-2">
              GET /api/search/medicines/
            </code>
          </div>
        </div>

        <hr className="border-secondary my-4" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
          <p className="mb-0">&copy; {new Date().getFullYear()} MedicalShop System. All rights reserved.</p>
          <p className="mb-0">Healthcare & Pharmacy Management Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
