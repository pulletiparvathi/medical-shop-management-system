import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import shopService from '../services/shopService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const NearbyShopsPage = () => {
  // Default coordinates (Hyderabad default center: 17.4938, 78.3984)
  const [lat, setLat] = useState('17.4938');
  const [lon, setLon] = useState('78.3984');
  const [radius, setRadius] = useState('20');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGeoDetected, setIsGeoDetected] = useState(false);

  const fetchNearby = async (latitude, longitude, rad) => {
    setLoading(true);
    try {
      const data = await shopService.getNearbyShops(latitude, longitude, rad);
      setShops(data.data || []);
    } catch (err) {
      console.error('Failed to get nearby shops', err);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby(lat, lon, radius);
  }, []);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude.toFixed(4);
          const userLon = pos.coords.longitude.toFixed(4);
          setLat(userLat);
          setLon(userLon);
          setIsGeoDetected(true);
          fetchNearby(userLat, userLon, radius);
        },
        (err) => {
          alert('Could not retrieve current location. Using manually specified coordinates.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchNearby(lat, lon, radius);
  };

  return (
    <div className="container py-4">
      <div className="custom-card p-4 bg-gradient-card mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div>
            <h2 className="fw-bold text-dark mb-1">
              <i className="bi bi-geo-alt-fill text-danger me-2"></i>Find Nearby Medical Shops
            </h2>
            <p className="text-muted mb-0">Haversine distance calculations for local pharmacy discovery.</p>
          </div>
          <button onClick={handleUseMyLocation} className="btn btn-success rounded-pill px-4 fw-semibold">
            <i className="bi bi-crosshair me-2"></i> Use My Current Location
          </button>
        </div>

        <form onSubmit={handleSubmit} className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label small fw-semibold text-secondary">Latitude</label>
            <input
              type="number"
              step="any"
              className="form-control"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold text-secondary">Longitude</label>
            <input
              type="number"
              step="any"
              className="form-control"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold text-secondary">Max Radius (km)</label>
            <select
              className="form-select"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="20">20 km</option>
              <option value="50">50 km</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary-custom w-100 fw-semibold">
              Find Shops
            </button>
          </div>
        </form>

        {isGeoDetected && (
          <div className="mt-2 text-success small">
            <i className="bi bi-check-circle-fill me-1"></i> Coordinates set from browser GPS.
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Computing geographic distances to nearby pharmacies..." />
      ) : shops.length === 0 ? (
        <div className="text-center py-5 custom-card">
          <i className="bi bi-geo text-muted fs-1 mb-2 d-block"></i>
          <h5 className="fw-bold text-dark">No Nearby Shops Found</h5>
          <p className="text-muted">No active medical shops within {radius} km of ({lat}, {lon}). Try expanding your search radius.</p>
        </div>
      ) : (
        <div className="row g-4">
          {shops.map((shop) => (
            <div key={shop.id} className="col-md-6 col-lg-4">
              <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold text-dark mb-0">{shop.shop_name}</h5>
                    <span className="badge bg-primary fs-6 px-3 py-1 rounded-pill">
                      {shop.distance_km} km away
                    </span>
                  </div>

                  <p className="text-muted small mb-3">
                    <i className="bi bi-geo-alt text-danger me-1"></i>{shop.address}, {shop.area}, {shop.city}
                  </p>

                  <div className="d-flex flex-column gap-2 small text-secondary border-top pt-3 mb-3">
                    <div><i className="bi bi-telephone text-primary me-2"></i>{shop.phone}</div>
                    <div><i className="bi bi-clock text-warning me-2"></i>Hours: {shop.opening_time.slice(0,5)} - {shop.closing_time.slice(0,5)}</div>
                    <div><i className="bi bi-box-seam text-success me-2"></i>Available Stock: <strong>{shop.available_medicines_count} medicines</strong></div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-2">
                  <Link to={`/shops/${shop.id}`} className="btn btn-outline-primary btn-sm rounded-pill w-100 fw-semibold">
                    View Stock
                  </Link>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-light btn-sm rounded-pill border px-3 text-nowrap"
                  >
                    <i className="bi bi-map me-1 text-danger"></i> Map
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyShopsPage;
