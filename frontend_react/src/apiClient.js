const BASE_URL = '/api';

class ApiClient {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken') || null;
  }

  setToken(token) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getToken() {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...options, headers };

    try {
      const response = await fetch(url, config);

      // If 401 (Unauthorized) and not already a refresh request, try to refresh
      if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST' });
        if (refreshResponse.ok) {
          const { accessToken } = await refreshResponse.json();
          this.setToken(accessToken);
          // Retry original request with new token
          config.headers['Authorization'] = `Bearer ${accessToken}`;
          return fetch(url, config);
        } else {
          // Refresh failed, logout
          localStorage.removeItem('accessToken');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }

      return response;
    } catch (error) {
      console.error('API Request error:', error);
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}

export const apiClient = new ApiClient();
