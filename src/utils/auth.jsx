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
  login: async (email, password) => {
    const data = {
      'token': 'dummy-auth-token',
      'user': {
        name: 'User',
        email: email,
        role: 'user'
      }
    }

    // Store authentication data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
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