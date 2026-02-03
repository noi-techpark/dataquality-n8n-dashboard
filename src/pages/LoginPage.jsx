import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MDBBtn } from 'mdb-react-ui-kit';
import { auth } from '../utils/auth';
import { keycloak, initKeycloak } from '../utils/keycloak';

import './LoginPage.css';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    // Initialize Keycloak
    initKeycloak()
      .then((authenticated) => {
        setIsReady(true);

        // Set up Keycloak lifecycle hooks
        keycloak.onAuthSuccess = () => {
          if (auth.isAuthenticated()) {
            navigate('/dashboard');
          }
        };

        keycloak.onAuthError = (error) => {
          console.error('Keycloak Auth Error:', error);
          setError('Authentication failed. Please try again.');
          setIsLoading(false);
        };

        // If already authenticated, redirect to dashboard
        if (authenticated || auth.isAuthenticated()) {
          navigate('/dashboard');
        }
      })
      .catch((err) => {
        console.error('Failed to initialize Keycloak:', err);
        setError('Failed to connect to authentication server. Please refresh the page.');
        setIsReady(true); // Still show the UI even if Keycloak fails
      });
  }, [navigate]);

  const handleLogin = () => {
    setError('');
    setIsLoading(true);
    auth.login();
  };

  const handleRegister = () => {
    setError('');
    setIsLoading(true);
    auth.register();
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="logo-wrapper">
          <img
            src="data:image/png;base64,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"
            className="logo-img"
            alt="logo"
          />
        </div>

        <p className="login-subtitle">Interactive Data Quality Dashboard</p>

        {error && (
          <div className="alert alert-danger py-2 small mb-4 rounded-3 border-0 shadow-sm">
            {error}
          </div>
        )}

        {!isReady && !error && (
          <div className="text-center my-4">
            <div className="spinner-border spinner-border-sm text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="small text-muted mt-2">Connecting to authentication server...</p>
          </div>
        )}

        {isReady && (
          <div className="d-flex flex-column gap-2">
            <MDBBtn
              className="w-100 btn-primary-custom"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Redirecting...' : 'Sign In'}
            </MDBBtn>

            <MDBBtn
              className="w-100 btn-secondary-custom mt-2"
              onClick={handleRegister}
              disabled={isLoading}
            >
              Create Account
            </MDBBtn>

            <div className="divider-container">
              <div className="divider-line"></div>
              <span className="divider-text">OR</span>
              <div className="divider-line"></div>
            </div>

            <MDBBtn
              className="w-100 btn-secondary-custom"
              onClick={() => {
                auth.loginAsGuest();
                navigate('/dashboard');
              }}
              disabled={isLoading}
            >
              Continue as Guest
            </MDBBtn>
          </div>
        )}
      </div>
    </div>
  );
}
