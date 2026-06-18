import axios from 'axios';

// Create Axios instance
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to headers automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper for APIs response payload handling
const handleResponse = (response) => response.data;

export const authAPI = {
  login: (email, password) => API.post('/auth/login', { email, password }).then(handleResponse),
  register: (name, email, password, phone, role) => API.post('/auth/register', { name, email, password, phone, role }).then(handleResponse),
  registerDoctor: (formData) => API.post('/auth/register-doctor', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(handleResponse),
  getMe: () => API.get('/auth/me').then(handleResponse),
};

export const doctorAPI = {
  getDoctors: (params) => API.get('/doctors', { params }).then(handleResponse),
  getDoctorById: (id) => API.get(`/doctors/${id}`).then(handleResponse),
  updateProfile: (profileData) => API.put('/doctors/profile', profileData).then(handleResponse),
  addReview: (doctorId, rating, comment) => API.post(`/doctors/${doctorId}/reviews`, { rating, comment }).then(handleResponse),
};

export const appointmentAPI = {
  bookAppointment: (bookingData) => API.post('/appointments/book', bookingData).then(handleResponse),
  getPatientAppointments: () => API.get('/appointments/patient').then(handleResponse),
  getDoctorAppointments: () => API.get('/appointments/doctor').then(handleResponse),
  updateStatus: (apptId, status) => API.put(`/appointments/${apptId}/status`, { status }).then(handleResponse),
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats').then(handleResponse),
  getUsers: () => API.get('/admin/users').then(handleResponse),
  getDoctors: () => API.get('/admin/doctors').then(handleResponse),
  getAppointments: () => API.get('/admin/appointments').then(handleResponse),
  approveDoctor: (docId, isApproved) => API.put(`/admin/doctors/${docId}/approve`, { isApproved }).then(handleResponse),
  deleteUser: (userId) => API.delete(`/admin/users/${userId}`).then(handleResponse),
};

export default API;
