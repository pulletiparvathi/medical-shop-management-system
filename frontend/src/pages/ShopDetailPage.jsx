import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import shopService from '../services/shopService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const ShopDetailPage = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const shopRes = await shopService.getShopById(id);
        setShop(shopRes.data);

        const medsRes = await shopService.getShopMedicines(id);
        setMedicines(medsRes.data || []);
      } catch (err) {
        console.error('Error fetching shop details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner text="Fetching pharmacy profile and live inventory..." />;
  if (!shop) return (
    <div className="container py-5 text-center">
      <h3>Shop Not Found</h3>
      <Link to="/shops" className="btn btn-primary rounded-pill mt-2">Back to Shop Directory</Link>
    </div>
  );

  const filteredMedicines = medicines.filter(m => {
    const term = search.toLowerCase();
    const medName = m.medicine_details?.medicine_name?.toLowerCase() || '';
    const brandName = m.medicine_details?.brand_name?.toLowerCase() || '';
    const cat = m.medicine_details?.category?.toLowerCase() || '';
    return medName.includes(term) || brandName.includes(term) || cat.includes(term);
  });

  return (
    <div className="container py-4">
      {/* Shop Profile Banner */}
      <div className="custom-card p-4 mb-4 bg-gradient-card">
        <div className="row g-4 align-items-center">
          <div className="col-md-3 text-center">
            <img
              src={shop.shop_image || 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=500'}
              alt={shop.shop_name}
              className="img-fluid rounded-4 shadow-sm object-fit-cover"
              style={{ maxHeight: 180, width: '100%' }}
            />
          </div>
          <div className="col-md-9">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <h2 className="fw-bold text-dark mb-0">{shop.shop_name}</h2>
              <StatusBadge type="verification" status={shop.is_verified} />
            </div>

            <p className="text-muted mb-3">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i> {shop.address}, {shop.area}, {shop.city} - {shop.pincode}
            </p>

            <div className="row g-3 small text-secondary border-top border-bottom py-3 mb-3">
              <div className="col-sm-6 col-md-3">
                <span className="text-dark fw-semibold d-block">Phone Contact</span>
                <i className="bi bi-telephone text-primary me-1"></i>{shop.phone}
              </div>
              <div className="col-sm-6 col-md-3">
                <span className="text-dark fw-semibold d-block">Opening Hours</span>
                <i className="bi bi-clock text-warning me-1"></i>{shop.opening_time.slice(0,5)} - {shop.closing_time.slice(0,5)}
              </div>
              <div className="col-sm-6 col-md-3">
                <span className="text-dark fw-semibold d-block">Drug License</span>
                <i className="bi bi-file-earmark-text text-info me-1"></i>{shop.license_number}
              </div>
              <div className="col-sm-6 col-md-3">
                <span className="text-dark fw-semibold d-block">Available Stock</span>
                <i className="bi bi-capsule text-success me-1"></i>{shop.available_medicines_count} Active Medicines
              </div>
            </div>

            <p className="small text-muted mb-0">{shop.description}</p>
          </div>
        </div>
      </div>

      {/* Medicine Inventory Table */}
      <div className="custom-card p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <h4 className="fw-bold text-dark mb-0">Live Medicine Inventory</h4>
          <div className="input-group" style={{ maxWidth: 320 }}>
            <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search in shop inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredMedicines.length === 0 ? (
          <div className="text-center py-4 text-muted">
            No active medicine stock matching your search.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Dosage</th>
                  <th>Stock Quantity</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-bold text-dark">{item.medicine_details?.medicine_name}</div>
                      <small className="text-muted">{item.medicine_details?.generic_name}</small>
                    </td>
                    <td>{item.medicine_details?.brand_name}</td>
                    <td><span className="badge bg-light text-dark border">{item.medicine_details?.category}</span></td>
                    <td>{item.medicine_details?.dosage} ({item.medicine_details?.dosage_form})</td>
                    <td className="fw-semibold">{item.quantity} units</td>
                    <td className="fw-bold text-success fs-6">₹{item.price}</td>
                    <td><StatusBadge type="stock" status={item.stock_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDetailPage;
