
import axios from "axios";
import { API_URL } from "../config/env.js";

// Create a variable to hold the logout function
let logoutCallback = null;

// Export a function to set the logout callback
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

const API_BASE_URL = `${API_URL}/api`;

// Create an Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - runs before each request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("tokenCasos");

    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - runs after each response
api.interceptors.response.use(
  (response) => {
    // Return just the data part of the response
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data.message || "Error desconocido";
      const statusCode = error.response.status;
      if (message == "Unauthenticated." || statusCode === 401) {
        // Call the logout callback if it exists
        if (logoutCallback) {
          logoutCallback();
        }
        return Promise.reject(new Error("No autorizado"));
      }
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error("No response from server"));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(error);
    }
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post("auth/sign-in", credentials),
  logout: () => api.post("/auth/sign-out"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),

  // Nuevos métodos para activación de cuenta
  verifyInvitationToken: (token) =>
    api.get(`/auth/verify-invitation?token=${token}`),
  activateAccount: (token, password) =>
    api.post("/auth/activate-account", { token, password }),
  verifyResetToken: (token) => api.get(`/auth/verify-reset-token?token=${token}`),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
};

// Users API endpoints
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (userData) => api.put("/users/profile", userData),
  getAllUsers: (params) => api.get("/users", { params }),
  createUser: (userData) => api.post("/users", userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};


export const excelImportAPI = {
  getImportHistory: (params) => api.get("/excel-imports/history", { params }),
  getBatchDetails: (batchId) => api.get(`/excel-imports/batch/${batchId}`),
  deleteBatch: (batchId) => api.delete(`/excel-imports/batch/${batchId}`),
  getStatistics: () => api.get("/excel-imports/statistics"),
  uploadExcel: (formData) => api.post("/excel-imports/import", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  downloadTemplate: () => api.get("/excel-imports/template"),
};

export const casesAPI = {
  // Obtener todos los casos con paginación, filtros y búsqueda
  getCases: (params) => api.get("/cases", { params }),
  
  // Obtener un caso por ID
  getCaseById: (id) => api.get(`/cases/${id}`),
  
  // Crear un nuevo caso
  createCase: (caseData) => api.post("/cases", caseData),
  
  // Actualizar un caso existente
  updateCase: (id, caseData) => api.put(`/cases/${id}`, caseData),
  
  // Eliminar un caso
  deleteCase: (id) => api.delete(`/cases/${id}`),
  
  // Obtener estadísticas para el dashboard
  getStats: () => api.get("/cases/stats"),
  
  // Obtener todos los orígenes únicos
  getOrigins: () => api.get("/cases/origins"),
  
  // Obtener todos los tipos de prótesis únicos
  getProsthesisTypes: () => api.get("/cases/prosthesis-types"),
  
  // Exportar casos (con filtros opcionales)
  exportCases: (params) => api.get("/cases/export", { params }),
  
  // Actualización masiva de estados
  bulkUpdateStatus: (data) => api.post("/cases/bulk-update", data),
};

// export const payrollAPI = {
//   getWorkers: (params) => api.get("/admin/pay-sheets", { params }),
//   createWorker: (workerData) => api.post("/admin/pay-sheets", workerData, { headers: { "Content-Type": "multipart/form-data" } }),
//   updateWorker: (id, workerData) =>
//     api.put(`/admin/pay-sheets/${id}`, workerData, { headers: { "Content-Type": "multipart/form-data" } }),
//   deleteWorker: (id) => api.delete(`/admin/pay-sheets/${id}`),
// };

// export const asicAPI = {
//   getASIC: () => api.get("/admin/administrative-locations"),
// };

// export const censusAPI = {
//   getCensus: (params) => api.post("/admin/censuses/get", { params }),
//   createCensus: (censusData) => api.post("/admin/censuses", censusData),
//   deleteCensus: (id) => api.delete(`/admin/censuses/${id}`),
// }

// export const typePaySheetsAPI = {
//   getPaySheets: () => api.get("/admin/type-pay-sheets"),
// }
// Export the api instance for direct use if needed
export default api;
