// Dashboard module for Construction CRM

class DashboardModule {
    constructor() {
        this.container = null;
        this.data = null;
        this.charts = {};
        this.refreshInterval = null;
    }

    // Initialize dashboard module
    async init() {
        this.container = document.getElementById('content-area');
        await this.render();
        await this.loadData();
        this.initEventListeners();
        this.startAutoRefresh();
    }

    // Render dashboard layout
    async render() {
        this.container.innerHTML = `
            <div class="dashboard">
                <!-- Key metrics cards -->
                <div class="metrics-grid grid-responsive cols-4">
                    <div class="metric-card card" id="projects-metric">
                        <div class="card-body">
                            <div class="metric-header">
                                <h3 class="metric-title">Проекты</h3>
                                <div class="metric-icon bg-primary">
                                    <i class="fas fa-project-diagram"></i>
                                </div>
                            </div>
                            <div class="metric-value" id="total-projects">0</div>
                            <div class="metric-details">
                                <span class="metric-label">Активных: <span id="active-projects">0</span></span>
                                <span class="metric-change positive" id="projects-change">+0%</span>
                            </div>
                        </div>
                    </div>

                    <div class="metric-card card" id="clients-metric">
                        <div class="card-body">
                            <div class="metric-header">
                                <h3 class="metric-title">Клиенты</h3>
                                <div class="metric-icon bg-success">
                                    <i class="fas fa-users"></i>
                                </div>
                            </div>
                            <div class="metric-value" id="total-clients">0</div>
                            <div class="metric-details">
                                <span class="metric-label">Активных: <span id="active-clients">0</span></span>
                                <span class="metric-change positive" id="clients-change">+0%</span>
                            </div>
                        </div>
                    </div>

                    <div class="metric-card card" id="revenue-metric">
                        <div class="card-body">
                            <div class="metric-header">
                                <h3 class="metric-title">Выручка</h3>
                                <div class="metric-icon bg-warning">
                                    <i class="fas fa-ruble-sign"></i>
                                </div>
                            </div>
                            <div class="metric-value" id="total-revenue">0 ₽</div>
                            <div class="metric-details">
                                <span class="metric-label">За месяц</span>
                                <span class="metric-change positive" id="revenue-change">+0%</span>
                            </div>
                        </div>
                    </div>

                    <div class="metric-card card" id="employees-metric">
                        <div class="card-body">
                            <div class="metric-header">
                                <h3 class="metric-title">Сотрудники</h3>
                                <div class="metric-icon bg-info">
                                    <i class="fas fa-user-hard-hat"></i>
                                </div>
                            </div>
                            <div class="metric-value" id="total-employees">0</div>
                            <div class="metric-details">
                                <span class="metric-label">Активных: <span id="active-employees">0</span></span>
                                <span class="metric-change neutral" id="employees-change">0%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts and analytics -->
                <div class="dashboard-content grid-responsive cols-2">
                    <!-- Projects chart -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Проекты по статусам</h3>
                            <div class="card-actions">
                                <select id="projects-period" class="form-select">
                                    <option value="month">Месяц</option>
                                    <option value="quarter">Квартал</option>
                                    <option value="year">Год</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <canvas id="projects-chart" width="400" height="200"></canvas>
                        </div>
                    </div>

                    <!-- Revenue chart -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Финансовые показатели</h3>
                            <div class="card-actions">
                                <select id="revenue-period" class="form-select">
                                    <option value="month">Месяц</option>
                                    <option value="quarter">Квартал</option>
                                    <option value="year">Год</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <canvas id="revenue-chart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Recent activities and tasks -->
                <div class="dashboard-widgets grid-responsive cols-3">
                    <!-- Recent projects -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Последние проекты</h3>
                            <a href="#projects" class="btn btn-sm btn-outline">Все проекты</a>
                        </div>
                        <div class="card-body p-0">
                            <div class="list-group" id="recent-projects">
                                <div class="list-item loading">
                                    <div class="spinner"></div>
                                    <span>Загрузка...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Urgent tasks -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Срочные задачи</h3>
                            <span class="badge bg-danger" id="urgent-tasks-count">0</span>
                        </div>
                        <div class="card-body p-0">
                            <div class="list-group" id="urgent-tasks">
                                <div class="list-item loading">
                                    <div class="spinner"></div>
                                    <span>Загрузка...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Low stock items -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Низкие остатки</h3>
                            <span class="badge bg-warning" id="low-stock-count">0</span>
                        </div>
                        <div class="card-body p-0">
                            <div class="list-group" id="low-stock">
                                <div class="list-item loading">
                                    <div class="spinner"></div>
                                    <span>Загрузка...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick actions -->
                <div class="quick-actions">
                    <h3>Быстрые действия</h3>
                    <div class="actions-grid">
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
                            <i class="fas fa-file-contract"></i>
                            <span>КП</span>
                        </button>
                        <button class="action-btn btn btn-secondary" onclick="app.navigateTo('materials')">
                            <i class="fas fa-shopping-cart"></i>
                            <span>Заявка материалов</span>
                        </button>
                        <button class="action-btn btn btn-outline" onclick="app.navigateTo('reports')">
                            <i class="fas fa-chart-bar"></i>
                            <span>Отчеты</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Load dashboard data
    async loadData() {
        try {
            this.data = await DashboardAPI.getData();
            this.updateMetrics();
            this.updateWidgets();
            this.initCharts();
        } catch (error) {
            console.error('Dashboard data loading error:', error);
            showNotification('Ошибка загрузки данных дашборда', 'error');
        }
    }

    // Update metrics cards
    updateMetrics() {
        if (!this.data) return;

        // Projects metrics
        document.getElementById('total-projects').textContent = this.data.projects?.total_projects || 0;
        document.getElementById('active-projects').textContent = this.data.projects?.active_projects || 0;

        // Clients metrics
        document.getElementById('total-clients').textContent = this.data.clients?.total_clients || 0;
        document.getElementById('active-clients').textContent = this.data.clients?.active_clients || 0;

        // Revenue metrics
        const totalBudget = this.data.projects?.total_budget || 0;
        document.getElementById('total-revenue').textContent = NumberUtils.formatCurrency(totalBudget);

        // Employees metrics
        document.getElementById('total-employees').textContent = this.data.employees?.total_employees || 0;
        document.getElementById('active-employees').textContent = this.data.employees?.active_employees || 0;

        // Update progress indicators
        this.updateProgressMetrics();
    }

    // Update progress and change indicators
    updateProgressMetrics() {
        const avgProgress = this.data.projects?.avg_progress || 0;
        const progressElement = document.querySelector('#projects-metric .metric-progress');
        if (progressElement) {
            progressElement.style.width = `${avgProgress}%`;
        }
    }

    // Update widgets (recent projects, tasks, etc.)
    updateWidgets() {
        this.updateRecentProjects();
        this.updateUrgentTasks();
        this.updateLowStock();
    }

    // Update recent projects widget
    updateRecentProjects() {
        const container = document.getElementById('recent-projects');
        const projects = this.data.recentProjects || [];

        if (projects.length === 0) {
            container.innerHTML = '<div class="list-item text-muted">Нет недавних проектов</div>';
            return;
        }

        container.innerHTML = projects.map(project => `
            <div class="list-item" onclick="app.navigateTo('projects')">
                <div class="list-content">
                    <div class="list-title">${project.name}</div>
                    <div class="list-subtitle">${project.client_name || 'Без клиента'}</div>
                </div>
                <div class="list-meta">
                    <span class="status-badge status-${project.status}">${this.getStatusText(project.status)}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update urgent tasks widget
    updateUrgentTasks() {
        const container = document.getElementById('urgent-tasks');
        const counter = document.getElementById('urgent-tasks-count');
        const tasks = this.data.urgentTasks || [];

        counter.textContent = tasks.length;

        if (tasks.length === 0) {
            container.innerHTML = '<div class="list-item text-muted">Нет срочных задач</div>';
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="list-item" onclick="app.navigateTo('projects')">
                <div class="list-content">
                    <div class="list-title">${task.name}</div>
                    <div class="list-subtitle">${task.project_name}</div>
                </div>
                <div class="list-meta">
                    <span class="due-date ${DateUtils.isToday(task.end_date) ? 'today' : ''}">${DateUtils.format(task.end_date)}</span>
                </div>
            </div>
        `).join('');
    }

    // Update low stock widget
    updateLowStock() {
        const container = document.getElementById('low-stock');
        const counter = document.getElementById('low-stock-count');
        const items = this.data.lowStock || [];

        counter.textContent = items.length;

        if (items.length === 0) {
            container.innerHTML = '<div class="list-item text-muted">Остатки в норме</div>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="list-item" onclick="app.navigateTo('warehouse')">
                <div class="list-content">
                    <div class="list-title">${item.name}</div>
                    <div class="list-subtitle">Мин: ${item.min_quantity} ${item.unit}</div>
                </div>
                <div class="list-meta">
                    <span class="stock-level low">${item.current_quantity} ${item.unit}</span>
                </div>
            </div>
        `).join('');
    }

    // Initialize charts
    initCharts() {
        this.initProjectsChart();
        this.initRevenueChart();
    }

    // Initialize projects status chart
    initProjectsChart() {
        const canvas = document.getElementById('projects-chart');
        const ctx = canvas.getContext('2d');

        // Simple pie chart implementation
        const data = [
            { label: 'Планирование', value: this.data.projects?.planning_projects || 0, color: '#6b7280' },
            { label: 'В работе', value: this.data.projects?.active_projects || 0, color: '#10b981' },
            { label: 'Завершено', value: this.data.projects?.completed_projects || 0, color: '#3b82f6' }
        ];

        this.drawPieChart(ctx, data, canvas.width, canvas.height);
    }

    // Initialize revenue chart
    initRevenueChart() {
        const canvas = document.getElementById('revenue-chart');
        const ctx = canvas.getContext('2d');

        // Simple bar chart implementation
        const data = [
            { label: 'Бюджет', value: this.data.projects?.total_budget || 0, color: '#3b82f6' },
            { label: 'Потрачено', value: this.data.projects?.total_spent || 0, color: '#ef4444' },
            { label: 'Остаток', value: (this.data.projects?.total_budget || 0) - (this.data.projects?.total_spent || 0), color: '#10b981' }
        ];

        this.drawBarChart(ctx, data, canvas.width, canvas.height);
    }

    // Simple pie chart drawing
    drawPieChart(ctx, data, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) {
            ctx.fillStyle = '#e5e7eb';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Нет данных', centerX, centerY);
            return;
        }

        let currentAngle = -Math.PI / 2;

        data.forEach(item => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();

            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.value.toString(), labelX, labelY);

            currentAngle += sliceAngle;
        });

        // Draw legend
        this.drawLegend(ctx, data, width, height);
    }

    // Simple bar chart drawing
    drawBarChart(ctx, data, width, height) {
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const maxValue = Math.max(...data.map(item => item.value));
        if (maxValue === 0) {
            ctx.fillStyle = '#e5e7eb';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Нет данных', width / 2, height / 2);
            return;
        }

        const barWidth = chartWidth / data.length - 10;
        const barSpacing = 10;

        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = padding + index * (barWidth + barSpacing);
            const y = height - padding - barHeight;

            ctx.fillStyle = item.color;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw value label
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(NumberUtils.formatCurrency(item.value, 'RUB'), x + barWidth / 2, y - 5);

            // Draw category label
            ctx.fillText(item.label, x + barWidth / 2, height - padding + 15);
        });
    }

    // Draw chart legend
    drawLegend(ctx, data, width, height) {
        const legendY = height - 30;
        let legendX = 20;

        data.forEach(item => {
            // Draw color box
            ctx.fillStyle = item.color;
            ctx.fillRect(legendX, legendY, 12, 12);

            // Draw label
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, legendX + 16, legendY + 10);

            legendX += ctx.measureText(item.label).width + 40;
        });
    }

    // Initialize event listeners
    initEventListeners() {
        // Chart period selectors
        document.getElementById('projects-period')?.addEventListener('change', (e) => {
            this.updateProjectsChart(e.target.value);
        });

        document.getElementById('revenue-period')?.addEventListener('change', (e) => {
            this.updateRevenueChart(e.target.value);
        });

        // Refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn btn-sm btn-outline';
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
        refreshBtn.onclick = () => this.refresh();

        const header = document.querySelector('.dashboard');
        if (header) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'dashboard-actions';
            actionsDiv.appendChild(refreshBtn);
            header.insertBefore(actionsDiv, header.firstChild);
        }
    }

    // Update charts based on period
    async updateProjectsChart(period) {
        try {
            const chartData = await DashboardAPI.getChartData('projects', period);
            // Redraw chart with new data
            this.initProjectsChart();
        } catch (error) {
            console.error('Chart update error:', error);
        }
    }

    async updateRevenueChart(period) {
        try {
            const chartData = await DashboardAPI.getChartData('revenue', period);
            // Redraw chart with new data
            this.initRevenueChart();
        } catch (error) {
            console.error('Chart update error:', error);
        }
    }

    // Get status text in Russian
    getStatusText(status) {
        const statusMap = {
            planning: 'Планирование',
            design: 'Проектирование',
            approval: 'Согласование',
            construction: 'Строительство',
            completion: 'Завершение',
            warranty: 'Гарантия',
            closed: 'Закрыт',
            pending: 'Ожидает',
            in_progress: 'В работе',
            completed: 'Завершено',
            on_hold: 'Приостановлено',
            cancelled: 'Отменено'
        };
        return statusMap[status] || status;
    }

    // Refresh dashboard data
    async refresh() {
        try {
            showNotification('Обновление данных...', 'info', 1000);
            await this.loadData();
            showNotification('Данные обновлены', 'success');
        } catch (error) {
            console.error('Dashboard refresh error:', error);
            showNotification('Ошибка обновления данных', 'error');
        }
    }

    // Start auto-refresh
    startAutoRefresh() {
        // Refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, 5 * 60 * 1000);
    }

    // Stop auto-refresh
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Show module
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.refresh();
        }
    }

    // Hide module
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for global use
window.DashboardModule = DashboardModule;