// Main application module for Construction CRM

class ConstructionCRM {
    constructor() {
        this.currentModule = null;
        this.modules = {};
        this.router = new Router();
        this.initialized = false;
    }

    // Initialize the application
    async init() {
        if (this.initialized) return;

        try {
            // Show loading screen
            this.showLoading();

            // Check for existing authentication
            await this.checkAuth();

            // Initialize UI components
            this.initUI();

            // Initialize router
            this.initRouter();

            // Load initial content
            await this.loadInitialContent();

            this.initialized = true;
            
            // Hide loading screen
            this.hideLoading();

        } catch (error) {
            console.error('Application initialization error:', error);
            this.hideLoading();
            this.showLogin();
        }
    }

    // Check authentication status
    async checkAuth() {
        const token = StorageUtils.get('authToken');
        const savedUser = StorageUtils.get('currentUser');

        if (token && savedUser) {
            api.setToken(token);
            currentUser = savedUser;

            try {
                // Verify token is still valid
                const profile = await AuthAPI.getProfile();
                currentUser = profile;
                StorageUtils.set('currentUser', profile);
                return true;
            } catch (error) {
                // Token is invalid
                this.logout();
                return false;
            }
        }

        return false;
    }

    // Initialize UI components
    initUI() {
        // Initialize sidebar
        this.initSidebar();

        // Initialize header
        this.initHeader();

        // Initialize modals
        this.initModals();

        // Initialize notifications
        this.initNotifications();

        // Initialize context menu
        this.initContextMenu();

        // Update user info
        this.updateUserInfo();
    }

    // Initialize sidebar
    initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

