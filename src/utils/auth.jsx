// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { keycloak } from './keycloak';

class Auth {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(l => l());
    window.dispatchEvent(new CustomEvent('auth-changed'));
  }

  isAuthenticated() {
    return !!keycloak.authenticated || this.isGuestUser();
  }

  isGuestUser() {
    return localStorage.getItem('guestMode') === 'true';
  }

  getToken() {
    if (this.isGuestUser()) {
      return null;
    }
    return keycloak.token;
  }

  getRefreshToken() {
    return keycloak.refreshToken;
  }

  async refreshToken() {
    try {
      const refreshed = await keycloak.updateToken(30);
      if (refreshed) {

        this.notify();
      }
      return keycloak.token;
    } catch (error) {
      console.error('Failed to refresh token', error);
      this.logout();
      return null;
    }
  }

  getUser() {
    if (this.isGuestUser()) {
      return {
        name: 'Guest User',
        email: 'guest@dashboard.local',
        isGuest: true,
        role: 'guest'
      };
    }

    if (!keycloak.tokenParsed) return null;

    return {
      name: keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username || 'Authenticated User',
      email: keycloak.tokenParsed.email,
      role: 'user',
      isGuest: false
    };
  }

  login() {
    keycloak.login({
      redirectUri: window.location.origin + '/dashboard'
    });
  }

  register() {
    keycloak.register({
      redirectUri: window.location.origin + '/dashboard'
    });
  }

  loginAsGuest() {
    localStorage.setItem('guestMode', 'true');
    localStorage.setItem('user', JSON.stringify({ name: 'Guest User', role: 'guest' }));
    this.notify();
  }

  logout() {
    localStorage.removeItem('guestMode');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');

    if (keycloak.authenticated) {
      keycloak.logout({
        redirectUri: window.location.origin
      });
    } else {
      window.location.href = window.location.origin;
    }
    this.notify();
  }

  // Auto-refresh token before it expires
  setupTokenRefresh() {
    setInterval(async () => {
      if (keycloak.authenticated) {
        await this.refreshToken();
      }
    }, 60000); // Check every minute
  }

  // Internal: Hook for Keycloak
  _refresh() {
    this.notify();
  }
}

export const auth = new Auth();
auth.setupTokenRefresh();
