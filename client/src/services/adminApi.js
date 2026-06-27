import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Gắn token vào header cho mọi request (nếu đã đăng nhập)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const adminApi = {
  login: async (credentials) => {
    return await API.post('/auth/login', credentials);
  },

  getStats: async () => {
    const res = await API.get('/admin/dashboard-stats');
    return res.data;
  },

  getUsers: async () => {
    const res = await API.get('/admin/users');
    return res.data;
  },

  updateUserStatus: async (id, status) => {
    const res = await API.put(`/admin/users/${id}/status`, { status });
    return res.data;
  },

  getPendingJobs: async () => {
    const res = await API.get('/admin/pending-jobs');
    return res.data;
  },

  updateJobStatus: async (id, status) => {
    const res = await API.put(`/admin/jobs/${id}/status`, { status });
    return res.data;
  },

  
  getSkills: async () => {
    const res = await API.get('/admin/skills');
    return res.data;
  },

  getIndustries: async () => {
    const res = await API.get('/admin/industry');
    return res.data;
  },

  getNews: async () => {
    const res = await API.get('/admin/news');
    return res.data;
  },

  
  createSkill: async (name) => {
    const res = await API.post('/admin/skills', { name });
    return res.data;
  },

  createIndustry: async (name) => {
    const res = await API.post('/admin/industries', { name });
    return res.data;
  },

  createNews: async (data) => {
    const res = await API.post('/admin/news', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  getNewsCategories: async () => {
    const res = await API.get('/admin/news-categories');
    return res.data;
  },

  updateNews: async (id, data) => {
    const res = await API.put(`/admin/news/${id}`, data);
    return res.data;
  },

  deleteNews: async (id) => {
    const res = await API.delete(`/admin/news/${id}`);
    return res.data;
  },

  deleteSkill: async (id) => {
    const res = await API.delete(`/admin/skills/${id}`);
    return res.data;
  },

  deleteIndustry: async (id) => {
    const res = await API.delete(`/admin/industries/${id}`);
    return res.data;
  },

  

  getCoinFees: async () => {
    const res = await API.get('/admin/coin-fees');
    return res.data;
  },

  createCoinFee: async (data) => {
    const res = await API.post('/admin/coin-fees', data);
    return res.data;
  },

  updateCoinFee: async (id, data) => {
    const res = await API.put(`/admin/coin-fees/${id}`, data);
    return res.data;
  },

  deleteCoinFee: async (id) => {
    const res = await API.delete(`/admin/coin-fees/${id}`);
    return res.data;
  },



  getNotifications: async () => {
    const res = await API.get('/admin/notifications');
    return res.data;
  },

  markNotificationRead: async (id) => {
    const res = await API.put(`/admin/notifications/${id}/read`);
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await API.delete(`/admin/notifications/${id}`);
    return res.data;


  },
  getPendingCompanies: async () => {
    const res = await API.get('/admin/pending-companies');
    return res.data;
  },

  approveCompany: async (id) => {
    const res = await API.patch(`/admin/company/${id}/approve`);
    return res.data;
  },

  getTrends: async (period = '30d', year, month) => {
    const params = new URLSearchParams({ period });
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    const res = await API.get(`/admin/dashboard-trends?${params.toString()}`);
    return res.data;
  },

  getTopSkills: async () => {
    const res = await API.get('/admin/top-skills');
    return res.data;
  },

  getTopIndustries: async () => {
    const res = await API.get('/admin/top-industries');
    return res.data;
  },

  createNewsCategory: async (name) => {
    const res = await API.post('/admin/news-categories', { name });
    return res.data;
  },
};