        // Desktop sidebar toggle
        sidebarToggle?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Mobile menu toggle
        mobileMenuToggle?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.navigateTo(page);
                }
            });
        });

        // Load sidebar state
        const collapsed = StorageUtils.get('sidebarCollapsed', false);
        if (collapsed) {
            this.toggleSidebar(true);
        }
    }

    // Initialize header
    initHeader() {
        // User menu
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');

        userMenuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });

        // Global search
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', debounce((e) => {
                this.performGlobalSearch(e.target.value);
            }, 300));
        }

        // Notifications and messages buttons
        document.getElementById('notifications-btn')?.addEventListener('click', () => {
            this.showNotificationsPanel();
        });

        document.getElementById('messages-btn')?.addEventListener('click', () => {
            this.showMessagesPanel();
        });
    }

    // Initialize modals
    initModals() {
        const modalOverlay = document.getElementById('modal-overlay');
        
        // Close modal when clicking overlay
        modalOverlay?.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
                this.closeModal();
            }
        });
    }

    // Initialize notifications system
    initNotifications() {
        // Create notifications container if not exists
        if (!document.getElementById('notifications-container')) {
            const container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
    }

    // Initialize context menu
    initContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        
        document.addEventListener('contextmenu', (e) => {
            // Only show context menu on specific elements
            const target = e.target.closest('[data-context-menu]');
            if (target) {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY, target);
            }
        });

        document.addEventListener('click', () => {
            contextMenu.classList.remove('show');
        });
    }

    // Initialize router
    initRouter() {
        // Define routes
        this.router.addRoute('dashboard', () => this.loadModule('dashboard'));
        this.router.addRoute('projects', () => this.loadModule('projects'));
        this.router.addRoute('clients', () => this.loadModule('clients'));
        this.router.addRoute('contractors', () => this.loadModule('contractors'));
        this.router.addRoute('employees', () => this.loadModule('employees'));
        this.router.addRoute('timesheet', () => this.loadModule('timesheet'));
        this.router.addRoute('warehouse', () => this.loadModule('warehouse'));
        this.router.addRoute('estimates', () => this.loadModule('estimates'));
        this.router.addRoute('offers', () => this.loadModule('offers'));
        this.router.addRoute('export-import', () => this.loadModule('export-import'));
        this.router.addRoute('testing', () => this.loadModule('testing'));
        this.router.addRoute('materials', () => this.loadModule('materials'));
        this.router.addRoute('documents', () => this.loadModule('documents'));
        this.router.addRoute('reports', () => this.loadModule('reports'));
        this.router.addRoute('settings', () => this.loadModule('settings'));

        // Start router
        this.router.start();
    }

    // Load initial content
    async loadInitialContent() {
        const hash = window.location.hash.substring(1);
        const page = hash || 'dashboard';
        await this.navigateTo(page);
    }

    // Navigate to page
    async navigateTo(page) {
        try {
            // Update active navigation
            this.updateActiveNavigation(page);

            // Update page title
            this.updatePageTitle(page);

            // Load module
            await this.loadModule(page);

            // Update URL
            window.location.hash = page;

            // Update app state
            appState.currentPage = page;

            // Close mobile menu if open
            this.closeMobileMenu();

        } catch (error) {
            console.error(`Error navigating to ${page}:`, error);
            showNotification(`Ошибка загрузки страницы: ${error.message}`, 'error');
        }
    }

    // Load module
    async loadModule(moduleName) {
        try {
            // Check if module is already loaded
            if (this.modules[moduleName]) {
                if (this.modules[moduleName].show) {
                    this.modules[moduleName].show();
                }
                return;
            }

            // Show loading indicator
            this.showContentLoading();

            // Load module based on name
            let module;
            switch (moduleName) {
                case 'dashboard':
                    module = new DashboardModule();
                    break;
                case 'projects':
                    module = new ProjectsModule();
                    break;
                case 'clients':
                    module = new ClientsModule();
                    break;
                case 'contractors':
                    module = new ContractorsModule();
                    break;
                case 'employees':
                    module = new EmployeesModule();
                    break;
                case 'timesheet':
                    module = new TimesheetModule();
                    break;
                case 'warehouse':
                    module = new WarehouseModule();
                    break;
                case 'estimates':
                    module = new EstimatesModule();
                    break;
                case 'offers':
                    module = new OffersModule();
                    break;
                case 'export-import':
                    module = new ExportImportModule();
                    break;
                case 'testing':
                    module = new SystemTestingModule();
                    break;
                case 'materials':
                    module = new MaterialsModule();
                    break;
                case 'documents':
                    module = new DocumentsModule();
                    break;
                case 'reports':
                    module = new ReportsModule();
                    break;
                case 'settings':
                    module = new SettingsModule();
                    break;
                default:
                    throw new Error(`Unknown module: ${moduleName}`);
            }

            // Initialize module
            await module.init();

            // Store module
            this.modules[moduleName] = module;
            this.currentModule = module;

            // Hide other modules
            Object.keys(this.modules).forEach(key => {
                if (key !== moduleName && this.modules[key].hide) {
                    this.modules[key].hide();
                }
            });

            // Hide loading indicator
            this.hideContentLoading();

        } catch (error) {
            console.error(`Error loading module ${moduleName}:`, error);
            this.hideContentLoading();
            throw error;
        }
    }

    // Update active navigation
    updateActiveNavigation(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeItem = document.querySelector(`[data-page="${page}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    // Update page title
    updatePageTitle(page) {
        const titles = {
            dashboard: 'Дашборд',
            projects: 'Проекты',
            clients: 'Клиенты',
            contractors: 'Подрядчики',
            employees: 'Сотрудники',
            timesheet: 'Табель времени',
            warehouse: 'Склад',
            estimates: 'Сметы',
            offers: 'Коммерческие предложения',
            materials: 'Заявки материалов',
            documents: 'Документы',
            reports: 'Отчеты',
            settings: 'Настройки'
        };

        const title = titles[page] || StringUtils.capitalize(page);
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = title;
        }
        document.title = `${title} - Construction CRM`;
    }

    // Toggle sidebar
    toggleSidebar(force) {
        const app = document.getElementById('app');
        const isCollapsed = force !== undefined ? !force : app.classList.contains('sidebar-collapsed');
        
        app.classList.toggle('sidebar-collapsed', !isCollapsed);
        appState.sidebarCollapsed = !isCollapsed;
        
        // Save state
        StorageUtils.set('sidebarCollapsed', !isCollapsed);
    }

    // Toggle mobile menu
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = this.getMobileOverlay();
        
        const isOpen = sidebar.classList.contains('mobile-open');
        
        sidebar.classList.toggle('mobile-open', !isOpen);
        overlay.classList.toggle('show', !isOpen);
        
        appState.mobileMenuOpen = !isOpen;
    }

    // Close mobile menu
    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = this.getMobileOverlay();
        
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('show');
        appState.mobileMenuOpen = false;
    }

    // Get or create mobile overlay
    getMobileOverlay() {
        let overlay = document.getElementById('mobile-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mobile-overlay';
            overlay.className = 'mobile-overlay';
            overlay.addEventListener('click', () => this.closeMobileMenu());
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    // Update user info in UI
    updateUserInfo() {
        if (!currentUser) return;

        const userName = document.getElementById('current-user-name');
        const userRole = document.getElementById('current-user-role');

        if (userName) {
            userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        }

        if (userRole) {
            const roleNames = {
                admin: 'Администратор',
                general_director: 'Генеральный директор',
                construction_director: 'Директор по строительству',
                site_manager: 'Начальник участка',
                foreman: 'Прораб',
                estimator: 'Сметчик',
                pto_employee: 'Сотрудник ПТО',
                procurement: 'Снабженец'
            };
            userRole.textContent = roleNames[currentUser.role] || currentUser.role;
        }
    }

    // Show/hide loading screens
    showLoading() {
        document.getElementById('loading-screen').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-screen').style.display = 'none';
    }

    showContentLoading() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner"></div>
                <p class="mt-3">Загрузка...</p>
            </div>
        `;
    }

    hideContentLoading() {
        // Content will be replaced by module
    }

    // Show login page
    showLogin() {
        document.getElementById('app').style.display = 'none';
        document.getElementById('login-page').style.display = 'block';
        document.getElementById('loading-screen').style.display = 'none';
    }

    // Show main app
    showApp() {
        document.getElementById('app').style.display = 'grid';
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'none';
    }

    // Logout
    async logout() {
        try {
            await AuthAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear modules
            this.modules = {};
            this.currentModule = null;
            
            // Show login page
            this.showLogin();
        }
    }

    // Global search
    async performGlobalSearch(query) {
        if (!query || query.length < 2) return;

        try {
            // Implement global search across all modules
            console.log('Performing global search for:', query);
            // This would search across projects, clients, contractors, etc.
        } catch (error) {
            console.error('Global search error:', error);
        }
    }

    // Modal methods
    showModal(title, content, footer = '') {
        const modal = document.getElementById('modal');
        const modalOverlay = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalFooter = document.getElementById('modal-footer');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modalFooter.innerHTML = footer;

        modalOverlay.classList.add('show');
    }

    closeModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        modalOverlay.classList.remove('show');
    }

    // Context menu
    showContextMenu(x, y, element) {
        const contextMenu = document.getElementById('context-menu');
        
        // Position menu
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        
        // Show menu
        contextMenu.classList.add('show');
        
        // Store element reference
        contextMenu.dataset.targetElement = element.id || '';
    }

    // Notifications panel
    showNotificationsPanel() {
        // Implement notifications panel
        console.log('Show notifications panel');
    }

    // Messages panel
    showMessagesPanel() {
        // Implement messages panel
        console.log('Show messages panel');
    }
}

