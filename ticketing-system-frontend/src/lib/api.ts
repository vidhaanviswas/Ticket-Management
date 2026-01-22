import axios from 'axios';
import Cookies from 'js-cookie';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (username: string, email: string, password: string, role?: string) => {
    const response = await api.post('/auth/register', { username, email, password, role });
    return response.data;
  },
};

// Ticket API
export const ticketAPI = {
  getAll: async () => {
    const response = await api.get('/tickets');
    return response.data;
  },
  getMyTickets: async () => {
    const response = await api.get('/tickets/my-tickets');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },
  create: async (data: { subject: string; description: string; priority: string; assignedToId?: number }) => {
    const response = await api.post('/tickets', data);
    return response.data;
  },
  update: async (id: number, data: { subject: string; description: string; priority: string; assignedToId?: number }) => {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: number, status: string) => {
    const response = await api.put(`/tickets/${id}/status?status=${status}`);
    return response.data;
  },
  assign: async (id: number, assignedToId: number) => {
    const response = await api.put(`/tickets/${id}/assign?assignedToId=${assignedToId}`);
    return response.data;
  },
  search: async (params: { status?: string; priority?: string; assignedToId?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.assignedToId) queryParams.append('assignedToId', params.assignedToId.toString());
    if (params.search) queryParams.append('search', params.search);
    const response = await api.get(`/tickets/search?${queryParams.toString()}`);
    return response.data;
  },
  getAttachments: async (ticketId: number) => {
    const response = await api.get(`/tickets/${ticketId}/attachments`);
    return response.data;
  },
  uploadAttachments: async (ticketId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f, f.name));
    const token = Cookies.get('token');
    const res = await fetch(`${API_URL}/tickets/${ticketId}/attachments`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Upload failed (${res.status})`);
    }

    return await res.json();
  },
  downloadAttachment: async (ticketId: number, attachmentId: number) => {
    const token = Cookies.get('token');
    const res = await fetch(`${API_URL}/tickets/${ticketId}/attachments/${attachmentId}/download`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Download failed (${res.status})`);
    }

    return await res.blob();
  },
  getRating: async (ticketId: number) => {
    const response = await api.get(`/tickets/${ticketId}/rating`);
    return response.data;
  },
  upsertRating: async (ticketId: number, data: { stars: number; feedback?: string }) => {
    const response = await api.put(`/tickets/${ticketId}/rating`, data);
    return response.data;
  },
};

// Comment API
export const commentAPI = {
  getByTicket: async (ticketId: number) => {
    const response = await api.get(`/comments/ticket/${ticketId}`);
    return response.data;
  },
  create: async (ticketId: number, content: string) => {
    const response = await api.post('/comments', { ticketId, content });
    return response.data;
  },
};

// User API
export const userAPI = {
  getCurrent: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  getSupportAgents: async () => {
    const response = await api.get('/users/support-agents');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getUserById: async (id: number) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  createUser: async (data: { username: string; email: string; password: string; role: string }) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },
  updateUser: async (id: number, data: { username: string; email: string; password?: string; role: string }) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getAllTickets: async () => {
    const response = await api.get('/admin/tickets');
    return response.data;
  },
  forceUpdateStatus: async (id: number, status: string) => {
    const response = await api.put(`/admin/tickets/${id}/status?status=${status}`);
    return response.data;
  },
  forceAssign: async (id: number, assignedToId: number) => {
    const response = await api.put(`/admin/tickets/${id}/assign?assignedToId=${assignedToId}`);
    return response.data;
  },
};

export default api;
