import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import shopService from '../services/shopService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const ShopListPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pincode, setPincode] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const fetchShops = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      if (pincode) params.pincode = pincode;
      if (cityFilter) params.city = cityFilter;

      const data = await shopService.getShops(params);
      setShops(data.data || []);
    } catch (err) {
      console.error('Failed to fetch shops', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [cityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShops();
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Registered Medical Shops</h2>
          <p className="text-muted mb-0">Browse verified pharmacies and check medicine availability by location & pincode.</p>
        </div>
        <Link to="/nearby" className="btn btn-warning rounded-pill px-4 fw-semibold text-dark">
          <i className="bi bi-geo-alt-fill me-2"></i> Find Nearby Shops
        </Link>
      </div>

      {/* Filters */}
      <div className="custom-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search shop name or area (e.g. KPHB, Apollo)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><i className="bi bi-geo-alt text-danger"></i></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Pincode (e.g. 500072)..."
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="">All Cities</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Secunderabad">Secunderabad</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary-custom w-100">Filter</button>
          </div>
        </form>

        <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
          <span className="small text-muted fw-semibold">Quick Pincodes:</span>
          {['500072', '500049', '500032', '500081'].map((pin) => (
            <button
              key={pin}
              type="button"
              onClick={() => { setPincode(pin); fetchShops(); }}
              className={`btn btn-sm rounded-pill px-3 ${pincode === pin ? 'btn-primary' : 'btn-outline-primary'}`}
            >
              {pin}
            </button>
          ))}
          {(search || pincode || cityFilter) && (
            <button
              type="button"
              onClick={() => { setSearch(''); setPincode(''); setCityFilter(''); fetchShops(); }}
              className="btn btn-sm btn-link text-danger text-decoration-none ms-auto"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading medical shop listings..." />
      ) : shops.length === 0 ? (
        <div className="text-center py-5 custom-card">
          <i className="bi bi-shop text-muted fs-1 mb-2 d-block"></i>
          <h5 className="fw-bold text-dark">No Shops Found</h5>
          <p className="text-muted">No registered medical shops matched pincode {pincode || search}.</p>
        </div>
      ) : (
        <div className="row g-4">
          {shops.map((shop) => (
            <div key={shop.id} className="col-md-6 col-lg-4">
              <div className="custom-card h-100 d-flex flex-column justify-content-between overflow-hidden">
                <div>
                  <div className="position-relative" style={{ height: 160, backgroundColor: '#e2e8f0' }}>
                    <img
                      src={shop.shop_image || 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=500'}
                      alt={shop.shop_name}
                      className="w-100 h-100 object-fit-cover"
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <StatusBadge type="verification" status={shop.is_verified} />
                    </div>
                  </div>

                  <div className="p-4">
                    <h5 className="fw-bold text-dark mb-1">{shop.shop_name}</h5>
                    <p className="text-muted small mb-2">
                      <i className="bi bi-geo-alt text-danger me-1"></i>
                      {shop.address}, {shop.area}, {shop.city} - <strong>{shop.pincode}</strong>
                    </p>
                    <p className="small text-secondary line-clamp-2 mb-3">
                      {shop.description || 'Verified pharmacy equipped with prescription medicines and healthcare products.'}
                    </p>

                    <div className="d-flex flex-column gap-1 small text-muted border-top pt-2">
                      <div><i className="bi bi-telephone text-primary me-2"></i>{shop.phone}</div>
                      <div><i className="bi bi-clock text-warning me-2"></i>Hours: {shop.opening_time.slice(0,5)} - {shop.closing_time.slice(0,5)}</div>
                      <div><i className="bi bi-box-seam text-success me-2"></i>Available Stock: <strong>{shop.available_medicines_count} items</strong></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link to={`/shops/${shop.id}`} className="btn btn-outline-primary w-100 rounded-pill fw-semibold">
                    View Shop & Inventory
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopListPage;
