import React from 'react';
import { CheckCircle, Database, TrendingUp, AlertCircle } from 'lucide-react';
import KPICard from './KPICard';

const KPISection = ({ data }) => (
    <div className="kpi-grid">
        <KPICard
            title="Overall Quality"
            value={data.kpis.qualityScore}
            suffix="/100"
            isGood={data.kpis.qualityScore >= 80}
            icon={CheckCircle}
        />
        <KPICard
            title="Total Records"
            value={data.kpis.totalRecords.toLocaleString()}
            isGood={true}
            icon={Database}
        />
        <KPICard
            title="Completeness"
            value={data.kpis.completenessScore}
            suffix="%"
            isGood={data.kpis.completenessScore >= 80}
            icon={TrendingUp}
        />
        <KPICard
            title="Fields with Issues"
            value={data.kpis.fieldsWithMissing}
            isGood={false}
            icon={AlertCircle}
        />
    </div>
);

export default KPISection;
