// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../utils/auth';
import { API_CONFIG } from '../utils/constants';
import { useFetchDatasets } from '../hooks/useDatasets';
import { createAnalysisState, processChunk, generateFinalReport, generateEmptyReport } from '../utils/analysis';

// Components
import LoadingOverlay from '../components/common/LoadingOverlay.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ControlsPanel from '../components/dashboard/ControlsPanel.jsx';
import KPISection from '../components/dashboard/KPISection.jsx';
import AttributeCompletenessTable from '../components/dashboard/AttributeCompletenessTable.jsx';
import ChartsGrid from '../components/dashboard/ChartsGrid.jsx';

// Styles
import './Dashboard.css';

const InteractiveDashboard = () => {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [fetchProgress, setFetchProgress] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuth();

  const { datasets, loading: datasetsLoading, error: datasetsError, isAuthenticated } = useFetchDatasets();

  const handleLogout = () => {
    auth.logout();
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setDashboardData(null); // Hide dashboard at start
    setFetchProgress(0);

    try {
      const apiUrl = useCustomUrl
        ? customUrl
        : datasets.find(d => d.value === selectedDataset)?.url;

      if (!apiUrl) {
        throw new Error('Please select a dataset or provide a valid API URL');
      }

      // Step 1: Initialize Analysis State
      let state = createAnalysisState();
      let completedPages = 0;
      let currentPage = 1;

      const fetchPage = async (p) => {
        const pageUrl = new URL(apiUrl);
        pageUrl.searchParams.set('pagesize', API_CONFIG.PAGE_SIZE.toString());
        pageUrl.searchParams.set('pagenumber', p.toString());

        const response = await fetch(API_CONFIG.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiUrl: pageUrl.toString(),
            token: auth.getToken() || '',
            origin: 'interactive-dashboard-stream'
          })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status} on page ${p}`);
        return response.json();
      };

      // Step 2: Fetch Page 1 (This runs while showing the large spinner)
      console.log(`[Stream] Starting instant-fetch with Page 1: ${apiUrl}`);
      const firstPageData = await fetchPage(1);
      const firstRecords = firstPageData.Items || firstPageData.items || [];

      if (firstRecords.length === 0) {
        throw new Error('No data found for this dataset.');
      }

      // Determine total scope from first page metadata
      const totalResults = firstPageData.TotalResults || firstPageData.total || firstRecords.length;
      const totalPages = Math.max(1, Math.ceil(totalResults / API_CONFIG.PAGE_SIZE));

      console.log(`[Stream] Total detected: ${totalResults} records across ${totalPages} pages.`);

      // Process Page 1 and SHOW Dashboard
      state = processChunk(state, firstRecords);
      completedPages = 1;
      currentPage = 2;

      setFetchProgress(Math.round((completedPages / totalPages) * 100));
      setDashboardData(generateFinalReport(state)); // dashboard layout appears now

      // Step 3: Stream remaining pages in parallel
      if (totalPages > 1) {
        const CONCURRENCY_LIMIT = 3;

        const worker = async () => {
          while (currentPage <= totalPages) {
            const pageNumber = currentPage++;
            if (pageNumber > totalPages) break;

            try {
              const data = await fetchPage(pageNumber);
              const records = data.Items || data.items || [];

              state = processChunk(state, records);
              completedPages++;

              setFetchProgress(Math.round((completedPages / totalPages) * 100));
              setDashboardData(generateFinalReport(state));
            } catch (err) {
              console.error(`[Stream] Worker failed on page ${pageNumber}:`, err);
            }
          }
        };

        const workers = Array.from({ length: CONCURRENCY_LIMIT }, () => worker());
        await Promise.all(workers);
      }

      setLoading(false);
      console.log('[Stream] Progressive analysis complete.');

    } catch (err) {
      setError(err.message || 'Failed to generate report. Please try again.');
      console.error('Error generating report:', err);

      // If authentication error, redirect to login
      if (err.message.toLowerCase().includes('authentication') || err.message.includes('401')) {
        setTimeout(() => {
          auth.logout();
          navigate('/');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="header">
          <div className="header-content">
            <div className="header-spacer"></div>
            <div className="header-center">
              <h1 style={{ textAlign: 'center' }}>Interactive Data Quality Dashboard</h1>
              <p>Select a dataset or enter a custom API URL to analyze data quality</p>
            </div>
            <div className="user-section">
              <div className="user-info">
                <div className="user-name">Welcome, {user?.name || 'User'}</div>
                <div className="user-email">{user?.email || ''}</div>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>

        <ControlsPanel
          datasets={datasets}
          datasetsLoading={datasetsLoading}
          selectedDataset={selectedDataset}
          setSelectedDataset={setSelectedDataset}
          customUrl={customUrl}
          setCustomUrl={setCustomUrl}
          useCustomUrl={useCustomUrl}
          setUseCustomUrl={setUseCustomUrl}
          loading={loading}
          onGenerate={generateReport}
          isAuthenticated={isAuthenticated}
        />

        {(error || datasetsError) && <ErrorMessage message={error || datasetsError} />}

        {/* State 1: Initial full-screen loading (circular spinner) */}
        {loading && !dashboardData && <LoadingOverlay progress={fetchProgress} />}

        {/* State 2: Show results as they come in */}
        {dashboardData && (
          <>
            {/* Show a progress indicator while fetching */}
            {loading && (
              <div style={{ marginBottom: '20px' }}>
                <LoadingOverlay progress={fetchProgress} isCompact={dashboardData.kpis.totalRecords > 0} />
              </div>
            )}

            <KPISection data={dashboardData} />
            <AttributeCompletenessTable data={dashboardData} />
            <ChartsGrid data={dashboardData} />
          </>
        )}

        {/* State 2: Idle / No request yet */}
        {!loading && !dashboardData && !error && <EmptyState />}
      </div>
    </div>
  );
};

export default InteractiveDashboard;