// ИЗМЕНЕНИЯ ДЛЯ PUBLIC/JS/APP.JS
// Заменить метод init() на следующий:

// Initialize the application
async init() {
    if (this.initialized) return;

    try {
        // Show loading screen
        this.showLoading();

        // Initialize auth module first
        if (window.authModule) {
            window.authModule.init();
        }

        // Check for existing authentication
        const isAuthenticated = await this.checkAuth();
        
        if (isAuthenticated) {
            // Initialize UI components
            this.initUI();

            // Initialize router
            this.initRouter();

            // Load initial content
            await this.loadInitialContent();
            
            // Show main app
            this.showApp();
        } else {
            // Show login page
            this.showLogin();
        }

        this.initialized = true;
        
        // Hide loading screen
        this.hideLoading();

    } catch (error) {
        console.error('Application initialization error:', error);
        this.hideLoading();
        this.showLogin();
    }
}