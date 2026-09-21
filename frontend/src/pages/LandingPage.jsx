import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LandingPage = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/medicines?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-5 text-center position-relative overflow-hidden">
        <div className="container py-5 my-3 position-relative z-1">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <span className="badge bg-white text-primary rounded-pill px-3 py-2 fw-semibold shadow-sm mb-3">
                🏥 Live Medicine & Pharmacy Network
              </span>
              <h1 className="display-4 fw-extrabold mb-3 text-white">
                Find Medicines. Check Availability.<br />
                <span className="text-warning">Locate Nearby Medical Shops.</span>
              </h1>
              <p className="lead opacity-90 mb-4 fs-5 text-white-50">
                Search real-time medicine stock, compare prices across verified pharmacies, and discover nearest open medical shops in your city.
              </p>

              {/* Main Search Bar */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="bg-white p-2 rounded-pill shadow-lg d-flex align-items-center">
                  <i className="bi bi-search text-muted fs-4 ms-3 me-2"></i>
                  <input
                    type="text"
                    className="form-control border-0 shadow-none fs-5 py-2"
                    placeholder="Search medicine by name, generic name, or brand (e.g. Paracetamol, Dolo, Crocin)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary-custom rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-2">
                    <span>Search Medicines</span>
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </form>

              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link to="/medicines" className="btn btn-light rounded-pill px-4 py-2 fw-semibold">
                  <i className="bi bi-capsule me-2 text-primary"></i> Browse Medicine Catalog
                </Link>
                <Link to="/nearby" className="btn btn-warning rounded-pill px-4 py-2 fw-semibold text-dark">
                  <i className="bi bi-geo-alt-fill me-2"></i> Find Nearby Shops
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-2">Why MedicalShop Platform?</h2>
            <p className="text-muted">Designed for patients, medical shop owners, and MediFinder digital integration.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="custom-card p-4 text-center h-100">
                <div className="stat-card-icon stat-card-blue mx-auto mb-3" style={{ width: 64, height: 64, fontSize: '2rem' }}>
                  <i className="bi bi-search"></i>
                </div>
                <h5 className="fw-bold">Real-time Stock Search</h5>
                <p className="text-muted small">
                  Instantly verify medicine quantity and pricing before visiting the pharmacy. No more running shop to shop.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="custom-card p-4 text-center h-100">
                <div className="stat-card-icon stat-card-green mx-auto mb-3" style={{ width: 64, height: 64, fontSize: '2rem' }}>
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <h5 className="fw-bold">Nearby Shop Discovery</h5>
                <p className="text-muted small">
                  Uses Haversine geolocation calculation to list verified medical shops closest to your current location.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="custom-card p-4 text-center h-100">
                <div className="stat-card-icon stat-card-purple mx-auto mb-3" style={{ width: 64, height: 64, fontSize: '2rem' }}>
                  <i className="bi bi-box-seam"></i>
                </div>
                <h5 className="fw-bold">Pharmacy Inventory Suite</h5>
                <p className="text-muted small">
                  Shop owners track minimum stock levels, receive 30/60/90-day batch expiry warnings, and update inventory seamlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MediFinder Integration Callout */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container py-3">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold mb-2">
                🔗 Built for MediFinder Ecosystem
              </span>
              <h2 className="fw-bold mb-3">Location-Aware REST APIs Ready for Integration</h2>
              <p className="text-muted">
                MedicalShop backend provides standardized, high-performance REST APIs allowing external apps like <strong>MediFinder</strong> to query medicine availability, location coordinates, stock levels, and distance metrics in real-time.
              </p>
              <div className="d-flex gap-3 mt-4">
                <Link to="/medicines?q=Paracetamol" className="btn btn-outline-primary rounded-pill px-4">
                  Test MediFinder Search
                </Link>
                <Link to="/register" className="btn btn-primary-custom rounded-pill px-4">
                  Register Your Pharmacy
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="bg-dark text-white p-4 rounded-4 shadow">
                <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-3">
                  <small className="text-warning fw-mono">GET /api/search/medicines/?q=paracetamol</small>
                  <span className="badge bg-success">200 OK</span>
                </div>
                <pre className="text-info small mb-0 font-monospace" style={{ fontSize: '0.8rem' }}>
{`{
  "success": true,
  "data": [{
    "medicine_name": "Paracetamol 500mg",
    "shops": [{
      "shop_name": "Sri Sai Medicals",
      "quantity": 120,
      "price": 25.0,
      "distance_km": 0.8
    }]
  }]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
