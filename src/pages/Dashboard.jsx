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
import {
  createAnalysisState,
  processChunk,
  generateFinalReport,
  generateEmptyReport,
  extractRecordsFromResponse,
  extractPaginationInfo
} from '../utils/analysis';

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

  /**
   * Translates technical backend errors into clear, stakeholder-friendly messages.
   */
  const getFriendlyErrorMessage = (status, detail) => {
    if (detail.includes('Error in workflow')) {
      return "The analysis encountered an issue while processing the data. This usually happens when the dataset is empty, unavailable, or requires special access.";
    }
    if (status === 401 || status === 403) {
      return "Access denied: Your session may have expired or you lack the required permissions for this dataset.";
    }
    if (status === 404) {
      return "Data source not found: The requested URL or dataset selection could not be located.";
    }
    if (status >= 500) {
      return "Server error: The analysis engine is experiencing a temporary problem. Please try again shortly.";
    }
    return "An unexpected error occurred. Please verify the URL or contact the technical team.";
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setDashboardData(null);
    setFetchProgress(0);

    try {
      const apiUrl = useCustomUrl
        ? customUrl
        : datasets.find(d => d.value === selectedDataset)?.url;

      if (!apiUrl) {
        throw new Error('Please select a dataset or provide a valid API URL');
      }

      console.log(`Starting analysis for: ${apiUrl}`);

      // ===== CHECK CACHE FIRST FOR INSTANT RESULTS =====
      try {
        console.log('🔍 Checking cache...');
        const cacheResponse = await fetch(`${API_CONFIG.CACHE_API_URL}?url=${encodeURIComponent(apiUrl)}`);
        const cacheData = await cacheResponse.json();

        if (cacheData.cached && cacheData.results) {
          console.log('✅ Cache hit! Loading instant results...');
          setDashboardData(cacheData.results);
          setLoading(false);
          return; // Exit early - we're done!
        }

        console.log('⚠️ Cache miss. Falling back to live analysis...');
      } catch (err) {
        console.warn('Cache check failed, proceeding with live analysis:', err);
      }
      // ===== END CACHE CHECK =====

      // Initialize the tracking state for the analysis
      let state = createAnalysisState();
      let completedPages = 0;
      let currentPage = 1;

      /**
       * Core fetch function with adaptive fallbacks for authentication and rate limits.
       * If a request fails, it automatically retries without a token or parameters to ensure we get data.
       */
      const fetchPage = async (pageNumber, options = { useToken: true, useParams: true }, retryCount = 0) => {
        const urlObj = new URL(apiUrl);

        // Use conservative page sizes for non-tourism APIs to prevent timeouts
        const isTourismApi = urlObj.hostname.includes('tourism.api.opendatahub');
        const defaultPageSize = isTourismApi ? API_CONFIG.PAGE_SIZE : 100;

        if (options.useParams) {
          const existingLimit = urlObj.searchParams.get('limit') || urlObj.searchParams.get('pagesize') || urlObj.searchParams.get('rows');
          const pageSize = existingLimit ? parseInt(existingLimit) : defaultPageSize;
          const usesPagenumber = urlObj.searchParams.has('pagenumber') || urlObj.searchParams.has('PageNumber');

          if (usesPagenumber) {
            urlObj.searchParams.set('pagenumber', pageNumber.toString());
            if (!urlObj.searchParams.get('pagesize')) urlObj.searchParams.set('pagesize', pageSize.toString());
          } else {
            urlObj.searchParams.set('offset', ((pageNumber - 1) * pageSize).toString());
            if (!urlObj.searchParams.get('limit')) urlObj.searchParams.set('limit', pageSize.toString());
          }
        }

        // Send auth token only for OpenDataHub domains
        const isOdhDomain = urlObj.hostname.includes('opendatahub') || urlObj.hostname.includes('testingmachine.eu');
        const tokenValue = (options.useToken && isOdhDomain) ? auth.getToken() : null;

        console.log(`Fetching page ${pageNumber} (Auth: ${!!tokenValue ? 'Yes' : 'No'}, Params: ${options.useParams}, Retry: ${retryCount})`);

        const response = await fetch(urlObj.toString(), {
          method: 'GET',
          headers: {
            ...(tokenValue && { 'Authorization': `Bearer ${tokenValue}` }),
            'Referer': window.location.origin,
            'Origin': window.location.origin
          }
        });

        // Handle rate limiting (429 Too Many Requests or 403 Forbidden with Quota message)
        if (response.status === 429 || response.status === 403) {
          try {
            const clone = response.clone();
            const errorData = await clone.json().catch(() => ({}));

            if ((response.status === 429 || (errorData.message && String(errorData.message).includes('Quota'))) && retryCount < 5) {
              const retryAfter = errorData.retryAfter || 2;
              const delay = retryAfter * 1000 * Math.pow(2, retryCount);

              console.warn(`Rate limit hit for page ${pageNumber}. Retrying after ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));

              return fetchPage(pageNumber, options, retryCount + 1);
            }
          } catch (e) { /* ignore check error */ }
        }

        if (!response.ok) {
          const status = response.status;
          let errorDetail = '';
          try {
            const errorJson = await response.json();
            errorDetail = typeof errorJson === 'object' ? JSON.stringify(errorJson) : errorJson;
          } catch (e) {
            errorDetail = await response.text().catch(() => 'Unknown error');
          }


          // Recovery logic for the first page
          if (pageNumber === 1) {
            // Try again without the token if we were authenticated
            if (options.useToken && auth.isAuthenticated()) {
              console.log('Retrying without auth token...');
              return fetchPage(1, { useToken: false, useParams: options.useParams });
            }

            // Try again without any parameters
            if (options.useParams) {
              console.log('Retrying without pagination parameters...');
              return fetchPage(1, { useToken: options.useToken, useParams: false });
            }
          }

          console.error(`Technical error for ${urlObj.toString()}:`, errorDetail);
          throw new Error(getFriendlyErrorMessage(status, errorDetail));
        }

        return response.json();
      };

      // Fetch the first page to detect the data structure
      console.log(`Starting initial fetch...`);
      const firstPageData = await fetchPage(1);

      // Extract records and pagination metadata using universal logic
      const firstRecords = extractRecordsFromResponse(firstPageData);
      const paginationInfo = extractPaginationInfo(firstPageData, firstRecords);

      console.log(`Structure detected:`, {
        page1Size: firstRecords.length,
        total: paginationInfo.totalResults,
        pages: paginationInfo.totalPages
      });

      // Validate that we actually found data
      if (firstRecords.length === 0) {
        throw new Error('No data found for this dataset. The API might be empty or the record structure is unknown.');
      }

      const { totalResults, totalPages } = paginationInfo;

      // Process the first chunk immediately for instant UI feedback
      state = processChunk(state, firstRecords);
      completedPages = 1;
      currentPage = 2;

      setFetchProgress(Math.round((completedPages / totalPages) * 100));
      setDashboardData(generateFinalReport(state));

      console.log(`Page 1 processed. Analysis started.`);

      // Parallelize the remaining pages if the dataset is large
      if (totalPages > 1) {
        console.log(`Fetching ${totalPages - 1} remaining pages...`);

        const CONCURRENCY_LIMIT = 3; // Reduced concurrency to avoid rate limits

        const worker = async () => {
          while (currentPage <= totalPages) {
            const pageNumber = currentPage++;
            if (pageNumber > totalPages) break;

            try {
              const pageData = await fetchPage(pageNumber);
              const records = extractRecordsFromResponse(pageData);

              if (!records || records.length === 0) {
                console.warn(`Page ${pageNumber} was empty, stopping worker`);
                break;
              }

              state = processChunk(state, records);
              completedPages++;

              const progress = Math.round((completedPages / totalPages) * 100);
              setFetchProgress(progress);
              setDashboardData(generateFinalReport(state));
            } catch (err) {
              console.error(`Failed to process page ${pageNumber}:`, err);
            }
          }
        };

        const workers = Array.from({ length: CONCURRENCY_LIMIT }, () => worker());
        await Promise.all(workers);
      }

      setLoading(false);
      const finalReport = generateFinalReport(state);
      setDashboardData(finalReport);
      console.log(`Analysis complete. Total records: ${state.totalRecords}`);

      // ===== CACHE WRITE (Save results for next time) =====
      const userId = auth.getUser()?.sub; // Get Keycloak user ID
      //Only cache if we have results and it wasn't already cached
      if (finalReport && state.totalRecords > 0) {
        try {
          console.log('💾 Initiating cache write...');
          console.log('Sending payload:', {
            url: apiUrl,
            name: selectedDataset?.Shortname || 'Unknown Dataset',
            userId: userId || null,
            results_length: JSON.stringify(finalReport).length
          });

          fetch(API_CONFIG.CACHE_WRITE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: apiUrl,
              name: selectedDataset?.Shortname || 'Unknown Dataset',
              userId: userId || null, // Null for public, ID for private
              results: finalReport
            })
          })
            .then(async res => {
              const text = await res.text();
              console.log(`Cache write response status: ${res.status}`);
              console.log(`Cache write response body: ${text}`);

              if (!res.ok) {
                console.error(`Cache write failed with status ${res.status}: ${text}`);
              } else {
                console.log('✅ Cache write confirmed successful by server');
              }
            })
            .catch(err => {
              console.error('Background cache write NETWORK error:', err);
              console.error('Target URL was:', API_CONFIG.CACHE_WRITE_URL);
            });
        } catch (e) {
          console.error('Failed to initiate cache write (try/catch block):', e);
        }
      } else {
        console.warn('Skipping cache write: finalReport is missing or 0 records');
      }
      // ===== END CACHE WRITE =====

    } catch (err) {
      setError(err.message || 'Failed to generate report. Please verify the API URL.');
      console.error('Analysis Error:', err);
      setDashboardData(null);

      // Redirect to login if session expired (401/403)
      if (err.message.toLowerCase().includes('authentication') ||
        err.message.includes('401') ||
        err.message.includes('403')) {
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
              <h1 style={{ textAlign: 'center' }}>Universal Data Quality Dashboard</h1>
              <p>Detects data structure and calculates quality metrics automatically</p>
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

        {/* Loading state before first results appear */}
        {loading && !dashboardData && <LoadingOverlay progress={fetchProgress} />}

        {/* Dynamic results shown as data streams in */}
        {dashboardData && (
          <>
            {/* Progress bar during background fetching */}
            {loading && (
              <div style={{ marginBottom: '20px' }}>
                <LoadingOverlay
                  progress={fetchProgress}
                  isCompact={dashboardData.kpis.totalRecords > 0}
                />
              </div>
            )}

            <KPISection data={dashboardData} />
            <AttributeCompletenessTable data={dashboardData} />
            <ChartsGrid data={dashboardData} />
          </>
        )}

        {/* Handle cases where no report has been run yet */}
        {!loading && !dashboardData && !error && <EmptyState />}
      </div>
    </div>
  );
};

export default InteractiveDashboard;

