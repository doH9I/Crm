// API client for Construction CRM

class APIClient {
    constructor() {
        this.baseURL = '/api';
        this.token = StorageUtils.get('authToken');
        this.isRefreshing = false;
        this.failedQueue = [];
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            StorageUtils.set('authToken', token);
        } else {
            StorageUtils.remove('authToken');
        }
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Process response and handle errors
    async processResponse(response) {
        const contentType = response.headers.get('content-type');
        
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            // Handle authentication errors
            if (response.status === 401) {
                this.handleAuthError();
                throw new Error(data.error || 'Ошибка аутентификации');
            }
            
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    }

    // Handle authentication errors
    handleAuthError() {
        this.setToken(null);
        currentUser = null;
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('login')) {
            this.showLogin();
        }
    }

    // Show login page
    showLogin() {
        document.getElementById('app').style.display = 'none';
        document.getElementById('login-page').style.display = 'block';
        document.getElementById('loading-screen').style.display = 'none';
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        // Add body for POST/PUT/PATCH requests
        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            return await this.processResponse(response);
        } catch (error) {
            console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = URLUtils.buildQuery(params);
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }

    // PATCH request
    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: data
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Upload file
    async upload(endpoint, file, data = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });

        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': this.token ? `Bearer ${this.token}` : undefined
            }
        });
    }

    // Download file
    async download(endpoint, filename) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Authorization': this.token ? `Bearer ${this.token}` : undefined
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            downloadFile(url, filename);
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    }
}

// Create global API instance
const api = new APIClient();

// Authentication API
const AuthAPI = {
    login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        
        if (response.token) {
            api.setToken(response.token);
            currentUser = response.user;
            StorageUtils.set('currentUser', response.user);
        }
        
        return response;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            api.setToken(null);
            currentUser = null;
            StorageUtils.remove('currentUser');
        }
    },

    register: async (userData) => {
        return api.post('/auth/register', userData);
    },

    getProfile: async () => {
        return api.get('/users/profile');
    },

    updateProfile: async (userData) => {
        return api.put('/users/profile', userData);
    }
};

// Users API
const UsersAPI = {
    getAll: async (params = {}) => {
        return api.get('/users', params);
    },

    getById: async (id) => {
        return api.get(`/users/${id}`);
    },

    create: async (userData) => {
        return api.post('/users', userData);
    },

    update: async (id, userData) => {
        return api.put(`/users/${id}`, userData);
    },

    delete: async (id) => {
        return api.delete(`/users/${id}`);
    }
};

// Clients API
const ClientsAPI = {
    getAll: async (params = {}) => {
        return api.get('/clients', params);
    },

    getById: async (id) => {
        return api.get(`/clients/${id}`);
    },

    create: async (clientData) => {
        return api.post('/clients', clientData);
    },

    update: async (id, clientData) => {
        return api.put(`/clients/${id}`, clientData);
    },

    delete: async (id) => {
        return api.delete(`/clients/${id}`);
    }
};

// Contractors API
const ContractorsAPI = {
    getAll: async (params = {}) => {
        return api.get('/contractors', params);
    },

    getById: async (id) => {
        return api.get(`/contractors/${id}`);
    },

    create: async (contractorData) => {
        return api.post('/contractors', contractorData);
    },

    update: async (id, contractorData) => {
        return api.put(`/contractors/${id}`, contractorData);
    },

    delete: async (id) => {
        return api.delete(`/contractors/${id}`);
    }
};

// Projects API
const ProjectsAPI = {
    getAll: async (params = {}) => {
        return api.get('/projects', params);
    },

    getById: async (id) => {
        return api.get(`/projects/${id}`);
    },

    create: async (projectData) => {
        return api.post('/projects', projectData);
    },

    update: async (id, projectData) => {
        return api.put(`/projects/${id}`, projectData);
    },

    delete: async (id) => {
        return api.delete(`/projects/${id}`);
    },

    getTasks: async (projectId) => {
        return api.get(`/projects/${projectId}/tasks`);
    },

    createTask: async (projectId, taskData) => {
        return api.post(`/projects/${projectId}/tasks`, taskData);
    },

    getEstimates: async (projectId) => {
        return api.get(`/projects/${projectId}/estimates`);
    },

    createEstimate: async (projectId, estimateData) => {
        return api.post(`/projects/${projectId}/estimates`, estimateData);
    }
};

