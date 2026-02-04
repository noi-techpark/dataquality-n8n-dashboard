// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react';
import { CheckCircle, Database, TrendingUp, AlertCircle } from 'lucide-react';
import KPICard from './KPICard';

const KPISection = ({ data }) => {
    if (!data?.kpis) {
        return null;
    }

    const getStatus = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'danger';
    };

    return (
        <div className="kpi-grid">
            <KPICard
                title="Overall Quality"
                value={data.kpis.qualityScore}
                suffix="/100"
                status={getStatus(data.kpis.qualityScore)}
                icon={CheckCircle}
            />
            <KPICard
                title="Total Records"
                value={data.kpis.totalRecords.toLocaleString()}
                status="success"
                icon={Database}
            />
            <KPICard
                title="Completeness"
                value={data.kpis.completenessScore}
                suffix="%"
                status={getStatus(data.kpis.completenessScore)}
                icon={TrendingUp}
            />
            <KPICard
                title="Critical Fields"
                value={data.kpis.criticalFields}
                status={data.kpis.criticalFields > 0 ? 'danger' : 'success'}
                icon={AlertCircle}
            />
        </div>
    );
};

export default KPISection;
