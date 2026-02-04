// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react';
import { Database, Loader2, TrendingUp } from 'lucide-react';
import DatasetSelector from './DatasetSelector';

const ControlsPanel = ({
    datasets,
    datasetsLoading,
    selectedDataset,
    setSelectedDataset,
    customUrl,
    setCustomUrl,
    useCustomUrl,
    setUseCustomUrl,
    loading,
    onGenerate
}) => {
    const isGenerateDisabled = loading || datasetsLoading ||
        (!useCustomUrl && !selectedDataset) || (useCustomUrl && !customUrl);

    return (
        <div className="controls-panel">
            <div className="controls-title">
                <Database size={24} />
                Data Source Configuration {!datasetsLoading && `(${datasets.length} datasets available)`}
            </div>

            <div className="radio-group">
                <label className="radio-label">
                    <input
                        type="radio"
                        checked={!useCustomUrl}
                        onChange={() => setUseCustomUrl(false)}
                    />
                    Use Predefined Dataset
                </label>
                <label className="radio-label">
                    <input
                        type="radio"
                        checked={useCustomUrl}
                        onChange={() => setUseCustomUrl(true)}
                    />
                    Custom API URL
                </label>
            </div>

            <div className="data-source-group">
                {!useCustomUrl ? (
                    <DatasetSelector
                        datasets={datasets}
                        value={selectedDataset}
                        onChange={(e) => setSelectedDataset(e.target.value)}
                        disabled={loading || datasetsLoading}
                    />
                ) : (
                    <div className="input-wrapper">
                        <input
                            type="text"
                            placeholder="Enter API URL (e.g., https://api.example.com/data)"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                )}

                <button
                    className="generate-btn"
                    onClick={onGenerate}
                    disabled={isGenerateDisabled}
                >
                    {loading ? (
                        <>
                            <Loader2 className="loading-spinner" size={20} />
                            Generating...
                        </>
                    ) : (
                        <>
                            <TrendingUp size={20} />
                            Generate Report
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ControlsPanel;
