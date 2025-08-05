// Dashboard module for Construction CRM - Enhanced Analytics

class DashboardModule {
    constructor() {
        this.container = null;
        this.data = null;
        this.charts = {};
        this.refreshInterval = null;
        this.selectedPeriod = '30d';
        this.notifications = [];
        this.realtimeData = {};
    }

    // Initialize dashboard module
    async init() {
        this.container = document.getElementById('content-area');
        await this.render();
        await this.loadData();
        this.initEventListeners();
        this.initCharts();
        this.startAutoRefresh();
        this.loadNotifications();
    }

    // Render enhanced dashboard layout
    async render() {
        this.container.innerHTML = `
            <div class="dashboard enhanced-dashboard">
                <!-- Dashboard Header with Controls -->
                <div class="dashboard-header">
                    <div class="header-content">
                        <h1>Аналитическая панель</h1>
                        <div class="dashboard-controls">
                            <div class="period-selector">
                                <select id="periodSelect" onchange="dashboardModule.changePeriod(this.value)">
                                    <option value="7d">Последние 7 дней</option>
                                    <option value="30d" selected>Последние 30 дней</option>
                                    <option value="90d">Последние 3 месяца</option>
                                    <option value="12m">Последний год</option>
                                </select>
                            </div>
                            <button class="btn btn-outline" onclick="dashboardModule.refreshData()">
                                <i class="fas fa-sync-alt"></i> Обновить
                            </button>
                            <button class="btn btn-primary" onclick="dashboardModule.exportReport()">
                                <i class="fas fa-download"></i> Отчет
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Key Performance Indicators -->
                <div class="kpi-section">
                    <h2 class="section-title">Ключевые показатели</h2>
                    <div class="metrics-grid grid-responsive cols-6">
                        <div class="metric-card card primary" id="projects-metric">
                            <div class="card-body">
                                <div class="metric-header">
                                    <h3 class="metric-title">Проекты</h3>
                                    <div class="metric-icon">
                                        <i class="fas fa-project-diagram"></i>
                                    </div>
                                </div>
                                <div class="metric-value" id="total-projects">0</div>
                                <div class="metric-details">
                                    <span class="metric-label">Активных: <span id="active-projects">0</span></span>
                                    <span class="metric-change" id="projects-change">+0%</span>
                                </div>
                                <div class="metric-progress">
                                    <div class="progress-bar" id="projects-progress"></div>
                                </div>
                            </div>
                        </div>

                        <div class="metric-card card success" id="revenue-metric">
                            <div class="card-body">
                                <div class="metric-header">
                                    <h3 class="metric-title">Выручка</h3>
                                    <div class="metric-icon">
                                        <i class="fas fa-ruble-sign"></i>
                                    </div>
                                </div>
                                <div class="metric-value" id="total-revenue">0 ₽</div>
                                <div class="metric-details">
                                    <span class="metric-label">Прибыль: <span id="total-profit">0 ₽</span></span>
                                    <span class="metric-change" id="revenue-change">+0%</span>
                                </div>
                                <div class="metric-progress">
                                    <div class="progress-bar" id="revenue-progress"></div>
                                </div>
                            </div>
                        </div>

                        <div class="metric-card card info" id="clients-metric">
                            <div class="card-body">
                                <div class="metric-header">
                                    <h3 class="metric-title">Клиенты</h3>
                                    <div class="metric-icon">
                                        <i class="fas fa-users"></i>
                                    </div>
                                </div>
                                <div class="metric-value" id="total-clients">0</div>
                                <div class="metric-details">
                                    <span class="metric-label">Новых: <span id="new-clients">0</span></span>
                                    <span class="metric-change" id="clients-change">+0%</span>
                                </div>
                                <div class="metric-progress">
                                    <div class="progress-bar" id="clients-progress"></div>
                                </div>
                            </div>
                        </div>

                        <div class="metric-card card warning" id="estimates-metric">
                            <div class="card-body">
                                <div class="metric-header">
                                    <h3 class="metric-title">Сметы</h3>
                                    <div class="metric-icon">
                                        <i class="fas fa-calculator"></i>
                                    </div>
                                </div>
                                <div class="metric-value" id="total-estimates">0</div>
                                <div class="metric-details">
                                    <span class="metric-label">Утверждено: <span id="approved-estimates">0</span></span>
                                    <span class="metric-change" id="estimates-change">+0%</span>
                                </div>
                                <div class="metric-progress">
                                    <div class="progress-bar" id="estimates-progress"></div>
                                </div>
                            </div>
                        </div>

                        <div class="metric-card card danger" id="warehouse-metric">
                            <div class="card-body">
                                <div class="metric-header">
                                    <h3 class="metric-title">Склад</h3>
                                    <div class="metric-icon">
                                        <i class="fas fa-warehouse"></i>
                                    </div>
                                </div>
                                <div class="metric-value" id="warehouse-value">0 ₽</div>
                                <div class="metric-details">
                                    <span class="metric-label">Позиций: <span id="warehouse-items">0</span></span>
                                    <span class="metric-change warning" id="low-stock-alert">0 критических</span>
                                </div>
                                <div class="metric-progress">
                                    <div class="progress-bar" id="warehouse-progress"></div>
                                </div>
                            </div>
                        </div>

                        <div class="metric-card card secondary" id="employees-metric">
                            <div class="card-body">
                                <div class="metric-header">
                                    <h3 class="metric-title">Сотрудники</h3>
                                    <div class="metric-icon">
                                        <i class="fas fa-hard-hat"></i>
                                    </div>
                                </div>
                                <div class="metric-value" id="total-employees">0</div>
                                <div class="metric-details">
                                    <span class="metric-label">На объектах: <span id="active-employees">0</span></span>
                                    <span class="metric-change" id="employees-change">+0%</span>
                                </div>
                                <div class="metric-progress">
                                    <div class="progress-bar" id="employees-progress"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts and Analytics Section -->
                <div class="analytics-section">
                    <div class="analytics-grid">
                        <!-- Revenue Trends -->
                        <div class="chart-card card large">
                            <div class="card-header">
                                <h3>Динамика доходов</h3>
                                <div class="chart-controls">
                                    <button class="btn btn-sm chart-type-btn active" data-type="line" onclick="dashboardModule.changeChartType('revenue', 'line')">
                                        <i class="fas fa-chart-line"></i>
                                    </button>
                                    <button class="btn btn-sm chart-type-btn" data-type="bar" onclick="dashboardModule.changeChartType('revenue', 'bar')">
                                        <i class="fas fa-chart-bar"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <canvas id="revenueChart" width="400" height="200"></canvas>
                            </div>
                        </div>

                        <!-- Project Status Pie Chart -->
                        <div class="chart-card card medium">
                            <div class="card-header">
                                <h3>Статусы проектов</h3>
                            </div>
                            <div class="card-body">
                                <canvas id="projectStatusChart" width="300" height="300"></canvas>
                            </div>
                        </div>

                        <!-- Team Performance -->
                        <div class="chart-card card medium">
                            <div class="card-header">
                                <h3>Эффективность команды</h3>
                            </div>
                            <div class="card-body">
                                <canvas id="teamPerformanceChart" width="300" height="200"></canvas>
                            </div>
                        </div>

                        <!-- Warehouse Analytics -->
                        <div class="chart-card card large">
                            <div class="card-header">
                                <h3>Аналитика склада</h3>
                                <div class="chart-tabs">
                                    <button class="tab-btn active" data-tab="stock" onclick="dashboardModule.switchWarehouseTab('stock')">Остатки</button>
                                    <button class="tab-btn" data-tab="movements" onclick="dashboardModule.switchWarehouseTab('movements')">Движения</button>
                                    <button class="tab-btn" data-tab="costs" onclick="dashboardModule.switchWarehouseTab('costs')">Затраты</button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="warehouseTab-stock" class="tab-content active">
                                    <canvas id="warehouseStockChart" width="400" height="200"></canvas>
                                </div>
                                <div id="warehouseTab-movements" class="tab-content">
                                    <canvas id="warehouseMovementsChart" width="400" height="200"></canvas>
                                </div>
                                <div id="warehouseTab-costs" class="tab-content">
                                    <canvas id="warehouseCostsChart" width="400" height="200"></canvas>
                                </div>
                            </div>
                        </div>

                        <!-- Client Acquisition -->
                        <div class="chart-card card medium">
                            <div class="card-header">
                                <h3>Привлечение клиентов</h3>
                            </div>
                            <div class="card-body">
                                <canvas id="clientAcquisitionChart" width="300" height="200"></canvas>
                            </div>
                        </div>

                        <!-- Financial Flow -->
                        <div class="chart-card card large">
                            <div class="card-header">
                                <h3>Денежные потоки</h3>
                            </div>
                            <div class="card-body">
                                <canvas id="cashFlowChart" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity and Notifications -->
                <div class="activity-section">
                    <div class="activity-grid">
                        <!-- Recent Projects -->
                        <div class="activity-card card">
                            <div class="card-header">
                                <h3>Последние проекты</h3>
                                <a href="#projects" class="btn btn-sm btn-outline">Все проекты</a>
                            </div>
                            <div class="card-body">
                                <div id="recent-projects" class="activity-list">
                                    <!-- Will be populated by loadRecentProjects() -->
                                </div>
                            </div>
                        </div>

                        <!-- Urgent Tasks -->
                        <div class="activity-card card">
                            <div class="card-header">
                                <h3>Срочные задачи</h3>
                                <span class="badge badge-danger" id="urgent-tasks-count">0</span>
                            </div>
                            <div class="card-body">
                                <div id="urgent-tasks" class="activity-list">
                                    <!-- Will be populated by loadUrgentTasks() -->
                                </div>
                            </div>
                        </div>

                        <!-- Notifications -->
                        <div class="activity-card card">
                            <div class="card-header">
                                <h3>Уведомления</h3>
                                <button class="btn btn-sm btn-outline" onclick="dashboardModule.markAllAsRead()">
                                    Отметить прочитанными
                                </button>
                            </div>
                            <div class="card-body">
                                <div id="notifications-list" class="activity-list">
                                    <!-- Will be populated by loadNotifications() -->
                                </div>
                            </div>
                        </div>

                        <!-- Low Stock Alerts -->
                        <div class="activity-card card">
                            <div class="card-header">
                                <h3>Критические остатки</h3>
                                <span class="badge badge-warning" id="low-stock-count">0</span>
                            </div>
                            <div class="card-body">
                                <div id="low-stock-items" class="activity-list">
                                    <!-- Will be populated by loadLowStockItems() -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions-section">
                    <h2 class="section-title">Быстрые действия</h2>
                    <div class="quick-actions-grid">
                        <button class="action-btn btn btn-primary" onclick="app.navigateTo('projects')">
                            <i class="fas fa-plus"></i>
                            <span>Новый проект</span>
                        </button>
                        <button class="action-btn btn btn-success" onclick="app.navigateTo('clients')">
                            <i class="fas fa-user-plus"></i>
                            <span>Добавить клиента</span>
                        </button>
                        <button class="action-btn btn btn-warning" onclick="app.navigateTo('estimates')">
                            <i class="fas fa-calculator"></i>
                            <span>Создать смету</span>
                        </button>
                        <button class="action-btn btn btn-info" onclick="app.navigateTo('offers')">
                            <i class="fas fa-handshake"></i>
                            <span>Новое КП</span>
                        </button>
                        <button class="action-btn btn btn-secondary" onclick="app.navigateTo('warehouse')">
                            <i class="fas fa-boxes"></i>
                            <span>Учет товаров</span>
                        </button>
                        <button class="action-btn btn btn-dark" onclick="dashboardModule.showReports()">
                            <i class="fas fa-chart-line"></i>
                            <span>Отчеты</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Load enhanced dashboard data
    async loadData() {
        try {
            // Simulate loading data from multiple sources
            await Promise.all([
                this.loadKPIData(),
                this.loadChartData(),
                this.loadRecentActivity()
            ]);
            
            this.updateKPIs();
            this.updateCharts();
            this.updateActivity();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            NotificationManager.error('Ошибка загрузки данных дашборда');
        }
    }

    // Load KPI data
    async loadKPIData() {
        // Simulate API calls with enhanced data
        this.data = {
            projects: {
                total: 24,
                active: 18,
                completed: 15,
                pending: 6,
                change: 12.5,
                progress: 75
            },
            revenue: {
                total: 15750000,
                profit: 2362500,
                change: 8.3,
                target: 20000000,
                progress: 78.75
            },
            clients: {
                total: 156,
                new: 12,
                active: 89,
                change: 15.2,
                progress: 82
            },
            estimates: {
                total: 45,
                approved: 32,
                pending: 8,
                rejected: 5,
                change: 22.1,
                progress: 71
            },
            warehouse: {
                value: 2850000,
                items: 1247,
                categories: 32,
                lowStock: 15,
                critical: 3,
                progress: 65
            },
            employees: {
                total: 67,
                active: 52,
                onSite: 38,
                change: 5.8,
                progress: 88
            }
        };

        // Load chart data
        this.chartData = {
            revenue: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                datasets: [{
                    label: 'Выручка',
                    data: [1200000, 1350000, 1180000, 1420000, 1650000, 1750000],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Прибыль',
                    data: [180000, 202500, 177000, 213000, 247500, 262500],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4
                }]
            },
            projectStatus: {
                labels: ['В работе', 'Завершены', 'Приостановлены', 'Планируемые'],
                datasets: [{
                    data: [18, 15, 3, 6],
                    backgroundColor: ['#3498db', '#27ae60', '#f39c12', '#e74c3c']
                }]
            },
            teamPerformance: {
                labels: ['Прорабы', 'Сметчики', 'ПТО', 'Снабженцы'],
                datasets: [{
                    label: 'Эффективность (%)',
                    data: [92, 87, 94, 89],
                    backgroundColor: ['#3498db', '#27ae60', '#f39c12', '#9b59b6']
                }]
            },
            warehouseStock: {
                labels: ['Стройматериалы', 'Инструменты', 'Электрика', 'Сантехника', 'Отделка'],
                datasets: [{
                    label: 'Остатки (₽)',
                    data: [850000, 420000, 320000, 180000, 280000],
                    backgroundColor: '#3498db'
                }]
            },
            clientAcquisition: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                datasets: [{
                    label: 'Новые клиенты',
                    data: [8, 12, 7, 15, 11, 12],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4
                }]
            },
            cashFlow: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                datasets: [{
                    label: 'Поступления',
                    data: [1200000, 1350000, 1180000, 1420000, 1650000, 1750000],
                    backgroundColor: '#27ae60'
                }, {
                    label: 'Расходы',
                    data: [980000, 1120000, 950000, 1150000, 1380000, 1450000],
                    backgroundColor: '#e74c3c'
                }]
            }
        };
    }

    // Load recent activity data
    async loadRecentActivity() {
        this.activityData = {
            recentProjects: [
                { id: 1, name: 'Дом на Пушкина, 15', status: 'active', progress: 65, client: 'ООО "Стройинвест"' },
                { id: 2, name: 'Офис на Ленина, 82', status: 'planning', progress: 25, client: 'ИП Петров А.В.' },
                { id: 3, name: 'Коттедж в Сосновке', status: 'active', progress: 80, client: 'Иванов И.И.' }
            ],
            urgentTasks: [
                { id: 1, text: 'Согласовать смету для проекта #1024', deadline: '2024-01-20', priority: 'high' },
                { id: 2, text: 'Заказать арматуру для объекта "Дом на Пушкина"', deadline: '2024-01-18', priority: 'critical' },
                { id: 3, text: 'Подготовить отчет по проекту #1018', deadline: '2024-01-22', priority: 'medium' }
            ],
            notifications: [
                { id: 1, text: 'Новый клиент зарегистрирован', time: '5 мин назад', type: 'info', read: false },
                { id: 2, text: 'Смета #SM-0045 утверждена', time: '15 мин назад', type: 'success', read: false },
                { id: 3, text: 'Критически низкий остаток: Арматура d12', time: '1 час назад', type: 'warning', read: true }
            ],
            lowStockItems: [
                { id: 1, name: 'Арматура d12', current: 25, minimum: 50, unit: 'м', critical: true },
                { id: 2, name: 'Цемент М400', current: 3, minimum: 5, unit: 'т', critical: true },
                { id: 3, name: 'Кирпич красный', current: 150, minimum: 200, unit: 'шт', critical: false }
            ]
        };
    }

    // Update KPI metrics
    updateKPIs() {
        // Projects
        document.getElementById('total-projects').textContent = this.data.projects.total;
        document.getElementById('active-projects').textContent = this.data.projects.active;
        document.getElementById('projects-change').textContent = `+${this.data.projects.change}%`;
        document.getElementById('projects-progress').style.width = `${this.data.projects.progress}%`;

        // Revenue
        document.getElementById('total-revenue').textContent = NumberUtils.formatCurrency(this.data.revenue.total);
        document.getElementById('total-profit').textContent = NumberUtils.formatCurrency(this.data.revenue.profit);
        document.getElementById('revenue-change').textContent = `+${this.data.revenue.change}%`;
        document.getElementById('revenue-progress').style.width = `${this.data.revenue.progress}%`;

        // Clients
        document.getElementById('total-clients').textContent = this.data.clients.total;
        document.getElementById('new-clients').textContent = this.data.clients.new;
        document.getElementById('clients-change').textContent = `+${this.data.clients.change}%`;
        document.getElementById('clients-progress').style.width = `${this.data.clients.progress}%`;

        // Estimates
        document.getElementById('total-estimates').textContent = this.data.estimates.total;
        document.getElementById('approved-estimates').textContent = this.data.estimates.approved;
        document.getElementById('estimates-change').textContent = `+${this.data.estimates.change}%`;
        document.getElementById('estimates-progress').style.width = `${this.data.estimates.progress}%`;

        // Warehouse
        document.getElementById('warehouse-value').textContent = NumberUtils.formatCurrency(this.data.warehouse.value);
        document.getElementById('warehouse-items').textContent = this.data.warehouse.items;
        document.getElementById('low-stock-alert').textContent = `${this.data.warehouse.critical} критических`;
        document.getElementById('warehouse-progress').style.width = `${this.data.warehouse.progress}%`;

        // Employees
        document.getElementById('total-employees').textContent = this.data.employees.total;
        document.getElementById('active-employees').textContent = this.data.employees.onSite;
        document.getElementById('employees-change').textContent = `+${this.data.employees.change}%`;
        document.getElementById('employees-progress').style.width = `${this.data.employees.progress}%`;
    }

    // Initialize charts
    initCharts() {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        this.charts.revenue = new Chart(revenueCtx, {
            type: 'line',
            data: this.chartData.revenue,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return NumberUtils.formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });

        // Project Status Chart
        const projectStatusCtx = document.getElementById('projectStatusChart').getContext('2d');
        this.charts.projectStatus = new Chart(projectStatusCtx, {
            type: 'doughnut',
            data: this.chartData.projectStatus,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Team Performance Chart
        const teamCtx = document.getElementById('teamPerformanceChart').getContext('2d');
        this.charts.teamPerformance = new Chart(teamCtx, {
            type: 'bar',
            data: this.chartData.teamPerformance,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        // Warehouse Stock Chart
        const warehouseCtx = document.getElementById('warehouseStockChart').getContext('2d');
        this.charts.warehouseStock = new Chart(warehouseCtx, {
            type: 'bar',
            data: this.chartData.warehouseStock,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return NumberUtils.formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });

        // Client Acquisition Chart
        const clientCtx = document.getElementById('clientAcquisitionChart').getContext('2d');
        this.charts.clientAcquisition = new Chart(clientCtx, {
            type: 'line',
            data: this.chartData.clientAcquisition,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Cash Flow Chart
        const cashFlowCtx = document.getElementById('cashFlowChart').getContext('2d');
        this.charts.cashFlow = new Chart(cashFlowCtx, {
            type: 'bar',
            data: this.chartData.cashFlow,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return NumberUtils.formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Update activity sections
    updateActivity() {
        this.updateRecentProjects();
        this.updateUrgentTasks();
        this.updateNotifications();
        this.updateLowStockItems();
    }

    // Update recent projects
    updateRecentProjects() {
        const container = document.getElementById('recent-projects');
        const projectsHtml = this.activityData.recentProjects.map(project => `
            <div class="activity-item">
                <div class="activity-content">
                    <h4>${project.name}</h4>
                    <p>Клиент: ${project.client}</p>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${project.progress}%"></div>
                        <span class="progress-text">${project.progress}%</span>
                    </div>
                </div>
                <span class="status-badge status-${project.status}">
                    ${project.status === 'active' ? 'Активный' : 'Планирование'}
                </span>
            </div>
        `).join('');
        container.innerHTML = projectsHtml;
    }

    // Update urgent tasks
    updateUrgentTasks() {
        const container = document.getElementById('urgent-tasks');
        const tasksHtml = this.activityData.urgentTasks.map(task => `
            <div class="activity-item">
                <div class="activity-content">
                    <p>${task.text}</p>
                    <small>Срок: ${DateUtils.formatDate(task.deadline)}</small>
                </div>
                <span class="priority-badge priority-${task.priority}">
                    ${task.priority === 'critical' ? 'Критично' : task.priority === 'high' ? 'Важно' : 'Средне'}
                </span>
            </div>
        `).join('');
        container.innerHTML = tasksHtml;
        document.getElementById('urgent-tasks-count').textContent = this.activityData.urgentTasks.length;
    }

    // Update notifications
    updateNotifications() {
        const container = document.getElementById('notifications-list');
        const notificationsHtml = this.activityData.notifications.map(notification => `
            <div class="activity-item ${notification.read ? 'read' : 'unread'}">
                <div class="activity-content">
                    <p>${notification.text}</p>
                    <small>${notification.time}</small>
                </div>
                <span class="notification-type type-${notification.type}">
                    <i class="fas fa-${notification.type === 'info' ? 'info-circle' : notification.type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                </span>
            </div>
        `).join('');
        container.innerHTML = notificationsHtml;
    }

    // Update low stock items
    updateLowStockItems() {
        const container = document.getElementById('low-stock-items');
        const itemsHtml = this.activityData.lowStockItems.map(item => `
            <div class="activity-item">
                <div class="activity-content">
                    <h4>${item.name}</h4>
                    <p>Остаток: ${item.current} ${item.unit} (мин: ${item.minimum} ${item.unit})</p>
                </div>
                <span class="stock-status ${item.critical ? 'critical' : 'warning'}">
                    ${item.critical ? 'Критично' : 'Мало'}
                </span>
            </div>
        `).join('');
        container.innerHTML = itemsHtml;
        document.getElementById('low-stock-count').textContent = this.activityData.lowStockItems.filter(item => item.critical).length;
    }

    // Change time period
    changePeriod(period) {
        this.selectedPeriod = period;
        this.loadData();
    }

    // Change chart type
    changeChartType(chartName, type) {
        if (this.charts[chartName]) {
            this.charts[chartName].config.type = type;
            this.charts[chartName].update();
        }
        
        // Update active button
        const buttons = document.querySelectorAll('.chart-type-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
    }

    // Switch warehouse tab
    switchWarehouseTab(tab) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(`warehouseTab-${tab}`).classList.add('active');
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    }

    // Export report
    exportReport() {
        NotificationManager.info('Экспорт отчета в разработке');
    }

    // Show reports
    showReports() {
        app.navigateTo('reports');
    }

    // Mark all notifications as read
    markAllAsRead() {
        this.activityData.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateNotifications();
        NotificationManager.success('Все уведомления отмечены как прочитанные');
    }

    // Refresh data
    async refreshData() {
        await this.loadData();
        NotificationManager.success('Данные обновлены');
    }

    // Update charts
    updateCharts() {
        Object.keys(this.charts).forEach(chartName => {
            if (this.charts[chartName]) {
                this.charts[chartName].update();
            }
        });
    }

    // Initialize event listeners
    initEventListeners() {
        // Refresh button
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.refreshData();
            }
        });
    }

    // Start auto refresh
    startAutoRefresh() {
        // Refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 5 * 60 * 1000);
    }

    // Stop auto refresh
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Cleanup when leaving dashboard
    destroy() {
        this.stopAutoRefresh();
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

// Create global instance
const dashboardModule = new DashboardModule();

// Chart.js configuration
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.color = '#495057';

// Export for global access
window.DashboardModule = DashboardModule;
window.dashboardModule = dashboardModule;