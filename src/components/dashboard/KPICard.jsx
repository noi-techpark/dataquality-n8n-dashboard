import React from 'react';

const KPICard = ({ title, value, suffix = '', isGood = true, icon: Icon }) => (
    <div className={`kpi-card ${isGood ? 'good' : 'warning'}`}>
        <div className="kpi-icon">{Icon && <Icon size={32} />}</div>
        <div className="kpi-content">
            <div className="kpi-value">{value}{suffix}</div>
            <div className="kpi-label">{title}</div>
        </div>
    </div>
);

export default KPICard;
