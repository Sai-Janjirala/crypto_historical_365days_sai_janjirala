import api from './api';

const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data; // Expected response shape: { success: true, data: { user, token } }
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data; // Expected response shape: { success: true, data: { user, token } }
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.patch('/auth/profile', profileData);
    return response.data;
  },

  async deleteProfile() {
    const response = await api.delete('/auth/profile');
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, password) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  async changePassword(oldPassword, newPassword) {
    const response = await api.post('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },

  async verifyEmail(email, token) {
    const response = await api.post('/auth/verify-email', { email, token });
    return response.data;
  }
};

export default authService;
