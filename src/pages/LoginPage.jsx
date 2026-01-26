import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput
} from 'mdb-react-ui-kit';
import { auth } from '../utils/auth';
import { keycloak } from '../utils/keycloak';

import './LoginPage.css';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    // Set up Keycloak lifecycle hooks
    keycloak.onAuthSuccess = () => {
      console.log('Keycloak Auth Success');
      if (auth.isAuthenticated()) {
        navigate('/dashboard');
      }
    };

    keycloak.onAuthError = (error) => {
      console.error('Keycloak Auth Error:', error);
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    };

    keycloak.onReady = (authenticated) => {
      console.log('Keycloak Ready. Authenticated:', authenticated);
      setIsReady(true);
      if (authenticated || auth.isAuthenticated()) {
        navigate('/dashboard');
      }
    };

    // Check if already authenticated (Keycloak might already be initialized)
    const authenticated = auth.isAuthenticated();
    console.log('LoginPage Mount. Auth state:', authenticated);

    if (authenticated) {
      navigate('/dashboard');
    }
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
            src="https://opendatahub.com/img/NOI_OPENDATAHUB_NEW_BK_nospace-01-social.png"
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