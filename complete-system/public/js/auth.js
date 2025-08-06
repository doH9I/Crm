// Authentication module for Construction CRM

class AuthModule {
    constructor() {
        this.loginForm = null;
        this.isLoading = false;
        this.initialized = false;
    }

    // Initialize authentication module
    init() {
        if (this.initialized) return;
        
        this.initLoginForm();
        this.checkAutoLogin();
        this.initialized = true;
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

    // Check for auto-login (if user is already authenticated)
    async checkAutoLogin() {
        try {
            // Check if app is available
            if (typeof window.app === 'undefined') {
                console.log('App not yet initialized, skipping auto-login check');
                return;
            }
            
            const isAuthenticated = await window.app.checkAuth();
            if (isAuthenticated) {
                if (window.app && window.app.showApp) {
                    window.app.showApp();
                }
                if (window.app && window.app.navigateTo) {
                    await window.app.navigateTo('dashboard');
                }
            }
        } catch (error) {
            console.error('Auto-login check error:', error);
            // Show login page if auto-login fails
            if (window.app && window.app.showLogin) {
                window.app.showLogin();
            }
        }
    }

    // Handle login form submission
    async handleLogin() {
        if (this.isLoading) return;

        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        const rememberMe = document.getElementById('remember-me')?.checked;

        // Basic validation
        if (!username || !password) {
            showNotification('Пожалуйста, введите логин и пароль', 'error');
            return;
        }

        try {
            this.isLoading = true;
            this.updateLoginButton(true);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка входа');
            }

            // Store authentication data
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));

            // Store credentials if remember me is checked
            if (rememberMe) {
                this.saveCredentials(username, rememberMe);
            } else {
                this.clearSavedCredentials();
            }

            // Update UI with user info
            if (window.app && window.app.updateUserInfo) {
                window.app.updateUserInfo();
            }

            // Show success message
            showNotification('Добро пожаловать в систему!', 'success');

            // Show main application
            if (window.app && window.app.showApp) {
                window.app.showApp();
            }

            // Navigate to dashboard
            if (window.app && window.app.navigateTo) {
                await window.app.navigateTo('dashboard');
            }

        } catch (error) {
            console.error('Login error:', error);
            showNotification(error.message || 'Ошибка входа в систему', 'error');
        } finally {
            this.isLoading = false;
            this.updateLoginButton(false);
        }
    }

    // Handle logout
    async handleLogout() {
        try {
            // Call logout API
            const token = localStorage.getItem('auth_token');
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Clear stored data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');

            // Show login page
            if (window.app && window.app.showLogin) {
                window.app.showLogin();
            }

            showNotification('Вы успешно вышли из системы', 'info');

        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails on server, clear local state
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            
            if (window.app && window.app.showLogin) {
                window.app.showLogin();
            }
        }
    }

    // Update login button state
    updateLoginButton(loading) {
        const button = document.querySelector('#login-form button[type="submit"]');
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
        }
    }

    // Save credentials for remember me
    saveCredentials(username, remember) {
        if (remember) {
            localStorage.setItem('saved_username', username);
            localStorage.setItem('remember_me', 'true');
        }
    }

    // Load saved credentials
    loadSavedCredentials() {
        const savedUsername = localStorage.getItem('saved_username');
        const rememberMe = localStorage.getItem('remember_me') === 'true';

        if (savedUsername && rememberMe) {
            const usernameField = document.getElementById('username');
            const rememberMeField = document.getElementById('remember-me');

            if (usernameField) usernameField.value = savedUsername;
            if (rememberMeField) rememberMeField.checked = true;
        }
    }

    // Clear saved credentials
    clearSavedCredentials() {
        localStorage.removeItem('saved_username');
        localStorage.removeItem('remember_me');
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('auth_token');
        return !!token;
    }

    // Get current user data
    getCurrentUser() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    // Get authentication token
    getAuthToken() {
        return localStorage.getItem('auth_token');
    }

    // Check session expiry
    checkSessionExpiry() {
        const token = this.getAuthToken();
        if (!token) return;

        try {
            // Decode JWT token to check expiry
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;

            // Check if token expires in next 5 minutes
            if (payload.exp && payload.exp - now < 300) {
                showNotification('Ваша сессия скоро истечет', 'warning');
            }

            // Check if token is already expired
            if (payload.exp && payload.exp < now) {
                showNotification('Ваша сессия истекла. Войдите снова.', 'error');
                this.handleLogout();
            }
        } catch (error) {
            console.error('Error checking session expiry:', error);
        }
    }

    // Refresh authentication token
    async refreshToken() {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('auth_token', data.token);
                return true;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
        }
        
        return false;
    }

    // Show/hide password
    togglePasswordVisibility() {
        const passwordField = document.getElementById('password');
        const toggleButton = document.querySelector('.password-toggle');
        
        if (passwordField && toggleButton) {
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordField.type = 'password';
                toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
            }
        }
    }

    // Show forgot password modal
    showForgotPasswordModal() {
        // This would show a modal for password recovery
        showNotification('Функция восстановления пароля будет добавлена в следующей версии', 'info');
    }

    // Validate login form
    validateLoginForm() {
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;

        const errors = [];

        if (!username || username.trim().length < 3) {
            errors.push('Логин должен содержать минимум 3 символа');
        }

        if (!password || password.length < 6) {
            errors.push('Пароль должен содержать минимум 6 символов');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Enter key on login form
        if (event.key === 'Enter' && event.target.closest('#login-form')) {
            event.preventDefault();
            this.handleLogin();
        }

        // Escape key to clear form
        if (event.key === 'Escape' && event.target.closest('#login-form')) {
            this.clearLoginForm();
        }
    }

    // Clear login form
    clearLoginForm() {
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        const rememberMeField = document.getElementById('remember-me');

        if (usernameField) usernameField.value = '';
        if (passwordField) passwordField.value = '';
        if (rememberMeField) rememberMeField.checked = false;
    }

    // Show login page
    showLogin() {
        const loginContainer = document.getElementById('login-container');
        const appContainer = document.getElementById('app-container');

        if (loginContainer) loginContainer.style.display = 'flex';
        if (appContainer) appContainer.style.display = 'none';
    }

    // Show app
    showApp() {
        const loginContainer = document.getElementById('login-container');
        const appContainer = document.getElementById('app-container');

        if (loginContainer) loginContainer.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block';
    }
}

// Create global instance
const authModule = new AuthModule();

// Initialize when DOM is ready - but only if app is not available yet
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for app to initialize
    setTimeout(() => {
        if (typeof window.app === 'undefined') {
            // App not initialized yet, initialize auth module
            authModule.init();
        }
        
        // Start session monitoring
        setInterval(() => {
            authModule.checkSessionExpiry();
        }, 60000); // Check every minute
    }, 100);
});

// Add keyboard event listener
document.addEventListener('keydown', (event) => {
    authModule.handleKeyboardShortcuts(event);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthModule;
}