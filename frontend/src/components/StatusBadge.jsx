import React from 'react';

const StatusBadge = ({ type, status }) => {
  if (type === 'stock') {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="badge-status badge-available">
            <i className="bi bi-check-circle-fill"></i> Available
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="badge-status badge-low-stock">
            <i className="bi bi-exclamation-triangle-fill"></i> Low Stock
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="badge-status badge-out-of-stock">
            <i className="bi bi-x-circle-fill"></i> Out of Stock
          </span>
        );
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  }

  if (type === 'verification') {
    return status ? (
      <span className="badge-status badge-verified">
        <i className="bi bi-patch-check-fill text-primary"></i> Verified
      </span>
    ) : (
      <span className="badge-status badge-pending">
        <i className="bi bi-clock-history text-warning"></i> Pending Approval
      </span>
    );
  }

  if (type === 'active') {
    return status ? (
      <span className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1 rounded-pill">Active</span>
    ) : (
      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-2 py-1 rounded-pill">Disabled</span>
    );
  }

  return <span className="badge bg-secondary">{status}</span>;
};

export default StatusBadge;
