// Employees module for Construction CRM

class EmployeesModule {
    constructor() {
        this.container = null;
        this.employees = [];
        this.currentEmployee = null;
        this.filters = {
            position: '',
            department: '',
            status: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 20,
            total: 0
        };
    }

    // Initialize employees module
    async init() {
        this.container = document.getElementById('content-area');
        await this.render();
        await this.loadEmployees();
        this.initEventListeners();
    }

    // Render employees layout
    async render() {
        this.container.innerHTML = `
            <div class="employees-module">
                <!-- Header with actions -->
                <div class="module-header">
                    <div class="header-left">
                        <h2 class="module-title">Управление персоналом</h2>
                        <p class="module-description">Управление сотрудниками и кадровый учет</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" onclick="this.exportEmployees()">
                            <i class="fas fa-download"></i>
                            Экспорт
                        </button>
                        <button class="btn btn-outline" onclick="this.showTimesheet()">
                            <i class="fas fa-clock"></i>
                            Табель
                        </button>
                        <button class="btn btn-primary" onclick="this.showCreateEmployeeModal()">
                            <i class="fas fa-plus"></i>
                            Новый сотрудник
                        </button>
                    </div>
                </div>

                <!-- Statistics cards -->
                <div class="stats-grid grid-responsive cols-4 mb-4">
                    <div class="stat-card card">
                        <div class="card-body">
                            <div class="stat-icon">
                                <i class="fas fa-users text-primary"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="total-employees">0</h3>
                                <p>Всего сотрудников</p>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card card">
                        <div class="card-body">
                            <div class="stat-icon">
                                <i class="fas fa-user-check text-success"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="active-employees">0</h3>
                                <p>Активные</p>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card card">
                        <div class="card-body">
                            <div class="stat-icon">
                                <i class="fas fa-briefcase text-info"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="on-project">0</h3>
                                <p>На проектах</p>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card card">
                        <div class="card-body">
                            <div class="stat-icon">
                                <i class="fas fa-calendar-times text-warning"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="on-vacation">0</h3>
                                <p>В отпуске</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters and search -->
                <div class="filters-panel card">
                    <div class="card-body">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label class="form-label">Поиск</label>
                                <input type="text" class="form-control" id="employees-search" placeholder="Поиск по ФИО, должности...">
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Должность</label>
                                <select class="form-select" id="employees-position-filter">
                                    <option value="">Все должности</option>
                                    <option value="director">Директор</option>
                                    <option value="manager">Менеджер</option>
                                    <option value="engineer">Инженер</option>
                                    <option value="foreman">Прораб</option>
                                    <option value="estimator">Сметчик</option>
                                    <option value="worker">Рабочий</option>
                                    <option value="driver">Водитель</option>
                                    <option value="accountant">Бухгалтер</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Отдел</label>
                                <select class="form-select" id="employees-department-filter">
                                    <option value="">Все отделы</option>
                                    <option value="management">Руководство</option>
                                    <option value="construction">Строительство</option>
                                    <option value="engineering">Инженерный</option>
                                    <option value="estimation">Сметный</option>
                                    <option value="procurement">Снабжение</option>
                                    <option value="accounting">Бухгалтерия</option>
                                    <option value="hr">Кадры</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Статус</label>
                                <select class="form-select" id="employees-status-filter">
                                    <option value="">Все статусы</option>
                                    <option value="active">Активный</option>
                                    <option value="vacation">В отпуске</option>
                                    <option value="sick">На больничном</option>
                                    <option value="fired">Уволен</option>
                                </select>
                            </div>
                            <div class="filter-actions">
                                <button class="btn btn-secondary" onclick="this.resetFilters()">
                                    <i class="fas fa-times"></i>
                                    Сбросить
                                </button>
                                <button class="btn btn-primary" onclick="this.applyFilters()">
                                    <i class="fas fa-search"></i>
                                    Применить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Employees grid/table -->
                <div class="employees-content">
                    <div class="content-header">
                        <div class="results-info">
                            <span id="employees-count">Загрузка...</span>
                        </div>
                        <div class="view-controls">
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline active" data-view="grid">
                                    <i class="fas fa-th"></i>
                                </button>
                                <button class="btn btn-sm btn-outline" data-view="table">
                                    <i class="fas fa-list"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Grid view -->
                    <div class="employees-grid grid-responsive cols-3" id="employees-grid">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Загрузка сотрудников...</p>
                        </div>
                    </div>

                    <!-- Table view -->
                    <div class="employees-table d-none" id="employees-table">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Сотрудник</th>
                                        <th>Должность</th>
                                        <th>Отдел</th>
                                        <th>Статус</th>
                                        <th>Зарплата</th>
                                        <th>Проект</th>
                                        <th>Дата найма</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody id="employees-table-body">
                                    <tr>
                                        <td colspan="8" class="text-center">Загрузка...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <div class="pagination-container" id="employees-pagination">
                        <!-- Будет заполнено динамически -->
                    </div>
                </div>
            </div>

            <!-- Employee Modal -->
            <div class="modal fade" id="employeeModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="employeeModalTitle">Новый сотрудник</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="employeeForm">
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Фамилия *</label>
                                            <input type="text" class="form-control" name="last_name" required placeholder="Фамилия">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Имя *</label>
                                            <input type="text" class="form-control" name="first_name" required placeholder="Имя">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Отчество</label>
                                            <input type="text" class="form-control" name="middle_name" placeholder="Отчество">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Должность *</label>
                                            <select class="form-select" name="position" required>
                                                <option value="">Выберите должность</option>
                                                <option value="director">Директор</option>
                                                <option value="manager">Менеджер</option>
                                                <option value="engineer">Инженер</option>
                                                <option value="foreman">Прораб</option>
                                                <option value="estimator">Сметчик</option>
                                                <option value="worker">Рабочий</option>
                                                <option value="driver">Водитель</option>
                                                <option value="accountant">Бухгалтер</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Отдел *</label>
                                            <select class="form-select" name="department" required>
                                                <option value="">Выберите отдел</option>
                                                <option value="management">Руководство</option>
                                                <option value="construction">Строительство</option>
                                                <option value="engineering">Инженерный</option>
                                                <option value="estimation">Сметный</option>
                                                <option value="procurement">Снабжение</option>
                                                <option value="accounting">Бухгалтерия</option>
                                                <option value="hr">Кадры</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Телефон *</label>
                                            <input type="tel" class="form-control" name="phone" required placeholder="+7 (999) 123-45-67">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Email</label>
                                            <input type="email" class="form-control" name="email" placeholder="employee@example.com">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Дата рождения</label>
                                            <input type="date" class="form-control" name="birth_date">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Дата найма *</label>
                                            <input type="date" class="form-control" name="hire_date" required>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Зарплата (руб.)</label>
                                            <input type="number" class="form-control" name="salary" placeholder="50000">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Статус</label>
                                            <select class="form-select" name="status">
                                                <option value="active">Активный</option>
                                                <option value="vacation">В отпуске</option>
                                                <option value="sick">На больничном</option>
                                                <option value="fired">Уволен</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label class="form-label">Адрес</label>
                                            <textarea class="form-control" name="address" rows="2" placeholder="Адрес проживания"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Паспорт серия</label>
                                            <input type="text" class="form-control" name="passport_series" placeholder="1234">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Паспорт номер</label>
                                            <input type="text" class="form-control" name="passport_number" placeholder="567890">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label class="form-label">Примечания</label>
                                            <textarea class="form-control" name="notes" rows="2" placeholder="Дополнительная информация о сотруднике"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-primary" onclick="this.saveEmployee()">Сохранить</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Load employees from API
    async loadEmployees() {
        try {
            const params = {
                page: this.pagination.page,
                limit: this.pagination.limit,
                ...this.filters
            };

            const response = await EmployeesAPI.getAll(params);
            this.employees = response.employees || [];
            this.pagination.total = response.total || 0;

            this.renderEmployees();
            this.updateResultsInfo();
            this.updateStats(response.stats);
            this.renderPagination();

        } catch (error) {
            console.error('Employees loading error:', error);
            showNotification('Ошибка загрузки сотрудников', 'error');
            this.renderEmptyState();
        }
    }

    // Update statistics
    updateStats(stats) {
        if (!stats) return;
        
        document.getElementById('total-employees').textContent = stats.total || 0;
        document.getElementById('active-employees').textContent = stats.active || 0;
        document.getElementById('on-project').textContent = stats.onProject || 0;
        document.getElementById('on-vacation').textContent = stats.onVacation || 0;
    }

    // Render employees in current view
    renderEmployees() {
        const viewMode = document.querySelector('.view-controls .btn.active').dataset.view;
        
        if (viewMode === 'grid') {
            this.renderEmployeesGrid();
        } else {
            this.renderEmployeesTable();
        }
    }

    // Render employees grid view
    renderEmployeesGrid() {
        const container = document.getElementById('employees-grid');
        
        if (this.employees.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h4>Сотрудники не найдены</h4>
                    <p>Добавьте первого сотрудника или измените параметры поиска</p>
                    <button class="btn btn-primary" onclick="this.showCreateEmployeeModal()">
                        <i class="fas fa-plus"></i>
                        Добавить сотрудника
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.employees.map(employee => `
            <div class="employee-card card" data-employee-id="${employee.id}">
                <div class="card-header">
                    <div class="employee-status">
                        <span class="status-badge status-${employee.status}">${this.getStatusText(employee.status)}</span>
                    </div>
                    <div class="employee-actions">
                        <button class="btn btn-sm btn-outline" onclick="this.viewEmployee(${employee.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="this.editEmployee(${employee.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="employee-name">${employee.last_name} ${employee.first_name}</h3>
                    <p class="employee-position">
                        <i class="fas fa-briefcase"></i>
                        ${this.getPositionText(employee.position)}
                    </p>
                    <p class="employee-department">
                        <i class="fas fa-building"></i>
                        ${this.getDepartmentText(employee.department)}
                    </p>
                    <div class="employee-contact">
                        <p class="employee-phone">
                            <i class="fas fa-phone"></i>
                            ${employee.phone || 'Телефон не указан'}
                        </p>
                        <p class="employee-email">
                            <i class="fas fa-envelope"></i>
                            ${employee.email || 'Email не указан'}
                        </p>
                    </div>
                    <div class="employee-meta">
                        <div class="meta-item">
                            <span class="meta-label">Зарплата:</span>
                            <span class="meta-value">${NumberUtils.formatCurrency(employee.salary || 0)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Стаж:</span>
                            <span class="meta-value">${this.calculateExperience(employee.hire_date)}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="employee-dates">
                        <small class="text-muted">
                            Принят: ${DateUtils.format(employee.hire_date)}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render employees table view
    renderEmployeesTable() {
        const tbody = document.getElementById('employees-table-body');
        
        if (this.employees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center empty-state">
                        <i class="fas fa-users"></i>
                        <div>Сотрудники не найдены</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.employees.map(employee => `
            <tr data-employee-id="${employee.id}">
                <td>
                    <div class="table-employee-info">
                        <div class="employee-name">${employee.last_name} ${employee.first_name}</div>
                        <div class="employee-contact text-muted">${employee.phone || 'Телефон не указан'}</div>
                    </div>
                </td>
                <td>
                    <span class="position-badge">${this.getPositionText(employee.position)}</span>
                </td>
                <td>
                    <span class="department-badge">${this.getDepartmentText(employee.department)}</span>
                </td>
                <td>
                    <span class="status-badge status-${employee.status}">${this.getStatusText(employee.status)}</span>
                </td>
                <td>${NumberUtils.formatCurrency(employee.salary || 0)}</td>
                <td>${employee.project_name || '-'}</td>
                <td>${DateUtils.format(employee.hire_date)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="this.viewEmployee(${employee.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="this.editEmployee(${employee.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="this.deleteEmployee(${employee.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Calculate work experience
    calculateExperience(hireDate) {
        if (!hireDate) return 'Не указан';
        
        const hire = new Date(hireDate);
        const now = new Date();
        const diffTime = Math.abs(now - hire);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
            return `${diffDays} дн.`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} мес.`;
        } else {
            const years = Math.floor(diffDays / 365);
            const months = Math.floor((diffDays % 365) / 30);
            return months > 0 ? `${years} г. ${months} мес.` : `${years} г.`;
        }
    }

    // Update results info
    updateResultsInfo() {
        const container = document.getElementById('employees-count');
        const start = (this.pagination.page - 1) * this.pagination.limit + 1;
        const end = Math.min(start + this.employees.length - 1, this.pagination.total);
        
        container.textContent = `Показано ${start}-${end} из ${this.pagination.total} сотрудников`;
    }

    // Render pagination
    renderPagination() {
        const container = document.getElementById('employees-pagination');
        const totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (this.pagination.page > 1) {
            paginationHTML += `<button class="btn btn-outline" onclick="this.changePage(${this.pagination.page - 1})">Назад</button>`;
        }
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.pagination.page) {
                paginationHTML += `<button class="btn btn-primary">${i}</button>`;
            } else if (i === 1 || i === totalPages || Math.abs(i - this.pagination.page) <= 2) {
                paginationHTML += `<button class="btn btn-outline" onclick="this.changePage(${i})">${i}</button>`;
            } else if (i === this.pagination.page - 3 || i === this.pagination.page + 3) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }
        
        // Next button
        if (this.pagination.page < totalPages) {
            paginationHTML += `<button class="btn btn-outline" onclick="this.changePage(${this.pagination.page + 1})">Далее</button>`;
        }
        
        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }

    // Initialize event listeners
    initEventListeners() {
        // Search input
        document.getElementById('employees-search').addEventListener('input', debounce((e) => {
            this.filters.search = e.target.value;
            this.applyFilters();
        }, 300));

        // View toggle
        document.querySelectorAll('.view-controls .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-controls .btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const view = btn.dataset.view;
                if (view === 'grid') {
                    document.getElementById('employees-grid').classList.remove('d-none');
                    document.getElementById('employees-table').classList.add('d-none');
                } else {
                    document.getElementById('employees-grid').classList.add('d-none');
                    document.getElementById('employees-table').classList.remove('d-none');
                }
                
                this.renderEmployees();
            });
        });

        // Set current date as default hire date
        document.querySelector('[name="hire_date"]').value = new Date().toISOString().split('T')[0];
    }

