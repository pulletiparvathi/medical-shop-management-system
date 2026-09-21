import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import shopService from '../services/shopService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const ShopProfilePage = () => {
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    shop_name: '',
    license_number: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    latitude: 17.4938,
    longitude: 78.3984,
    opening_time: '08:00',
    closing_time: '22:00',
    description: '',
    shop_image: '',
  });

  useEffect(() => {
    const fetchShopProfile = async () => {
      setLoading(true);
      try {
        const res = await shopService.getMyShops();
        const shops = res.data || [];
        if (shops.length > 0) {
          const myShop = shops[0];
          setShop(myShop);
          setFormData({
            shop_name: myShop.shop_name,
            license_number: myShop.license_number,
            phone: myShop.phone,
            email: myShop.email,
            address: myShop.address,
            area: myShop.area,
            city: myShop.city,
            state: myShop.state,
            pincode: myShop.pincode,
            latitude: myShop.latitude,
            longitude: myShop.longitude,
            opening_time: myShop.opening_time.slice(0, 5),
            closing_time: myShop.closing_time.slice(0, 5),
            description: myShop.description || '',
            shop_image: myShop.shop_image || '',
          });
        }
      } catch (err) {
        console.error('Failed to load shop profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (shop) {
        await shopService.updateShop(shop.id, formData);
        alert('Shop profile updated successfully!');
      } else {
        await shopService.createShop(formData);
        alert('Shop profile registered successfully! Pending admin verification.');
      }
      navigate('/owner/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save shop profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching medical shop profile..." />;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="custom-card p-4 p-md-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
              <div>
                <h3 className="fw-bold text-dark mb-1">
                  <i className="bi bi-shop text-primary me-2"></i>
                  {shop ? 'Medical Shop Profile' : 'Register New Medical Shop'}
                </h3>
                <p className="text-muted mb-0">Update pharmacy contact, operating hours, and location coordinates.</p>
              </div>

              {shop && <StatusBadge type="verification" status={shop.is_verified} />}
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Medical Shop Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Drug License Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    required
                    disabled={!!shop} // Fixed upon initial registration
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Street Address</label>
                  <textarea
                    rows="2"
                    className="form-control"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Area / Locality</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. KPHB / Kukatpally"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Latitude Coordinate</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Longitude Coordinate</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Opening Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.opening_time}
                    onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Closing Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.closing_time}
                    onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Shop Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.shop_image}
                    onChange={(e) => setFormData({ ...formData, shop_image: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Description & Services</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="btn btn-primary-custom btn-lg w-100 fw-bold mt-4" disabled={saving}>
                {saving ? 'Saving Profile...' : shop ? 'Update Shop Profile' : 'Register Medical Shop'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopProfilePage;
