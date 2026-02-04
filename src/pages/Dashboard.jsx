import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../utils/auth';
import { API_CONFIG } from '../utils/constants';
import { useFetchDatasets } from '../hooks/useDatasets';

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

  const navigate = useNavigate();
  const { user } = useAuth();

  const { datasets, loading: datasetsLoading, error: datasetsError, isAuthenticated } = useFetchDatasets();

  const handleLogout = () => {
    auth.logout();
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

      // Get fresh token before making request
      let token = auth.getToken();

      // Refresh token if authenticated and needed
      if (isAuthenticated && !auth.isGuestUser()) {
        token = await auth.refreshToken() || token;
      }

      // Prepare headers for n8n webhook
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add authentication header if we have a token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }


      const response = await fetch(API_CONFIG.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          apiUrl,
          dataset: selectedDataset || 'Custom',
          pagesize: API_CONFIG.PAGE_SIZE,
          token: token || '',
          isAuthenticated: !!token && !auth.isGuestUser()
        })
      });

      if (response.status === 401) {
        throw new Error('Authentication expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }

      const data = await response.json();

      setDashboardData(data);

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
        {loading && <LoadingOverlay />}

        {!loading && dashboardData && (
          <>
            <KPISection data={dashboardData} />
            <AttributeCompletenessTable data={dashboardData} />
            <ChartsGrid data={dashboardData} />
          </>
        )}

        {!loading && !dashboardData && !error && <EmptyState />}
      </div>
    </div>
  );
};

export default InteractiveDashboard;