    // Apply filters
    applyFilters() {
        this.filters.position = document.getElementById('employees-position-filter').value;
        this.filters.department = document.getElementById('employees-department-filter').value;
        this.filters.status = document.getElementById('employees-status-filter').value;
        
        this.pagination.page = 1;
        this.loadEmployees();
    }

    // Reset filters
    resetFilters() {
        this.filters = { position: '', department: '', status: '', search: '' };
        
        document.getElementById('employees-search').value = '';
        document.getElementById('employees-position-filter').value = '';
        document.getElementById('employees-department-filter').value = '';
        document.getElementById('employees-status-filter').value = '';
        
        this.pagination.page = 1;
        this.loadEmployees();
    }

    // Change page
    changePage(page) {
        this.pagination.page = page;
        this.loadEmployees();
    }

    // Get status text
    getStatusText(status) {
        const statusMap = {
            active: 'Активный',
            vacation: 'В отпуске',
            sick: 'На больничном',
            fired: 'Уволен'
        };
        return statusMap[status] || status;
    }

    // Get position text
    getPositionText(position) {
        const positionMap = {
            director: 'Директор',
            manager: 'Менеджер',
            engineer: 'Инженер',
            foreman: 'Прораб',
            estimator: 'Сметчик',
            worker: 'Рабочий',
            driver: 'Водитель',
            accountant: 'Бухгалтер'
        };
        return positionMap[position] || position;
    }