// Tasks API
const TasksAPI = {
    getById: async (id) => {
        return api.get(`/tasks/${id}`);
    },

    update: async (id, taskData) => {
        return api.put(`/tasks/${id}`, taskData);
    },

    delete: async (id) => {
        return api.delete(`/tasks/${id}`);
    }
};

// Employees API
const EmployeesAPI = {
    getAll: async (params = {}) => {
        return api.get('/employees', params);
    },

    getById: async (id) => {
        return api.get(`/employees/${id}`);
    },

    create: async (employeeData) => {
        return api.post('/employees', employeeData);
    },

    update: async (id, employeeData) => {
        return api.put(`/employees/${id}`, employeeData);
    },

    delete: async (id) => {
        return api.delete(`/employees/${id}`);
    }
};

// Timesheet API
const TimesheetAPI = {
    getAll: async (params = {}) => {
        return api.get('/timesheet', params);
    },

    getById: async (id) => {
        return api.get(`/timesheet/${id}`);
    },

    create: async (timesheetData) => {
        return api.post('/timesheet', timesheetData);
    },

    update: async (id, timesheetData) => {
        return api.put(`/timesheet/${id}`, timesheetData);
    },

    delete: async (id) => {
        return api.delete(`/timesheet/${id}`);
    },

    approve: async (id) => {
        return api.post(`/timesheet/${id}/approve`);
    },

    reject: async (id, reason) => {
        return api.post(`/timesheet/${id}/reject`, { reason });
    }
};

// Warehouse API
const WarehouseAPI = {
    getItems: async (params = {}) => {
        return api.get('/warehouse/items', params);
    },

    getItemById: async (id) => {
        return api.get(`/warehouse/items/${id}`);
    },

    createItem: async (itemData) => {
        return api.post('/warehouse/items', itemData);
    },

    updateItem: async (id, itemData) => {
        return api.put(`/warehouse/items/${id}`, itemData);
    },

    deleteItem: async (id) => {
        return api.delete(`/warehouse/items/${id}`);
    },

    getMovements: async (params = {}) => {
        return api.get('/warehouse/movements', params);
    },

    createMovement: async (movementData) => {
        return api.post('/warehouse/movements', movementData);
    }
};

// Estimates API
const EstimatesAPI = {
    getById: async (id) => {
        return api.get(`/estimates/${id}`);
    },

    update: async (id, estimateData) => {
        return api.put(`/estimates/${id}`, estimateData);
    },

    delete: async (id) => {
        return api.delete(`/estimates/${id}`);
    },

    getItems: async (id) => {
        return api.get(`/estimates/${id}/items`);
    },

    addItem: async (id, itemData) => {
        return api.post(`/estimates/${id}/items`, itemData);
    },

    updateItem: async (estimateId, itemId, itemData) => {
        return api.put(`/estimates/${estimateId}/items/${itemId}`, itemData);
    },

    deleteItem: async (estimateId, itemId) => {
        return api.delete(`/estimates/${estimateId}/items/${itemId}`);
    },

    approve: async (id) => {
        return api.post(`/estimates/${id}/approve`);
    },

    exportPDF: async (id) => {
        return api.download(`/estimates/${id}/pdf`, `estimate_${id}.pdf`);
    }
};

// Commercial Offers API
const OffersAPI = {
    getAll: async (params = {}) => {
        return api.get('/offers', params);
    },

    getById: async (id) => {
        return api.get(`/offers/${id}`);
    },

    create: async (offerData) => {
        return api.post('/offers', offerData);
    },

    update: async (id, offerData) => {
        return api.put(`/offers/${id}`, offerData);
    },

    delete: async (id) => {
        return api.delete(`/offers/${id}`);
    },

    send: async (id) => {
        return api.post(`/offers/${id}/send`);
    },

    exportPDF: async (id) => {
        return api.download(`/offers/${id}/pdf`, `offer_${id}.pdf`);
    }
};

// Material Requests API
const MaterialRequestsAPI = {
    getAll: async (params = {}) => {
        return api.get('/material-requests', params);
    },

    getById: async (id) => {
        return api.get(`/material-requests/${id}`);
    },

    create: async (requestData) => {
        return api.post('/material-requests', requestData);
    },

    update: async (id, requestData) => {
        return api.put(`/material-requests/${id}`, requestData);
    },

    delete: async (id) => {
        return api.delete(`/material-requests/${id}`);
    },

    approve: async (id) => {
        return api.post(`/material-requests/${id}/approve`);
    }
};

