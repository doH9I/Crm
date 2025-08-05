// Authentication module for Construction CRM

class AuthModule {
    constructor() {
        this.loginForm = null;
        this.isLoading = false;
    }

    // Initialize authentication module
    init() {
        this.initLoginForm();
        this.checkAutoLogin();
    }

    // Initialize login form
    initLoginForm() {
        this.loginForm = document.getElementById('login-form');
        if (!this.loginForm) return;

        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Auto-fill saved credentials if remember me was checked
        this.loadSavedCredentials();

        // Focus on username field
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.focus();
        }
    }

    // Handle login form submission
    async handleLogin() {
        if (this.isLoading) return;

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Validate inputs
        if (!username) {
            this.showLoginError('Введите логин или email');
            document.getElementById('username').focus();
            return;
        }

        if (!password) {
            this.showLoginError('Введите пароль');
            document.getElementById('password').focus();
            return;
        }

        try {
            this.setLoginLoading(true);
            this.clearLoginError();

            // Attempt login
            const response = await AuthAPI.login(username, password);

            // Save credentials if remember me is checked
            if (rememberMe) {
                this.saveCredentials(username, rememberMe);
            } else {
                this.clearSavedCredentials();
            }

            // Update UI with user info
            app.updateUserInfo();

            // Show success message
            showNotification('Добро пожаловать в систему!', 'success');

            // Show main application
            app.showApp();

            // Navigate to dashboard
            await app.navigateTo('dashboard');

        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError(error.message || 'Ошибка входа в систему');
        } finally {
            this.setLoginLoading(false);
        }
    }

    // Set login loading state
    setLoginLoading(loading) {
        this.isLoading = loading;
        const loginBtn = this.loginForm.querySelector('.login-btn');
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');

        if (loading) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = `
                <div class="spinner" style="width: 16px; height: 16px; margin-right: 8px;"></div>
                <span>Вход...</span>
            `;
            usernameField.disabled = true;
            passwordField.disabled = true;
        } else {
            loginBtn.disabled = false;
            loginBtn.innerHTML = `
                <span>Войти</span>
                <i class="fas fa-arrow-right"></i>
            `;
            usernameField.disabled = false;
            passwordField.disabled = false;
        }
    }

    // Show login error
    showLoginError(message) {
        this.clearLoginError();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
        errorDiv.style.cssText = `
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        this.loginForm.insertBefore(errorDiv, this.loginForm.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.clearLoginError();
        }, 5000);
    }

    // Clear login error
    clearLoginError() {
        const existingError = this.loginForm.querySelector('.login-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // Save credentials for remember me
    saveCredentials(username, rememberMe) {
        if (rememberMe) {
            StorageUtils.set('savedUsername', username);
            StorageUtils.set('rememberMe', true);
        }
    }

    // Load saved credentials
    loadSavedCredentials() {
        const savedUsername = StorageUtils.get('savedUsername');
        const rememberMe = StorageUtils.get('rememberMe', false);

        if (savedUsername && rememberMe) {
            const usernameField = document.getElementById('username');
            const rememberCheckbox = document.getElementById('remember-me');

            if (usernameField) {
                usernameField.value = savedUsername;
            }

            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }

            // Focus on password field since username is pre-filled
            const passwordField = document.getElementById('password');
            if (passwordField) {
                passwordField.focus();
            }
        }
    }

    // Clear saved credentials
    clearSavedCredentials() {
        StorageUtils.remove('savedUsername');
        StorageUtils.remove('rememberMe');
    }

    // Check for auto-login (if user is already authenticated)
    async checkAutoLogin() {
        try {
            const isAuthenticated = await app.checkAuth();
            if (isAuthenticated) {
                app.showApp();
                await app.navigateTo('dashboard');
            }
        } catch (error) {
            console.error('Auto-login check error:', error);
            // Show login page if auto-login fails
            app.showLogin();
        }
    }

    // Password reset functionality
    async handlePasswordReset(email) {
        try {
            // This would typically send a password reset email
            showNotification('Ссылка для восстановления пароля отправлена на email', 'info');
        } catch (error) {
            console.error('Password reset error:', error);
            showNotification(error.message || 'Ошибка при восстановлении пароля', 'error');
        }
    }

    // Logout functionality
    async logout() {
        try {
            await AuthAPI.logout();
            
            // Clear any saved state
            this.clearSavedCredentials();
            
            // Reset form
            if (this.loginForm) {
                this.loginForm.reset();
                this.clearLoginError();
            }

            // Show login page
            app.showLogin();

            showNotification('Вы успешно вышли из системы', 'info');

        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails on server, clear local state
            app.showLogin();
        }
    }

    // Session management
    checkSessionExpiry() {
        // Check if session is about to expire and warn user
        const token = StorageUtils.get('authToken');
        if (!token) return;

        try {
            // Decode JWT to check expiry (simplified)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            const timeUntilExpiry = payload.exp - now;

            // Warn if less than 5 minutes remaining
            if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
                this.showSessionWarning(Math.floor(timeUntilExpiry / 60));
            }

            // Auto-logout if expired
            if (timeUntilExpiry <= 0) {
                this.handleSessionExpired();
            }
        } catch (error) {
            console.error('Session check error:', error);
        }
    }

    // Show session expiry warning
    showSessionWarning(minutesRemaining) {
        const message = `Ваша сессия истекает через ${minutesRemaining} ${StringUtils.pluralize(minutesRemaining, 'минуту', 'минуты', 'минут')}. Продлить?`;
        
        if (confirm(message)) {
            this.refreshSession();
        }
    }

    // Handle session expiry
    handleSessionExpired() {
        showNotification('Сессия истекла. Пожалуйста, войдите заново', 'warning');
        this.logout();
    }

    // Refresh session
    async refreshSession() {
        try {
            // This would typically refresh the JWT token
            const profile = await AuthAPI.getProfile();
            currentUser = profile;
            showNotification('Сессия продлена', 'success');
        } catch (error) {
            console.error('Session refresh error:', error);
            this.handleSessionExpired();
        }
    }

    // Two-factor authentication (if implemented)
    async handleTwoFactorAuth(code) {
        try {
            const response = await api.post('/auth/verify-2fa', { code });
            return response;
        } catch (error) {
            console.error('2FA error:', error);
            throw error;
        }
    }

    // Account lockout handling
    handleAccountLockout(attemptsRemaining) {
        if (attemptsRemaining <= 0) {
            this.showLoginError('Аккаунт заблокирован из-за множественных неудачных попыток входа. Обратитесь к администратору.');
            this.disableLoginForm();
        } else {
            this.showLoginError(`Неверные данные. Осталось попыток: ${attemptsRemaining}`);
        }
    }

    // Disable login form
    disableLoginForm() {
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        const loginBtn = this.loginForm.querySelector('.login-btn');

        if (usernameField) usernameField.disabled = true;
        if (passwordField) passwordField.disabled = true;
        if (loginBtn) loginBtn.disabled = true;
    }

    // Enable login form
    enableLoginForm() {
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        const loginBtn = this.loginForm.querySelector('.login-btn');

        if (usernameField) usernameField.disabled = false;
        if (passwordField) passwordField.disabled = false;
        if (loginBtn) loginBtn.disabled = false;
    }

    // Validate user permissions
    hasPermission(action, resource) {
        if (!currentUser) return false;

        const permissions = {
            admin: ['*'],
            general_director: [
                'projects.*', 'clients.*', 'contractors.*', 'employees.*', 
                'estimates.*', 'offers.*', 'reports.*', 'settings.*'
            ],
            construction_director: [
                'projects.*', 'contractors.*', 'employees.view', 'employees.update',
                'estimates.*', 'warehouse.*', 'timesheet.*'
            ],
            site_manager: [
                'projects.view', 'projects.update', 'tasks.*', 'employees.view',
                'timesheet.*', 'warehouse.view', 'materials.*'
            ],
            foreman: [
                'projects.view', 'tasks.*', 'employees.view',
                'timesheet.*', 'warehouse.view', 'materials.view'
            ],
            estimator: [
                'projects.view', 'estimates.*', 'price-list.*', 'offers.*'
            ],
            pto_employee: [
                'projects.*', 'documents.*', 'estimates.view', 'offers.view'
            ],
            procurement: [
                'warehouse.*', 'materials.*', 'contractors.view', 'price-list.view'
            ]
        };

        const userPermissions = permissions[currentUser.role] || [];
        
        // Admin has all permissions
        if (userPermissions.includes('*')) return true;

        // Check specific permission
        const permissionString = `${resource}.${action}`;
        return userPermissions.some(permission => {
            if (permission.endsWith('.*')) {
                return permissionString.startsWith(permission.slice(0, -1));
            }
            return permission === permissionString;
        });
    }

    // Check if user can access a module
    canAccessModule(moduleName) {
        const modulePermissions = {
            dashboard: () => true, // All users can access dashboard
            projects: () => this.hasPermission('view', 'projects'),
            clients: () => this.hasPermission('view', 'clients'),
            contractors: () => this.hasPermission('view', 'contractors'),
            employees: () => this.hasPermission('view', 'employees'),
            timesheet: () => this.hasPermission('view', 'timesheet'),
            warehouse: () => this.hasPermission('view', 'warehouse'),
            estimates: () => this.hasPermission('view', 'estimates'),
            offers: () => this.hasPermission('view', 'offers'),
            materials: () => this.hasPermission('view', 'materials'),
            documents: () => this.hasPermission('view', 'documents'),
            reports: () => this.hasPermission('view', 'reports'),
            settings: () => this.hasPermission('view', 'settings')
        };

        const checkFunction = modulePermissions[moduleName];
        return checkFunction ? checkFunction() : false;
    }
}

// Create global auth module instance
const authModule = new AuthModule();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    authModule.init();
    
    // Start session monitoring
    setInterval(() => {
        authModule.checkSessionExpiry();
    }, 60000); // Check every minute
});

// Export for global use
window.authModule = authModule;