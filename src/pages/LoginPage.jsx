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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (auth.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await auth.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (

    <MDBContainer fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <MDBRow className="w-100 justify-content-center">

        <MDBCol col='12' md='8' lg='6' xl='5'>
          <div className="p-4 p-md-5 border rounded-4 shadow-5 bg-white text-center">

            <div className="mb-4">
              <img
                src="https://opendatahub.com/img/NOI_OPENDATAHUB_NEW_BK_nospace-01-social.png"
                style={{ width: '150px' }}
                alt="logo"
              />
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-4">
                {error}
              </div>
            )}

            <div className="d-flex flex-column gap-4">
              <div>
                <MDBInput
                  wrapperClass="mb-0"
                  label="Email address"
                  id="emailInput"
                  type="email"
                  size="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  style={{ borderRadius: '6px' }}
                />
              </div>

              <div>
                <MDBInput
                  wrapperClass="mb-1"
                  label="Password"
                  id="passwordInput"
                  type="password"
                  size="lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  style={{ borderRadius: '6px' }}
                />
                <div className="d-flex justify-content-end">
                  <a className="text-muted small" href="https://opendatahub.com/contact" style={{ textDecoration: 'none' }}>Forgot your password?</a>
                </div>
              </div>

              <div className="d-flex flex-column gap-2">
                <MDBBtn
                  className="w-100 shadow-0"
                  style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '10px 16px',
                    boxShadow: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Login'}
                </MDBBtn>

                <div className="d-flex align-items-center w-100 my-2">
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                  <div className="px-3 text-muted small" style={{ fontSize: '0.8rem', fontWeight: '500' }}>OR</div>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                </div>

                <MDBBtn
                  className="w-100 shadow-0"
                  color="light"
                  style={{
                    padding: '10px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#0f172a'
                  }}
                  onClick={() => {
                    auth.loginAsGuest();
                    navigate('/dashboard');
                  }}
                  disabled={isLoading}
                >
                  Continue as Guest
                </MDBBtn>

                <div className="text-center mt-2">
                  <p className="small text-muted mb-0">
                    Don't have an account? <a href="https://opendatahub.com/contact" className="text-black text-decoration-underline" style={{ cursor: 'pointer' }}>Sign up</a>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}