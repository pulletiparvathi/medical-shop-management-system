import React from 'react';

const StatCard = ({ title, value, icon, color = 'blue', subtext = '' }) => {
  return (
    <div className="custom-card p-4 h-100">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="text-muted small fw-semibold text-uppercase tracking-wider mb-1">{title}</div>
          <div className="display-6 fw-bold text-dark">{value}</div>
          {subtext && <div className="small text-muted mt-2">{subtext}</div>}
        </div>
        <div className={`stat-card-icon stat-card-${color}`}>
          <i className={`bi bi-${icon}`}></i>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
