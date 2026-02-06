// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react';
import { Loader2 } from 'lucide-react';
import { STATUS_COLORS } from '../../utils/constants';

const LoadingOverlay = ({ progress, isCompact }) => (
    <div className={`loading-overlay ${isCompact ? 'compact' : ''}`}>
        {!isCompact && <Loader2 className="loading-spinner" size={48} color={STATUS_COLORS.primary} />}
        <div className="loading-text">
            {isCompact ? `Updating dashboard... (${progress}%)` : 'Analyzing data quality...'}
        </div>
        {progress !== undefined && (
            <div className="progress-container">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {!isCompact && <div className="progress-percentage">{progress}%</div>}
            </div>
        )}
    </div>
);

export default LoadingOverlay;