// Simple router class
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    start() {
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash.substring(1);
        const route = hash || 'dashboard';
        
        if (this.routes[route]) {
            this.currentRoute = route;
            this.routes[route]();
        } else {
            // Default route
            window.location.hash = 'dashboard';
        }
    }
}

// Global functions accessible from HTML
window.logout = () => app.logout();
window.showProfile = () => app.navigateTo('profile');
window.showSettings = () => app.navigateTo('settings');
window.closeModal = () => app.closeModal();
window.togglePassword = () => {
    const passwordInput = document.getElementById('password');
    const toggle = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggle.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggle.className = 'fas fa-eye';
    }
};

// Context menu actions
window.editItem = () => {
    const contextMenu = document.getElementById('context-menu');
    const targetId = contextMenu.dataset.targetElement;
    console.log('Edit item:', targetId);
    contextMenu.classList.remove('show');
};

window.deleteItem = () => {
    const contextMenu = document.getElementById('context-menu');
    const targetId = contextMenu.dataset.targetElement;
    console.log('Delete item:', targetId);
    contextMenu.classList.remove('show');
};

window.copyItem = () => {
    const contextMenu = document.getElementById('context-menu');
    const targetId = contextMenu.dataset.targetElement;
    console.log('Copy item:', targetId);
    contextMenu.classList.remove('show');
};

// Notification system
window.showNotification = (message, type = 'info', duration = 5000) => {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    notification.innerHTML = `
        <i class="notification-icon ${iconMap[type] || iconMap.info}"></i>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(notification);

    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ConstructionCRM();
    app.init();
});