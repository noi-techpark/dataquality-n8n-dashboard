import React from 'react';
import { Database } from 'lucide-react';

const EmptyState = () => (
    <div className="empty-state">
        <div className="empty-state-icon">
            <Database size={64} />
        </div>
        <h3>No Data Yet</h3>
        <p>Select a dataset and click "Generate Report" to begin analysis</p>
    </div>
);

export default EmptyState;
