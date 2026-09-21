import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import inventoryService from '../services/inventoryService';
import medicineService from '../services/medicineService';
import shopService from '../services/shopService';

const AddEditInventoryPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    shop: '',
    medicine: '',
    quantity: 50,
    price: 25.0,
    batch_number: `BATCH-${Math.floor(100 + Math.random() * 900)}`,
    expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minimum_stock_level: 10,
  });

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const myShopsRes = await shopService.getMyShops();
        const userShops = myShopsRes.data || [];
        setShops(userShops);

        const medRes = await medicineService.getMedicines();
        setMedicines(medRes.data || []);

        if (userShops.length > 0 && !formData.shop) {
          setFormData((prev) => ({ ...prev, shop: userShops[0].id }));
        }

        if (isEdit) {
          const invRes = await inventoryService.getInventoryById(id);
          const item = invRes.data;
          setFormData({
            shop: item.shop,
            medicine: item.medicine,
            quantity: item.quantity,
            price: item.price,
            batch_number: item.batch_number,
            expiry_date: item.expiry_date,
            minimum_stock_level: item.minimum_stock_level,
          });
        }
      } catch (err) {
        console.error('Failed to load form prerequisites', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.quantity < 0) {
      setError('Quantity cannot be negative.');
      return;
    }

    if (formData.price <= 0) {
      setError('Price must be greater than zero.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await inventoryService.updateInventory(id, formData);
        alert('Inventory record updated successfully!');
      } else {
        await inventoryService.createInventory(formData);
        alert('Medicine stock added to inventory successfully!');
      }
      navigate('/owner/inventory');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save inventory item. Verify form inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5">Loading inventory editor...</div>;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="custom-card p-4 p-md-5">
            <h3 className="fw-bold text-dark mb-4">
              <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-circle'} text-primary me-2`}></i>
              {isEdit ? 'Edit Inventory Item' : 'Add Medicine to Inventory'}
            </h3>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Medical Shop</label>
                  <select
                    className="form-select"
                    value={formData.shop}
                    onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
                    required
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>{s.shop_name} ({s.area})</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Select Medicine Master Record</label>
                  <select
                    className="form-select"
                    value={formData.medicine}
                    onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Master Medicine --</option>
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.medicine_name} ({m.brand_name}) - {m.dosage} {m.dosage_form}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    required
                  />
                  <div className="form-text">Set 0 for out of stock.</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Price per Pack/Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Batch Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Expiry Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Minimum Stock Limit</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.minimum_stock_level}
                    onChange={(e) => setFormData({ ...formData, minimum_stock_level: parseInt(e.target.value) || 10 })}
                    required
                  />
                  <div className="form-text">Triggers Low Stock alert when quantity falls below this limit.</div>
                </div>
              </div>

              <div className="d-flex gap-3 justify-content-end mt-4 pt-3 border-top">
                <button type="button" onClick={() => navigate('/owner/inventory')} className="btn btn-light rounded-pill px-4">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary-custom rounded-pill px-5 fw-bold" disabled={saving}>
                  {saving ? 'Saving...' : isEdit ? 'Update Stock' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditInventoryPage;
