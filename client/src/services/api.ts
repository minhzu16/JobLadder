import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const jobsApi = {
  getJobs: (params?: any) => api.get('/jobs', { params }),
  getJobBySlug: (slug: string) => api.get(`/jobs/${slug}`),
  getJobMatchBreakdown: (id: string) => api.post(`/jobs/${id}/match`),
  chatAboutJob: (id: string, message: string, history?: string) => 
    api.post(`/jobs/${id}/chat`, { message, history }),
  saveJob: (id: string) => api.post(`/jobs/${id}/save`),
  unsaveJob: (id: string) => api.delete(`/jobs/${id}/save`),
  getSavedJobs: () => api.get('/jobs/saved'),
  getAppliedJobs: () => api.get('/jobs/applied'),
  applyForJob: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('cvFile', file);
    return api.post(`/jobs/${id}/apply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  verifyEmail: (data: any) => api.post('/auth/verify-email', data),
  getMe: () => api.get('/auth/me'),
};

export const plansApi = {
  getPlans: () => api.get('/plans'),
  upgradePlan: (data: { planId: string; billingCycle?: string }) => api.post('/plans/upgrade', data),
};

export const chatApi = {
  createSession: () => api.post('/chat/sessions'),
  getHistory: () => api.get('/chat/history'),
  sendMessage: (sessionId: string, content: string) => api.post('/chat/messages', { sessionId, content }),
  getMessages: (sessionId: string) => api.get(`/chat/${sessionId}/messages`),
};

export const aiApi = {
  getActiveRoadmap: () => api.get('/ai/career-roadmap'),
  generateRoadmap: (goal: string) => api.post('/ai/career-roadmap', { goal }),
  updateRoadmapProgress: (id: string, roadmap: any) => api.put(`/ai/career-roadmap/${id}/progress`, { roadmap }),
  analyzeCV: (resumeText: string, jobDescription?: string) => api.post('/ai/cv-analyze', { resumeText, jobDescription }),
  skillGap: (targetRole: string) => api.post('/ai/skill-gap', { targetRole }),
  uploadCV: (cvText: string) => api.post('/ai/upload-cv', { cvText }),
  generateCoverLetter: (data: { jobTitle: string; jobDescription?: string; companyName?: string; tone?: string; customResumeText?: string }) => 
    api.post('/ai/cover-letter', data),
  extractCvFile: (formData: FormData) => 
    api.post('/ai/extract-cv', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  optimizeCV: (data: { resumeText?: string; targetRole?: string; focusArea?: string }) =>
    api.post('/ai/optimize-cv', data),
};

export const companiesApi = {
  getCompanies: (params?: any) => api.get('/companies', { params }),
  getCompanyBySlug: (slug: string) => api.get(`/companies/${slug}`),
};

export const interviewApi = {
  start: (jobTitle: string, jobDescription?: string) => api.post('/interview/start', { jobTitle, jobDescription }),
  submitAnswer: (id: string, questionIndex: number, answer: string) => api.post(`/interview/${id}/answer`, { questionIndex, answer }),
  getSession: (id: string) => api.get(`/interview/${id}`),
  getHistory: () => api.get('/interview/history'),
};

export const dashboardApi = {
  getDashboardData: () => api.get('/dashboard'),
};

export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  getUserCVs: () => api.get('/user/cvs'),
  createUserCV: (data: { title: string; extractedText: string; fileName?: string; fileUrl?: string; isDefault?: boolean }) => 
    api.post('/user/cvs', data),
  setDefaultCV: (id: string) => api.put(`/user/cvs/${id}/default`),
  deleteUserCV: (id: string) => api.delete(`/user/cvs/${id}`),
};

export const employerApi = {
  getMyJobs: () => api.get('/employer/jobs'),
  createJob: (data: any) => api.post('/employer/jobs', data),
  updateJob: (id: string, data: any) => api.put(`/employer/jobs/${id}`, data),
  getJobApplications: (id: string) => api.get(`/employer/jobs/${id}/applications`),
  updateApplicationStatus: (id: string, status: string, notes?: string) =>
    api.put(`/employer/applications/${id}/status`, { status, notes }),
  analyzeApplicant: (id: string) => api.post(`/employer/applications/${id}/analyze`),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: { q?: string; role?: string }) => api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserPlan: (id: string, planId: string) => api.put(`/admin/users/${id}/plan`, { planId }),
  getJobs: (params?: { q?: string; status?: string }) => api.get('/admin/jobs', { params }),
  toggleJobStatus: (id: string) => api.put(`/admin/jobs/${id}/toggle-status`),
  deleteJob: (id: string) => api.delete(`/admin/jobs/${id}`),
};


