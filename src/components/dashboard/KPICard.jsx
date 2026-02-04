// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react';

const KPICard = ({ title, value, suffix = '', status = 'success', icon: Icon }) => (
    <div className={`kpi-card ${status}`}>
        <div className="kpi-icon">{Icon && <Icon size={32} />}</div>
        <div className="kpi-content">
            <div className="kpi-value">{value}{suffix}</div>
            <div className="kpi-label">{title}</div>
        </div>
    </div>
);

export default KPICard;