// Documents API
const DocumentsAPI = {
    getAll: async (params = {}) => {
        return api.get('/documents', params);
    },

    getById: async (id) => {
        return api.get(`/documents/${id}`);
    },

    upload: async (file, data = {}) => {
        return api.upload('/upload', file, data);
    },

    delete: async (id) => {
        return api.delete(`/documents/${id}`);
    },

    download: async (id, filename) => {
        return api.download(`/documents/${id}/download`, filename);
    }
};

// Dashboard API
const DashboardAPI = {
    getData: async () => {
        return api.get('/dashboard');
    },

    getStats: async (period = 'month') => {
        return api.get('/dashboard/stats', { period });
    },

    getChartData: async (type, period = 'month') => {
        return api.get('/dashboard/charts', { type, period });
    }
};

// Export APIs
const ExportAPI = {
    exportProjects: async (format = 'excel') => {
        return api.download(`/export/projects/${format}`, `projects.${format}`);
    },

    exportClients: async (format = 'excel') => {
        return api.download(`/export/clients/${format}`, `clients.${format}`);
    },

    exportTimesheet: async (params = {}, format = 'excel') => {
        const query = URLUtils.buildQuery(params);
        return api.download(`/export/timesheet/${format}?${query}`, `timesheet.${format}`);
    }
};

// Company Price List API
const PriceListAPI = {
    getAll: async (params = {}) => {
        return api.get('/price-list', params);
    },

    getById: async (id) => {
        return api.get(`/price-list/${id}`);
    },

    create: async (itemData) => {
        return api.post('/price-list', itemData);
    },

    update: async (id, itemData) => {
        return api.put(`/price-list/${id}`, itemData);
    },

    delete: async (id) => {
        return api.delete(`/price-list/${id}`);
    },

    search: async (query) => {
        return api.get('/price-list/search', { q: query });
    }
};

// Messages API
const MessagesAPI = {
    getAll: async (params = {}) => {
        return api.get('/messages', params);
    },

    getById: async (id) => {
        return api.get(`/messages/${id}`);
    },

    send: async (messageData) => {
        return api.post('/messages', messageData);
    },

    markAsRead: async (id) => {
        return api.patch(`/messages/${id}`, { isRead: true });
    },

    delete: async (id) => {
        return api.delete(`/messages/${id}`);
    }
};

// Notifications API
const NotificationsAPI = {
    getAll: async (params = {}) => {
        return api.get('/notifications', params);
    },

    markAsRead: async (id) => {
        return api.patch(`/notifications/${id}`, { isRead: true });
    },

    markAllAsRead: async () => {
        return api.post('/notifications/mark-all-read');
    },

    delete: async (id) => {
        return api.delete(`/notifications/${id}`);
    }
};

// Settings API
const SettingsAPI = {
    getAll: async () => {
        return api.get('/settings');
    },

    update: async (settings) => {
        return api.put('/settings', settings);
    },

    getCompanyInfo: async () => {
        return api.get('/settings/company');
    },

    updateCompanyInfo: async (companyData) => {
        return api.put('/settings/company', companyData);
    }
};

// Error handling helper
const handleAPIError = (error, context = '') => {
    console.error(`API Error${context ? ` (${context})` : ''}:`, error);
    
    let message = 'Произошла ошибка';
    
    if (error.message) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
    
    showNotification(message, 'error');
    return null;
};

// Export API modules
window.api = api;
window.AuthAPI = AuthAPI;
window.UsersAPI = UsersAPI;
window.ClientsAPI = ClientsAPI;
window.ContractorsAPI = ContractorsAPI;
window.ProjectsAPI = ProjectsAPI;
window.TasksAPI = TasksAPI;
window.EmployeesAPI = EmployeesAPI;
window.TimesheetAPI = TimesheetAPI;
window.WarehouseAPI = WarehouseAPI;
window.EstimatesAPI = EstimatesAPI;
window.OffersAPI = OffersAPI;
window.MaterialRequestsAPI = MaterialRequestsAPI;
window.DocumentsAPI = DocumentsAPI;
window.DashboardAPI = DashboardAPI;
window.ExportAPI = ExportAPI;
window.PriceListAPI = PriceListAPI;
window.MessagesAPI = MessagesAPI;
window.NotificationsAPI = NotificationsAPI;
window.SettingsAPI = SettingsAPI;
window.handleAPIError = handleAPIError;