    // Get department text
    getDepartmentText(department) {
        const departmentMap = {
            management: 'Руководство',
            construction: 'Строительство',
            engineering: 'Инженерный',
            estimation: 'Сметный',
            procurement: 'Снабжение',
            accounting: 'Бухгалтерия',
            hr: 'Кадры'
        };
        return departmentMap[department] || department;
    }

    // View employee details
    viewEmployee(employeeId) {
        showNotification('Открытие карточки сотрудника...', 'info');
        // Здесь будет переход к детальной странице сотрудника
    }

    // Edit employee
    editEmployee(employeeId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) return;

        this.currentEmployee = employee;
        
        // Fill form with employee data
        const form = document.getElementById('employeeForm');
        Object.keys(employee).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'date' && employee[key]) {
                    input.value = employee[key].split('T')[0];
                } else {
                    input.value = employee[key] || '';
                }
            }
        });

        document.getElementById('employeeModalTitle').textContent = 'Редактировать сотрудника';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
        modal.show();
    }

    // Delete employee
    async deleteEmployee(employeeId) {
        if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
            return;
        }

        try {
            await EmployeesAPI.delete(employeeId);
            showNotification('Сотрудник удален', 'success');
            this.loadEmployees();
        } catch (error) {
            console.error('Employee deletion error:', error);
            showNotification('Ошибка удаления сотрудника', 'error');
        }
    }

    // Show create employee modal
    showCreateEmployeeModal() {
        this.currentEmployee = null;
        
        // Reset form
        document.getElementById('employeeForm').reset();
        document.querySelector('[name="hire_date"]').value = new Date().toISOString().split('T')[0];
        
        document.getElementById('employeeModalTitle').textContent = 'Новый сотрудник';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
        modal.show();
    }

    // Save employee
    async saveEmployee() {
        const form = document.getElementById('employeeForm');
        const formData = new FormData(form);
        const employeeData = Object.fromEntries(formData.entries());

        // Validate required fields
        if (!employeeData.first_name || !employeeData.last_name || !employeeData.position || 
            !employeeData.department || !employeeData.phone || !employeeData.hire_date) {
            showNotification('Заполните обязательные поля', 'error');
            return;
        }

        try {
            if (this.currentEmployee) {
                // Update existing employee
                await EmployeesAPI.update(this.currentEmployee.id, employeeData);
                showNotification('Сотрудник обновлен', 'success');
            } else {
                // Create new employee
                await EmployeesAPI.create(employeeData);
                showNotification('Сотрудник создан', 'success');
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
            modal.hide();

            // Reload employees
            this.loadEmployees();

        } catch (error) {
            console.error('Employee save error:', error);
            showNotification('Ошибка сохранения сотрудника', 'error');
        }
    }

    // Show timesheet
    showTimesheet() {
        showNotification('Открытие табеля учета рабочего времени...', 'info');
        // Здесь будет переход к модулю табеля
    }

    // Export employees
    async exportEmployees() {
        try {
            showNotification('Экспорт данных...', 'info');
            await ExportAPI.exportEmployees('excel');
            showNotification('Данные экспортированы', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Ошибка экспорта', 'error');
        }
    }

    // Show module
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.loadEmployees();
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
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for global use
window.EmployeesModule = EmployeesModule;