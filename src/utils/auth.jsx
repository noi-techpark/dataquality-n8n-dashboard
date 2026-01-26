import { keycloak } from './keycloak';

const listeners = new Set();
const notify = () => listeners.forEach(l => l());

export const auth = {
  // Subscribe to auth changes
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!keycloak.authenticated || !!localStorage.getItem('user');
  },

  // Get current user info
  getUser: () => {
    if (!keycloak.tokenParsed) {
      // Fallback to guest if not authenticated
      const guestUser = localStorage.getItem('user');
      return guestUser ? JSON.parse(guestUser) : null;
    }

    return {
      name: keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username || 'Authenticated User',
      email: keycloak.tokenParsed.email,
      role: 'user'
    };
  },

  // Login function
  login: () => {
    keycloak.login({
      redirectUri: window.location.origin + '/dashboard'
    });
  },

  // Register function
  register: () => {
    keycloak.register({
      redirectUri: window.location.origin + '/dashboard'
    });
  },

  // Logout function
  logout: () => {
    // Clear guest session
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Clear Keycloak session if authenticated
    if (keycloak.authenticated) {
      keycloak.logout({
        redirectUri: window.location.origin
      });
    } else {
      // For guest users, just redirect to home
      window.location.href = window.location.origin;
    }
    notify();
  },

  // Get Keycloak Account Management URL
  getAccountUrl: () => {
    return keycloak.createAccountUrl();
  },

  // Guest login functions
  loginAsGuest: () => {
    const data = {
      token: 'guest-access-token',
      user: {
        name: 'Guest User',
        role: 'guest'
      }
    };
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    keycloak.clearToken();
    notify();
  },

  // Get auth token for API calls
  getToken: () => {
    return keycloak.token || localStorage.getItem('authToken');
  },

  // INTERNAL: Called by Keycloak lifecycle
  _refresh: () => {
    notify();
  }
};
