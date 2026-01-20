import React from 'react';
import { Loader2 } from 'lucide-react';
import { STATUS_COLORS } from '../../utils/constants';

const LoadingOverlay = () => (
    <div className="loading-overlay">
        <Loader2 className="loading-spinner" size={48} color={STATUS_COLORS.primary} />
        <div className="loading-text">Analyzing data quality...</div>
    </div>
);

export default LoadingOverlay;
