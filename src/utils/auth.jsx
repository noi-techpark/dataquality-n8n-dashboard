import { API_CONFIG } from '../utils/constants';
export const auth = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get current user
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Login function
  // login: async (email, password) => {

  //   const data = await fetch(API_CONFIG.LOGIN_AUTH,
  //     {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${API_CONFIG.LOGIN_TOKEN}`
  //       },
  //     });
  //   if (!data) {
  //     throw new Error('Invalid Login');
  //   };

  //   // Store authentication data
  //   localStorage.setItem('authToken', data.token);
  //   localStorage.setItem('user', JSON.stringify(data.user));

  //   return data;
  // },
  login: (email) => {
    window.location.href = API_CONFIG.AUTH_URL;
  },

  // Guest login function
  loginAsGuest: () => {
    const data = {
      'token': 'guest-access-token',
      'user': {
        name: 'Guest User',
        role: 'guest'
      }
    };
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get auth token for API calls
  getToken: () => {
    return localStorage.getItem('authToken');
  }
};