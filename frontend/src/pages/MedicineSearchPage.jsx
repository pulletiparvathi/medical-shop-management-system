import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import inventoryService from '../services/inventoryService';
import LoadingSpinner from '../components/LoadingSpinner';

const MedicineSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialPincode = searchParams.get('pincode') || '';

  const [query, setQuery] = useState(initialQuery);
  const [pincode, setPincode] = useState(initialPincode);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [maxDistance, setMaxDistance] = useState('all');

  // Default coordinates (Hyderabad center: 17.4938, 78.3984)
  const [location, setLocation] = useState({
    lat: 17.4938,
    lon: 78.3984,
    isGps: false,
    label: 'Standard Reference Center (Hyderabad)'
  });

  const executeSearch = async (searchTerm = query, pincodeTerm = pincode, lat = location.lat, lon = location.lon) => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await inventoryService.searchMedicinesMediFinder(
        searchTerm,
        pincodeTerm,
        lat,
        lon
      );
      setResults(data.data || []);
    } catch (err) {
      console.error('Search error', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Detect GPS Location on initial load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gpsLat = pos.coords.latitude;
          const gpsLon = pos.coords.longitude;
          const newLoc = {
            lat: gpsLat,
            lon: gpsLon,
            isGps: true,
            label: `GPS Location (${gpsLat.toFixed(3)}, ${gpsLon.toFixed(3)})`
          };
          setLocation(newLoc);
          executeSearch(initialQuery, initialPincode, gpsLat, gpsLon);
        },
        () => {
          // Fallback to default
          executeSearch(initialQuery, initialPincode, location.lat, location.lon);
        },
        { timeout: 5000 }
      );
    } else {
      executeSearch(initialQuery, initialPincode, location.lat, location.lon);
    }
  }, [initialQuery, initialPincode]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (query) newParams.q = query;
    if (pincode) newParams.pincode = pincode;
    setSearchParams(newParams);
    executeSearch(query, pincode, location.lat, location.lon);
  };

  const handleClearFilters = () => {
    setQuery('');
    setPincode('');
    setMaxDistance('all');
    setSearchParams({});
    executeSearch('', '', location.lat, location.lon);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gpsLat = pos.coords.latitude;
          const gpsLon = pos.coords.longitude;
          const newLoc = {
            lat: gpsLat,
            lon: gpsLon,
            isGps: true,
            label: `GPS Location (${gpsLat.toFixed(3)}, ${gpsLon.toFixed(3)})`
          };
          setLocation(newLoc);
          executeSearch(query, pincode, gpsLat, gpsLon);
        },
        () => {
          alert('Could not access your GPS location. Using standard city reference coordinates.');
        }
      );
    }
  };

  // Quick medicine search chips
  const POPULAR_MEDICINES = ['Paracetamol', 'Dolo 650', 'Azithromycin', 'Cetirizine', 'Amoxicillin', 'Pantoprazole'];

  return (
    <div className="container py-4">
      {/* Search Header Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="custom-card p-4 bg-gradient-card">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
              <div>
                <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                  <span>💊</span> Find Medicines & Nearby Shops
                </h2>
                <p className="text-muted mb-0">
                  Search medicine availability, compare pharmacy prices, and see exact distances to nearby open shops.
                </p>
              </div>

              {/* Location Status Pill */}
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${location.isGps ? 'bg-success' : 'bg-primary'} px-3 py-2 rounded-pill d-flex align-items-center gap-1 shadow-sm`}>
                  <i className="bi bi-geo-alt-fill"></i>
                  <span>{location.isGps ? 'Using Your GPS Location' : 'Default Area (Hyderabad)'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="btn btn-sm btn-outline-dark rounded-pill px-3 fw-semibold"
                  title="Detect live GPS coordinates"
                >
                  <i className="bi bi-crosshair me-1"></i> Detect GPS
                </button>
              </div>
            </div>

            {/* Main Search Form */}
            <form onSubmit={handleFormSubmit} className="mt-3">
              <div className="row g-2 align-items-center">
                <div className="col-lg-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-search text-primary fs-5"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 fs-6 py-2"
                      placeholder="Enter Medicine Name, Generic Name, or Brand (e.g. Paracetamol, Dolo 650)..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-lg-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-geo-alt-fill text-danger"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 fs-6 py-2"
                      placeholder="Pincode (e.g. 500072)..."
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-lg-3 d-flex gap-2">
                  <button type="submit" className="btn btn-primary-custom w-100 fw-bold py-2 shadow-sm">
                    <i className="bi bi-search me-1"></i> Search Stock
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Popular Chips & Distance Filters */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mt-3 pt-3 border-top gap-2">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="small text-muted fw-bold">Popular Searches:</span>
                {POPULAR_MEDICINES.map((medName) => (
                  <button
                    key={medName}
                    type="button"
                    onClick={() => {
                      setQuery(medName);
                      setSearchParams({ q: medName, pincode });
                      executeSearch(medName, pincode, location.lat, location.lon);
                    }}
                    className={`btn btn-sm rounded-pill px-3 py-1 ${query.toLowerCase() === medName.toLowerCase() ? 'btn-primary' : 'btn-outline-secondary'}`}
                  >
                    {medName}
                  </button>
                ))}
              </div>

              {/* Distance Radius Filter */}
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted fw-bold">Max Distance:</span>
                <select
                  className="form-select form-select-sm rounded-pill shadow-sm"
                  style={{ width: '130px' }}
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                >
                  <option value="all">All Distances</option>
                  <option value="2">Within 2 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                </select>
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-between mt-2">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="small text-muted fw-bold">Quick Pincodes:</span>
                {['500072 (KPHB)', '500049 (Miyapur)', '500032 (Gachibowli)'].map((tag) => {
                  const pin = tag.split(' ')[0];
                  return (
                    <button
                      key={pin}
                      type="button"
                      onClick={() => {
                        setPincode(pin);
                        setSearchParams({ q: query, pincode: pin });
                        executeSearch(query, pin, location.lat, location.lon);
                      }}
                      className={`btn btn-sm rounded-pill px-3 py-0 ${pincode === pin ? 'btn-danger' : 'btn-outline-danger'}`}
                      style={{ fontSize: '0.8rem' }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {(query || pincode || maxDistance !== 'all') && (
                <button type="button" onClick={handleClearFilters} className="btn btn-sm btn-link text-danger text-decoration-none">
                  <i className="bi bi-x-circle me-1"></i> Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <LoadingSpinner text="Searching pharmacies for available stock and computing exact distances..." />
      ) : searched && results.length === 0 ? (
        <div className="text-center py-5 custom-card p-5">
          <i className="bi bi-exclamation-circle text-muted display-3 mb-3 d-block"></i>
          <h4 className="fw-bold text-dark">No Available Medicines Found</h4>
          <p className="text-muted">
            No verified medical shop {pincode ? `in pincode ${pincode}` : 'in the platform'} currently has matching available stock for your query.
          </p>
          <button onClick={handleClearFilters} className="btn btn-outline-primary rounded-pill mt-2 px-4">
            View All Available Medicines
          </button>
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">
              Showing {results.length} Available Medicine Records {pincode && `in Pincode ${pincode}`}
            </h5>
            <span className="text-muted small">Pharmacies automatically ordered by nearest distance</span>
          </div>

          <div className="row g-4">
            {results.map((med) => {
              // Filter shops by max distance if selected
              const filteredShops = med.shops.filter((s) => {
                if (maxDistance === 'all') return true;
                const limit = parseFloat(maxDistance);
                return s.distance_km !== null && s.distance_km <= limit;
              });

              if (filteredShops.length === 0) return null;

              return (
                <div key={med.medicine_id} className="col-12">
                  <div className="custom-card p-4 shadow-sm border-0">
                    {/* Medicine Header */}
                    <div className="d-flex flex-wrap justify-content-between align-items-start border-bottom pb-3 mb-3 gap-2">
                      <div>
                        <span className="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-1 rounded-pill fw-semibold">
                          {med.category}
                        </span>
                        <h3 className="fw-bold text-dark mb-1">{med.medicine_name}</h3>
                        <div className="text-muted small">
                          <span className="fw-bold text-dark">Generic:</span> {med.generic_name} |{' '}
                          <span className="fw-bold text-dark">Brand:</span> {med.brand_name} |{' '}
                          <span className="fw-bold text-dark">Dosage:</span> {med.dosage} ({med.dosage_form})
                        </div>
                      </div>
                      <div className="text-end">
                        {med.prescription_required ? (
                          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold shadow-sm">
                            <i className="bi bi-file-earmark-medical me-1"></i> Prescription Required
                          </span>
                        ) : (
                          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-semibold">
                            <i className="bi bi-check-circle me-1"></i> OTC Medicine
                          </span>
                        )}
                        <div className="small text-muted mt-1">Mfr: {med.manufacturer}</div>
                      </div>
                    </div>

                    {/* Nearby Shops Header */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-shop text-primary fs-5"></i>
                        <span>Available Nearby Pharmacies Stocking This Medicine ({filteredShops.length}):</span>
                      </h6>
                      <span className="badge bg-light text-dark border">Sorted by distance</span>
                    </div>

                    {/* Shops Grid */}
                    <div className="row g-3">
                      {filteredShops.map((s, idx) => (
                        <div key={idx} className="col-md-6 col-lg-4">
                          <div className={`p-3 border rounded-3 bg-white h-100 d-flex flex-column justify-content-between shadow-sm position-relative ${idx === 0 ? 'border-primary border-2' : ''}`}>
                            
                            {/* Closest Pharmacy Badge */}
                            {idx === 0 && (
                              <div className="position-absolute top-0 end-0 translate-middle-y me-2">
                                <span className="badge bg-primary text-white shadow-sm px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                  🌟 Nearest Shop
                                </span>
                              </div>
                            )}

                            <div>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="fw-bold text-primary mb-1">{s.shop_name}</h6>
                                  <span className="badge bg-secondary-subtle text-secondary border mt-1" style={{ fontSize: '0.75rem' }}>
                                    PIN: {s.pincode}
                                  </span>
                                </div>
                                <div className="text-end">
                                  <span className="fs-5 fw-bold text-success">₹{s.price}</span>
                                  <div className="small text-muted">per unit</div>
                                </div>
                              </div>

                              <p className="text-muted small mb-2">
                                <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
                                {s.address}, {s.area}, {s.city}
                              </p>

                              <div className="d-flex flex-column gap-1 small text-secondary mb-3">
                                <div>
                                  <i className="bi bi-telephone text-primary me-2"></i>
                                  <a href={`tel:${s.phone}`} className="text-decoration-none text-secondary fw-medium">
                                    {s.phone}
                                  </a>
                                </div>
                                <div>
                                  <i className="bi bi-clock text-warning me-2"></i>
                                  <span>Hours: {s.opening_time.slice(0,5)} - {s.closing_time.slice(0,5)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Distance & Stock Footer */}
                            <div className="pt-2 border-top">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                  <span className="fw-bold text-dark">{s.quantity} units</span> in stock
                                </div>
                                {s.distance_km !== null && (
                                  <span className="badge bg-success text-white px-2 py-1 rounded-pill fw-semibold">
                                    📍 {s.distance_km} km away
                                  </span>
                                )}
                              </div>

                              <div className="d-flex gap-2 mt-2">
                                <Link to={`/shops/${s.shop_id}`} className="btn btn-sm btn-outline-primary rounded-pill w-100 fw-semibold">
                                  View Pharmacy
                                </Link>
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm btn-light border rounded-pill px-3 text-nowrap"
                                  title="Open Google Maps Directions"
                                >
                                  <i className="bi bi-map text-danger me-1"></i> Maps
                                </a>
                              </div>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineSearchPage;

