// Employees module for Construction CRM

class EmployeesModule {
    constructor() {
        this.employees = [];
        this.timesheets = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalPages = 1;
        this.totalItems = 0;
        this.filters = {
            search: '',
            department: 'all',
            position: 'all',
            status: 'all',
            sortBy: 'created_at',
            sortOrder: 'desc'
        };
        this.viewMode = 'grid'; // grid or table
        this.activeTab = 'employees'; // employees or timesheet
    }

    async init() {
        console.log('Initializing Employees module...');
        this.render();
        await this.loadData();
        this.initEventListeners();
    }

    render() {
        const contentArea = document.querySelector('.content-area');
        contentArea.innerHTML = `
            <div class="employees-module">
                <!-- Module Header -->
                <div class="module-header">
                    <div class="module-title">
                        <h1><i class="fas fa-users-cog"></i> Управление персоналом</h1>
                        <p>Управление сотрудниками и учет рабочего времени</p>
                    </div>
                    <div class="module-actions">
                        <button class="btn btn-primary" onclick="employeesModule.showCreateEmployeeModal()">
                            <i class="fas fa-user-plus"></i> Добавить сотрудника
                        </button>
                        <button class="btn btn-secondary" onclick="employeesModule.exportData()">
                            <i class="fas fa-download"></i> Экспорт
                        </button>
                    </div>
                </div>

                <!-- Tabs Navigation -->
                <div class="module-tabs">
                    <div class="tab-buttons">
                        <button class="tab-btn ${this.activeTab === 'employees' ? 'active' : ''}" onclick="employeesModule.switchTab('employees')">
                            <i class="fas fa-users"></i> Сотрудники
                        </button>
                        <button class="tab-btn ${this.activeTab === 'timesheet' ? 'active' : ''}" onclick="employeesModule.switchTab('timesheet')">
                            <i class="fas fa-clock"></i> Табель учета времени
                        </button>
                    </div>
                </div>

                <!-- Employees Tab -->
                <div id="employees-tab" class="tab-content ${this.activeTab === 'employees' ? 'active' : ''}">
                    <!-- Filters Panel -->
                    <div class="card filters-panel">
                        <div class="card-body">
                            <div class="filters-row">
                                <div class="filter-group">
                                    <label>Поиск</label>
                                    <div class="search-box">
                                        <i class="fas fa-search"></i>
                                        <input type="text" id="employee-search" placeholder="Поиск по ФИО, должности..." value="${this.filters.search}">
                                    </div>
                                </div>
                                <div class="filter-group">
                                    <label>Отдел</label>
                                    <select id="employee-department-filter">
                                        <option value="all">Все отделы</option>
                                        <option value="construction">Строительный отдел</option>
                                        <option value="engineering">Инженерный отдел</option>
                                        <option value="pto">ПТО</option>
                                        <option value="procurement">Снабжение</option>
                                        <option value="finance">Финансовый отдел</option>
                                        <option value="hr">Отдел кадров</option>
                                        <option value="management">Руководство</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>Должность</label>
                                    <select id="employee-position-filter">
                                        <option value="all">Все должности</option>
                                        <option value="director">Директор</option>
                                        <option value="manager">Менеджер</option>
                                        <option value="engineer">Инженер</option>
                                        <option value="foreman">Прораб</option>
                                        <option value="worker">Рабочий</option>
                                        <option value="estimator">Сметчик</option>
                                        <option value="procurement">Снабженец</option>
                                        <option value="accountant">Бухгалтер</option>
                                        <option value="hr">Кадровик</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>Статус</label>
                                    <select id="employee-status-filter">
                                        <option value="all">Все статусы</option>
                                        <option value="active">Работает</option>
                                        <option value="vacation">В отпуске</option>
                                        <option value="sick_leave">На больничном</option>
                                        <option value="dismissed">Уволен</option>
                                    </select>
                                </div>
                                <div class="filter-actions">
                                    <button class="btn btn-outline-primary" onclick="employeesModule.applyFilters()">
                                        <i class="fas fa-filter"></i> Применить
                                    </button>
                                    <button class="btn btn-outline-secondary" onclick="employeesModule.resetFilters()">
                                        <i class="fas fa-times"></i> Сбросить
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Content Header -->
                    <div class="content-header">
                        <div class="results-info">
                            <span id="employees-count">Загрузка...</span>
                        </div>
                        <div class="view-controls">
                            <div class="view-toggle">
                                <button class="btn ${this.viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}" 
                                        onclick="employeesModule.setViewMode('grid')">
                                    <i class="fas fa-th"></i>
                                </button>
                                <button class="btn ${this.viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}" 
                                        onclick="employeesModule.setViewMode('table')">
                                    <i class="fas fa-list"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Employees Content -->
                    <div class="employees-content">
                        <div id="loading-employees" class="loading-spinner" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i> Загрузка сотрудников...
                        </div>
                        
                        <!-- Grid View -->
                        <div id="employees-grid" class="employees-grid" style="display: ${this.viewMode === 'grid' ? 'block' : 'none'};">
                            <!-- Employee cards will be rendered here -->
                        </div>

                        <!-- Table View -->
                        <div id="employees-table-container" class="table-container" style="display: ${this.viewMode === 'table' ? 'block' : 'none'};">
                            <table id="employees-table" class="table">
                                <thead>
                                    <tr>
                                        <th>Сотрудник</th>
                                        <th>Должность</th>
                                        <th>Отдел</th>
                                        <th>Контакты</th>
                                        <th>Зарплата</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Employee rows will be rendered here -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <div id="employees-pagination" class="pagination-container">
                        <!-- Pagination will be rendered here -->
                    </div>
                </div>

                <!-- Timesheet Tab -->
                <div id="timesheet-tab" class="tab-content ${this.activeTab === 'timesheet' ? 'active' : ''}">
                    <!-- Timesheet Filters -->
                    <div class="card filters-panel">
                        <div class="card-body">
                            <div class="filters-row">
                                <div class="filter-group">
                                    <label>Период</label>
                                    <select id="timesheet-period-filter">
                                        <option value="current_month">Текущий месяц</option>
                                        <option value="last_month">Прошлый месяц</option>
                                        <option value="current_year">Текущий год</option>
                                        <option value="custom">Произвольный период</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>Дата с</label>
                                    <input type="date" id="timesheet-date-from" class="form-control">
                                </div>
                                <div class="filter-group">
                                    <label>Дата по</label>
                                    <input type="date" id="timesheet-date-to" class="form-control">
                                </div>
                                <div class="filter-group">
                                    <label>Сотрудник</label>
                                    <select id="timesheet-employee-filter">
                                        <option value="all">Все сотрудники</option>
                                        <!-- Will be filled dynamically -->
                                    </select>
                                </div>
                                <div class="filter-actions">
                                    <button class="btn btn-outline-primary" onclick="employeesModule.loadTimesheets()">
                                        <i class="fas fa-search"></i> Показать
                                    </button>
                                    <button class="btn btn-success" onclick="employeesModule.markAttendance()">
                                        <i class="fas fa-clock"></i> Отметить время
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Timesheet Summary -->
                    <div class="timesheet-summary">
                        <div class="summary-cards">
                            <div class="summary-card">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="summary-icon">
                                            <i class="fas fa-users text-primary"></i>
                                        </div>
                                        <div class="summary-info">
                                            <h3 id="total-employees">0</h3>
                                            <p>Всего сотрудников</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="summary-card">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="summary-icon">
                                            <i class="fas fa-clock text-success"></i>
                                        </div>
                                        <div class="summary-info">
                                            <h3 id="total-hours">0</h3>
                                            <p>Часов отработано</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="summary-card">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="summary-icon">
                                            <i class="fas fa-user-check text-info"></i>
                                        </div>
                                        <div class="summary-info">
                                            <h3 id="present-today">0</h3>
                                            <p>Присутствует сегодня</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="summary-card">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="summary-icon">
                                            <i class="fas fa-user-times text-warning"></i>
                                        </div>
                                        <div class="summary-info">
                                            <h3 id="absent-today">0</h3>
                                            <p>Отсутствует сегодня</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Timesheet Table -->
                    <div class="timesheet-content">
                        <div id="loading-timesheet" class="loading-spinner" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i> Загрузка табеля...
                        </div>
                        
                        <div class="table-container">
                            <table id="timesheet-table" class="table">
                                <thead>
                                    <tr>
                                        <th>Сотрудник</th>
                                        <th>Дата</th>
                                        <th>Время прихода</th>
                                        <th>Время ухода</th>
                                        <th>Часов работы</th>
                                        <th>Переработка</th>
                                        <th>Статус</th>
                                        <th>Примечания</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Timesheet rows will be rendered here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        if (this.activeTab === 'employees') {
            await this.loadEmployees();
        } else {
            await this.loadTimesheets();
        }
    }

    async loadEmployees() {
        try {
            this.showLoading('employees');
            
            const params = {
                page: this.currentPage,
                limit: this.itemsPerPage,
                search: this.filters.search,
                department: this.filters.department !== 'all' ? this.filters.department : undefined,
                position: this.filters.position !== 'all' ? this.filters.position : undefined,
                status: this.filters.status !== 'all' ? this.filters.status : undefined,
                sortBy: this.filters.sortBy,
                sortOrder: this.filters.sortOrder
            };

            const response = await EmployeesAPI.getAll(params);
            
            this.employees = response.data || [];
            this.totalItems = response.total || 0;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            
            this.renderEmployees();
            this.updateResultsInfo();
            this.renderPagination();
            
        } catch (error) {
            console.error('Error loading employees:', error);
            showNotification('Ошибка загрузки сотрудников', 'error');
        } finally {
            this.hideLoading('employees');
        }
    }

    async loadTimesheets() {
        try {
            this.showLoading('timesheet');
            
            const params = {
                period: document.getElementById('timesheet-period-filter').value,
                dateFrom: document.getElementById('timesheet-date-from').value,
                dateTo: document.getElementById('timesheet-date-to').value,
                employeeId: document.getElementById('timesheet-employee-filter').value !== 'all' 
                    ? document.getElementById('timesheet-employee-filter').value : undefined
            };

            const response = await TimesheetAPI.getTimesheet(params);
            
            this.timesheets = response.data || [];
            this.renderTimesheets();
            this.updateTimesheetSummary(response.summary);
            
        } catch (error) {
            console.error('Error loading timesheets:', error);
            showNotification('Ошибка загрузки табеля', 'error');
        } finally {
            this.hideLoading('timesheet');
        }
    }

    renderEmployees() {
        if (this.viewMode === 'grid') {
            this.renderEmployeesGrid();
        } else {
            this.renderEmployeesTable();
        }
    }

    renderEmployeesGrid() {
        const gridContainer = document.getElementById('employees-grid');
        
        if (this.employees.length === 0) {
            gridContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users-cog"></i>
                    <h3>Сотрудники не найдены</h3>
                    <p>Попробуйте изменить параметры фильтрации или добавьте нового сотрудника</p>
                    <button class="btn btn-primary" onclick="employeesModule.showCreateEmployeeModal()">
                        <i class="fas fa-user-plus"></i> Добавить сотрудника
                    </button>
                </div>
            `;
            return;
        }

