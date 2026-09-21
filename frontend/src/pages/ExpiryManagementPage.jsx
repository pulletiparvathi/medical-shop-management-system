import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../services/inventoryService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const ExpiryManagementPage = () => {
  const [timeframe, setTimeframe] = useState('30'); // 'expired', '30', '60', '90'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpiring = async (tf) => {
    setLoading(true);
    try {
      const data = await inventoryService.getExpiring(tf);
      setItems(data.data || []);
    } catch (err) {
      console.error('Failed to load expiring medicines', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiring(timeframe);
  }, [timeframe]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-calendar-event text-danger me-2"></i>Batch Expiry Management System
          </h2>
          <p className="text-muted mb-0">Monitor batch expiration warnings and prevent expired medicines from entering customer search.</p>
        </div>
        <div className="d-flex gap-2">
          {[
            { label: 'Expired Items', val: 'expired', btnClass: 'btn-outline-danger' },
            { label: 'Expiring in 30 Days', val: '30', btnClass: 'btn-outline-warning' },
            { label: 'Expiring in 60 Days', val: '60', btnClass: 'btn-outline-secondary' },
            { label: 'Expiring in 90 Days', val: '90', btnClass: 'btn-outline-secondary' },
          ].map((t) => (
            <button
              key={t.val}
              onClick={() => setTimeframe(t.val)}
              className={`btn btn-sm rounded-pill px-3 ${timeframe === t.val ? 'btn-dark fw-bold' : t.btnClass}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warning Box */}
      <div className="alert alert-warning p-3 rounded-3 mb-4 d-flex align-items-center gap-3">
        <i className="bi bi-exclamation-triangle-fill fs-3 text-warning"></i>
        <div>
          <h6 className="fw-bold mb-1">Expiry Compliance Notice</h6>
          <small className="text-dark">
            Expired medicines are automatically suppressed from live inventory and customer search results to ensure full regulatory compliance.
          </small>
        </div>
      </div>

      <div className="custom-card p-4">
        {loading ? (
          <LoadingSpinner text="Scanning batch expiry dates..." />
        ) : items.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-shield-check text-success fs-1 mb-2 d-block"></i>
            <h5>No batch expiry warnings found for selected filter ({timeframe === 'expired' ? 'Expired' : `${timeframe} days`}).</h5>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Batch No</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Expiry Date</th>
                  <th>Days Remaining</th>
                  <th>Action Warning</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-bold text-dark">{item.medicine_details?.medicine_name}</div>
                      <small className="text-muted">{item.medicine_details?.brand_name}</small>
                    </td>
                    <td><small className="text-muted fw-mono">{item.batch_number}</small></td>
                    <td className="fw-bold">{item.quantity} units</td>
                    <td className="fw-semibold">₹{item.price}</td>
                    <td className="fw-bold text-danger">{item.expiry_date}</td>
                    <td>
                      {item.is_expired ? (
                        <span className="badge bg-danger text-white">Expired {Math.abs(item.days_until_expiry)} days ago</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Expires in {item.days_until_expiry} days</span>
                      )}
                    </td>
                    <td>
                      <div className="small text-danger fw-semibold">
                        ⚠️ {item.medicine_details?.medicine_name} ({item.batch_number}) expires in {item.days_until_expiry} days.
                      </div>
                    </td>
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

export default ExpiryManagementPage;
