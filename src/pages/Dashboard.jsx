import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { auth } from '../utils/auth';
import { API_CONFIG } from '../utils/constants';
import { useFetchDatasets } from '../hooks/useDatasets';

// Components
import LoadingOverlay from '../components/common/LoadingOverlay.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ControlsPanel from '../components/dashboard/ControlsPanel.jsx';
import KPISection from '../components/dashboard/KPISection.jsx';
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

  const navigate = useNavigate();
  const user = auth.getUser();

  const { datasets, loading: datasetsLoading, error: datasetsError } = useFetchDatasets();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = useCustomUrl
        ? customUrl
        : datasets.find(d => d.value === selectedDataset)?.url;

      if (!apiUrl) {
        throw new Error('Please select a dataset or provide a valid API URL');
      }

      // ============================================================
      // TODO: FUTURE BACKEND INTEGRATION
      // ============================================================
      // Currently, we use the n8n webhook for both Guests and Users.
      // When you connect your real backend:
      //
      // const user = auth.getUser();
      // if (user.role !== 'guest') {
      //   // Call your backend API here
      //   // const response = await fetch('YOUR_BACKEND_ENDPOINT', { ... });
      // }
      // ============================================================

      const response = await fetch(API_CONFIG.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.getToken()}`
        },
        body: JSON.stringify({
          apiUrl,
          dataset: selectedDataset || 'Custom',
          pagesize: API_CONFIG.PAGE_SIZE
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);

    } catch (err) {
      setError(err.message || 'Failed to generate report. Please try again.');
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <h1>Interactive Data Quality Dashboard</h1>
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
        />

        {(error || datasetsError) && <ErrorMessage message={error || datasetsError} />}
        {loading && <LoadingOverlay />}

        {!loading && dashboardData && (
          <>
            <KPISection data={dashboardData} />
            <ChartsGrid data={dashboardData} />
          </>
        )}

        {!loading && !dashboardData && !error && <EmptyState />}
      </div>
    </div>
  );
};

export default InteractiveDashboard;