        const cardsHTML = this.employees.map(employee => `
            <div class="employee-card" data-id="${employee.id}">
                <div class="card">
                    <div class="card-header">
                        <div class="employee-avatar">
                            ${employee.photo ? 
                                `<img src="${employee.photo}" alt="${employee.full_name}">` : 
                                `<i class="fas fa-user"></i>`
                            }
                        </div>
                        <div class="employee-info">
                            <h3 class="employee-name">${employee.full_name}</h3>
                            <span class="employee-position">${this.getPositionText(employee.position)}</span>
                            <span class="employee-department">${this.getDepartmentText(employee.department)}</span>
                        </div>
                        <div class="card-actions">
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary" data-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <div class="dropdown-menu">
                                    <a href="#" onclick="employeesModule.viewEmployee(${employee.id})">
                                        <i class="fas fa-eye"></i> Просмотр
                                    </a>
                                    <a href="#" onclick="employeesModule.editEmployee(${employee.id})">
                                        <i class="fas fa-edit"></i> Редактировать
                                    </a>
                                    <a href="#" onclick="employeesModule.viewEmployeeTimesheet(${employee.id})">
                                        <i class="fas fa-clock"></i> Табель
                                    </a>
                                    <a href="#" onclick="employeesModule.showEmployeeDocuments(${employee.id})">
                                        <i class="fas fa-file-alt"></i> Документы
                                    </a>
                                    <div class="dropdown-divider"></div>
                                    <a href="#" onclick="employeesModule.deleteEmployee(${employee.id})" class="text-danger">
                                        <i class="fas fa-trash"></i> Удалить
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="employee-details">
                            <div class="detail-row">
                                <i class="fas fa-phone"></i>
                                <span>${employee.phone || 'Не указан'}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-envelope"></i>
                                <span>${employee.email || 'Не указан'}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-calendar"></i>
                                <span>Принят: ${DateUtils.format(employee.hire_date)}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-ruble-sign"></i>
                                <span>${NumberUtils.formatCurrency(employee.salary || 0)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="employee-status">
                            <span class="status-badge status-${employee.status}">
                                ${this.getStatusText(employee.status)}
                            </span>
                        </div>
                        <div class="work-hours">
                            <small class="text-muted">
                                Часов в месяце: ${employee.monthly_hours || 0}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        gridContainer.innerHTML = cardsHTML;
    }

    renderEmployeesTable() {
        const tableBody = document.querySelector('#employees-table tbody');
        
        if (this.employees.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-users-cog"></i>
                            <p>Сотрудники не найдены</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const rowsHTML = this.employees.map(employee => `
            <tr data-id="${employee.id}">
                <td>
                    <div class="employee-cell">
                        <div class="employee-avatar">
                            ${employee.photo ? 
                                `<img src="${employee.photo}" alt="${employee.full_name}">` : 
                                `<i class="fas fa-user"></i>`
                            }
                        </div>
                        <div class="employee-info">
                            <div class="employee-name">${employee.full_name}</div>
                            <div class="employee-id">ID: ${employee.id}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="position-badge">
                        ${this.getPositionText(employee.position)}
                    </span>
                </td>
                <td>
                    <span class="department-badge">
                        ${this.getDepartmentText(employee.department)}
                    </span>
                </td>
                <td>
                    <div class="contact-info">
                        ${employee.phone ? `<div><i class="fas fa-phone"></i> ${employee.phone}</div>` : ''}
                        ${employee.email ? `<div><i class="fas fa-envelope"></i> ${employee.email}</div>` : ''}
                    </div>
                </td>
                <td>
                    <strong>${NumberUtils.formatCurrency(employee.salary || 0)}</strong>
                </td>
                <td>
                    <span class="status-badge status-${employee.status}">
                        ${this.getStatusText(employee.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="employeesModule.viewEmployee(${employee.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="employeesModule.editEmployee(${employee.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="employeesModule.viewEmployeeTimesheet(${employee.id})" title="Табель">
                            <i class="fas fa-clock"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="employeesModule.deleteEmployee(${employee.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = rowsHTML;
    }

    renderTimesheets() {
        const tableBody = document.querySelector('#timesheet-table tbody');
        
        if (this.timesheets.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-clock"></i>
                            <p>Данные табеля не найдены</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const rowsHTML = this.timesheets.map(record => `
            <tr data-id="${record.id}">
                <td>
                    <div class="employee-cell">
                        <div class="employee-avatar">
                            ${record.employee_photo ? 
                                `<img src="${record.employee_photo}" alt="${record.employee_name}">` : 
                                `<i class="fas fa-user"></i>`
                            }
                        </div>
                        <div class="employee-info">
                            <div class="employee-name">${record.employee_name}</div>
                            <div class="employee-position">${this.getPositionText(record.employee_position)}</div>
                        </div>
                    </div>
                </td>
                <td>${DateUtils.format(record.date)}</td>
                <td>${record.time_in || '-'}</td>
                <td>${record.time_out || '-'}</td>
                <td>
                    <strong>${record.hours_worked || 0}ч</strong>
                </td>
                <td>
                    ${record.overtime ? `<span class="text-warning">${record.overtime}ч</span>` : '-'}
                </td>
                <td>
                    <span class="status-badge status-${record.status}">
                        ${this.getTimesheetStatusText(record.status)}
                    </span>
                </td>
                <td>
                    <small class="text-muted">${record.notes || '-'}</small>
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = rowsHTML;
    }

    updateTimesheetSummary(summary) {
        if (summary) {
            document.getElementById('total-employees').textContent = summary.total_employees || 0;
            document.getElementById('total-hours').textContent = summary.total_hours || 0;
            document.getElementById('present-today').textContent = summary.present_today || 0;
            document.getElementById('absent-today').textContent = summary.absent_today || 0;
        }
    }

    updateResultsInfo() {
        const countElement = document.getElementById('employees-count');
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        
        if (this.totalItems === 0) {
            countElement.textContent = 'Сотрудники не найдены';
        } else {
            countElement.textContent = `Показано ${start}-${end} из ${this.totalItems} сотрудников`;
        }
    }

    renderPagination() {
        const container = document.getElementById('employees-pagination');
        
        if (this.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `
                <button class="btn btn-outline-primary" onclick="employeesModule.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i> Предыдущая
                </button>
            `;
        }
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `<button class="btn btn-outline-primary" onclick="employeesModule.changePage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="btn ${i === this.currentPage ? 'btn-primary' : 'btn-outline-primary'}" 
                        onclick="employeesModule.changePage(${i})">${i}</button>
            `;
        }
        
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
            paginationHTML += `<button class="btn btn-outline-primary" onclick="employeesModule.changePage(${this.totalPages})">${this.totalPages}</button>`;
        }
        
        // Next button
        if (this.currentPage < this.totalPages) {
            paginationHTML += `
                <button class="btn btn-outline-primary" onclick="employeesModule.changePage(${this.currentPage + 1})">
                    Следующая <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }

    initEventListeners() {
        // Search input with debounce
        const searchInput = document.getElementById('employee-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.loadEmployees();
            }, 300));
        }

        // Filter change handlers
        const departmentFilter = document.getElementById('employee-department-filter');
        if (departmentFilter) {
            departmentFilter.addEventListener('change', (e) => {
                this.filters.department = e.target.value;
                this.currentPage = 1;
                this.loadEmployees();
            });
        }

        const positionFilter = document.getElementById('employee-position-filter');
        if (positionFilter) {
            positionFilter.addEventListener('change', (e) => {
                this.filters.position = e.target.value;
                this.currentPage = 1;
                this.loadEmployees();
            });
        }

        const statusFilter = document.getElementById('employee-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.currentPage = 1;
                this.loadEmployees();
            });
        }
    }

    switchTab(tab) {
        this.activeTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.tab-btn:nth-child(${tab === 'employees' ? 1 : 2})`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        // Load appropriate data
        this.loadData();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        
        // Update view toggle buttons
        const gridBtn = document.querySelector('.view-toggle button:first-child');
        const tableBtn = document.querySelector('.view-toggle button:last-child');
        
        if (mode === 'grid') {
            gridBtn.className = 'btn btn-primary';
            tableBtn.className = 'btn btn-outline-primary';
            document.getElementById('employees-grid').style.display = 'block';
            document.getElementById('employees-table-container').style.display = 'none';
        } else {
            gridBtn.className = 'btn btn-outline-primary';
            tableBtn.className = 'btn btn-primary';
            document.getElementById('employees-grid').style.display = 'none';
            document.getElementById('employees-table-container').style.display = 'block';
        }
        
        this.renderEmployees();
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadEmployees();
    }

    resetFilters() {
        this.filters = {
            search: '',
            department: 'all',
            position: 'all',
            status: 'all',
            sortBy: 'created_at',
            sortOrder: 'desc'
        };
        
        // Reset form inputs
        document.getElementById('employee-search').value = '';
        document.getElementById('employee-department-filter').value = 'all';
        document.getElementById('employee-position-filter').value = 'all';
        document.getElementById('employee-status-filter').value = 'all';
        
        this.currentPage = 1;
        this.loadEmployees();
    }

    changePage(page) {
        this.currentPage = page;
        this.loadEmployees();
    }

    getDepartmentText(department) {
        const departments = {
            construction: 'Строительный отдел',
            engineering: 'Инженерный отдел',
            pto: 'ПТО',
            procurement: 'Снабжение',
            finance: 'Финансовый отдел',
            hr: 'Отдел кадров',
            management: 'Руководство'
        };
        return departments[department] || department;
    }

    getPositionText(position) {
        const positions = {
            director: 'Директор',
            manager: 'Менеджер',
            engineer: 'Инженер',
            foreman: 'Прораб',
            worker: 'Рабочий',
            estimator: 'Сметчик',
            procurement: 'Снабженец',
            accountant: 'Бухгалтер',
            hr: 'Кадровик'
        };
        return positions[position] || position;
    }

    getStatusText(status) {
        const statuses = {
            active: 'Работает',
            vacation: 'В отпуске',
            sick_leave: 'На больничном',
            dismissed: 'Уволен'
        };
        return statuses[status] || status;
    }

    getTimesheetStatusText(status) {
        const statuses = {
            present: 'Присутствует',
            absent: 'Отсутствует',
            late: 'Опоздание',
            early_leave: 'Ранний уход',
            overtime: 'Переработка',
            vacation: 'Отпуск',
            sick_leave: 'Больничный'
        };
        return statuses[status] || status;
    }

    showLoading(type) {
        const loading = document.getElementById(`loading-${type}`);
        if (loading) loading.style.display = 'block';
    }

    hideLoading(type) {
        const loading = document.getElementById(`loading-${type}`);
        if (loading) loading.style.display = 'none';
    }

    // Employee actions
    async viewEmployee(employeeId) {
        try {
            const employee = await EmployeesAPI.getById(employeeId);
            this.showEmployeeDetailsModal(employee);
        } catch (error) {
            console.error('Error loading employee:', error);
            showNotification('Ошибка загрузки данных сотрудника', 'error');
        }
    }

    showCreateEmployeeModal() {
        showNotification('Функция создания сотрудника будет реализована', 'info');
    }

    async editEmployee(employeeId) {
        try {
            const employee = await EmployeesAPI.getById(employeeId);
            this.showEditEmployeeModal(employee);
        } catch (error) {
            console.error('Error loading employee:', error);
            showNotification('Ошибка загрузки данных сотрудника', 'error');
        }
    }

    async deleteEmployee(employeeId) {
        if (!confirm('Вы действительно хотите удалить этого сотрудника?')) {
            return;
        }

        try {
            await EmployeesAPI.delete(employeeId);
            showNotification('Сотрудник успешно удален', 'success');
            this.loadEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
            showNotification('Ошибка удаления сотрудника', 'error');
        }
    }

    viewEmployeeTimesheet(employeeId) {
        this.switchTab('timesheet');
        // Set employee filter
        setTimeout(() => {
            document.getElementById('timesheet-employee-filter').value = employeeId;
            this.loadTimesheets();
        }, 100);
    }

    showEmployeeDocuments(employeeId) {
        app.navigateTo(`documents?employee=${employeeId}`);
    }

    markAttendance() {
        showNotification('Функция отметки времени будет реализована', 'info');
    }

    showEmployeeDetailsModal(employee) {
        showNotification('Детальная информация о сотруднике будет реализована', 'info');
    }

    showEditEmployeeModal(employee) {
        showNotification('Редактирование сотрудника будет реализовано', 'info');
    }

    async exportData() {
        try {
            const response = await ExportAPI.exportEmployees(this.filters);
            downloadFile(response.url, 'employees.xlsx');
            showNotification('Экспорт сотрудников завершен', 'success');
        } catch (error) {
            console.error('Error exporting employees:', error);
            showNotification('Ошибка экспорта сотрудников', 'error');
        }
    }

    show() {
        document.querySelector('.employees-module').style.display = 'block';
    }

    hide() {
        document.querySelector('.employees-module').style.display = 'none';
    }
}

// Initialize module
const employeesModule = new EmployeesModule();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.hash === '#employees') {
            employeesModule.init();
        }
    });
} else {
    if (window.location.hash === '#employees') {
        employeesModule.init();
    }
}