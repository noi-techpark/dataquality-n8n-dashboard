// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './AttributeCompletenessTable.css';

const AttributeCompletenessTable = ({ data }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'completeness', direction: 'desc' });
    const [showAll, setShowAll] = useState(false);

    // Use the pre-calculated field completeness data from n8n
    const completenessData = data?.fieldCompleteness || [];

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedData = [...completenessData].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const modifier = sortConfig.direction === 'asc' ? 1 : -1;
        return aVal > bVal ? modifier : -modifier;
    });

    const displayData = sortedData;

    const getCompletenessColor = (completeness) => {
        if (completeness >= 90) return '#10b981';
        if (completeness >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <ChevronDown size={14} className="sort-icon inactive" />;
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} className="sort-icon active" />
            : <ChevronDown size={14} className="sort-icon active" />;
    };

    if (!completenessData.length) {
        return (
            <div className="completeness-table-container">
                <h3 className="table-title">Field-Level Completeness</h3>
                <p className="no-data-message">No completeness data available</p>
            </div>
        );
    }

    return (
        <div className="completeness-table-container">
            <div className="table-header-row">
                <h3 className="table-title">Field-Level Completeness Analysis</h3>
                <span className="table-subtitle">Analyzed {displayData.length} total fields</span>
            </div>

            <div className="table-wrapper">
                <table className="completeness-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')} className="sortable">
                                Field Name <SortIcon column="name" />
                            </th>
                            <th onClick={() => handleSort('completeness')} className="sortable">
                                Completeness <SortIcon column="completeness" />
                            </th>
                            <th>Visual</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((field, index) => (
                            <tr key={index}>
                                <td className="field-name">{field.name}</td>
                                <td className="completeness-value">
                                    <span style={{ color: getCompletenessColor(field.completeness) }}>
                                        {(field.completeness || 0).toFixed(2)}%
                                    </span>
                                </td>
                                <td className="visual-cell">
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${field.completeness}%`,
                                                backgroundColor: getCompletenessColor(field.completeness)
                                            }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttributeCompletenessTable;
