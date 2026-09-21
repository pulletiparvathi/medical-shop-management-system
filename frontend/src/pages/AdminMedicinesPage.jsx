import React, { useState, useEffect } from 'react';
import medicineService from '../services/medicineService';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminMedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    medicine_name: '',
    generic_name: '',
    brand_name: '',
    category: 'Pain Relief',
    dosage: '500mg',
    dosage_form: 'Tablet',
    manufacturer: '',
    description: '',
    prescription_required: false,
  });

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await medicineService.getMedicines({ q: search });
      setMedicines(res.data || []);
    } catch (err) {
      console.error('Failed to load master medicines catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await medicineService.createMedicine(formData);
      alert('Master medicine record created successfully!');
      setShowModal(false);
      fetchMedicines();
    } catch (err) {
      alert('Failed to create medicine record');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Master Medicine Catalog</h2>
          <p className="text-muted mb-0">Centralized database of medicines available for shop inventory selection.</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary-custom rounded-pill px-4 fw-semibold">
          <i className="bi bi-plus-lg me-1"></i> Add Master Medicine
        </button>
      </div>

      <div className="custom-card p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Filter catalog by medicine name, generic name, brand, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="custom-card p-4">
        {loading ? (
          <LoadingSpinner text="Fetching master medicine database..." />
        ) : medicines.length === 0 ? (
          <div className="text-center py-4 text-muted">No medicines found in master catalog.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Generic Name</th>
                  <th>Brand Name</th>
                  <th>Category</th>
                  <th>Dosage</th>
                  <th>Manufacturer</th>
                  <th>Prescription</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m) => (
                  <tr key={m.id}>
                    <td className="fw-bold text-dark">{m.medicine_name}</td>
                    <td>{m.generic_name}</td>
                    <td>{m.brand_name}</td>
                    <td><span className="badge bg-light text-dark border">{m.category}</span></td>
                    <td>{m.dosage} ({m.dosage_form})</td>
                    <td><small className="text-muted">{m.manufacturer}</small></td>
                    <td>
                      {m.prescription_required ? (
                        <span className="badge bg-warning text-dark">Rx Required</span>
                      ) : (
                        <span className="badge bg-success bg-opacity-10 text-success">OTC</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Master Medicine Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content custom-card border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add New Master Medicine</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Medicine Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Paracetamol 500mg"
                        value={formData.medicine_name}
                        onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Generic Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Paracetamol"
                        value={formData.generic_name}
                        onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Brand Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Crocin"
                        value={formData.brand_name}
                        onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Pain Relief / Antibiotics"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Dosage</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 500mg"
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Dosage Form</label>
                      <select
                        className="form-select"
                        value={formData.dosage_form}
                        onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
                      >
                        <option value="Tablet">Tablet</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Injection">Injection</option>
                        <option value="Ointment">Ointment</option>
                        <option value="Drops">Drops</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Manufacturer</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Cipla / Sun Pharma"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea
                        rows="2"
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="rxCheck"
                          checked={formData.prescription_required}
                          onChange={(e) => setFormData({ ...formData, prescription_required: e.target.checked })}
                        />
                        <label className="form-check-label small" htmlFor="rxCheck">
                          Prescription Required (Doctor Rx Needed)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light rounded-pill" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom rounded-pill px-4">Create Master Record</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedicinesPage;
