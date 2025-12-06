// API Configuration
const API_BASE_URL = window.location.origin;

// API utility functions
const api = {
  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('token');
  },

  // Set auth token
  setToken(token) {
    localStorage.setItem('token', token);
  },

  // Remove auth token
  removeToken() {
    localStorage.removeItem('token');
  },

  // Get headers with auth token
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders()
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  async register(username, email, password) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
  },

  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async getCurrentUser() {
    return this.request('/api/auth/me');
  },

  // User endpoints
  async getUsers() {
    return this.request('/api/users');
  },

  async getUser(userId) {
    return this.request(`/api/users/${userId}`);
  },

  async updateProfile(data) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Message endpoints
  async getMessages(userId) {
    return this.request(`/api/messages/${userId}`);
  },

  async sendMessage(receiver, content, messageType = 'text') {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ receiver, content, messageType })
    });
  },

  async markMessageAsRead(messageId) {
    return this.request(`/api/messages/${messageId}/read`, {
      method: 'PUT'
    });
  },

  async getConversations() {
    return this.request('/api/messages/conversations/all');
  }
};
