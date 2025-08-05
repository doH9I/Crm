// Contractors module for Construction CRM

class ContractorsModule {
    constructor() {
        this.contractors = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalPages = 1;
        this.totalItems = 0;
        this.filters = {
            search: '',
            type: 'all',
            specialization: 'all',
            status: 'all',
            rating: 'all',
            sortBy: 'created_at',
            sortOrder: 'desc'
        };
        this.viewMode = 'grid'; // grid or table
    }

    async init() {
        console.log('Initializing Contractors module...');
        this.render();
        await this.loadContractors();
        this.initEventListeners();
    }

    render() {
        const contentArea = document.querySelector('.content-area');
        contentArea.innerHTML = `
            <div class="contractors-module">
                <!-- Module Header -->
                <div class="module-header">
                    <div class="module-title">
                        <h1><i class="fas fa-hard-hat"></i> Управление подрядчиками</h1>
                        <p>База данных подрядчиков, поставщиков и субподрядчиков</p>
                    </div>
                    <div class="module-actions">
                        <button class="btn btn-primary" onclick="contractorsModule.showCreateContractorModal()">
                            <i class="fas fa-plus"></i> Добавить подрядчика
                        </button>
                        <button class="btn btn-secondary" onclick="contractorsModule.exportContractors()">
                            <i class="fas fa-download"></i> Экспорт
                        </button>
                    </div>
                </div>

                <!-- Filters Panel -->
                <div class="card filters-panel">
                    <div class="card-body">
                        <div class="filters-row">
                            <div class="filter-group">
                                <label>Поиск</label>
                                <div class="search-box">
                                    <i class="fas fa-search"></i>
                                    <input type="text" id="contractor-search" placeholder="Поиск по названию, контактам..." value="${this.filters.search}">
                                </div>
                            </div>
                            <div class="filter-group">
                                <label>Тип подрядчика</label>
                                <select id="contractor-type-filter">
                                    <option value="all">Все типы</option>
                                    <option value="contractor">Подрядчик</option>
                                    <option value="supplier">Поставщик</option>
                                    <option value="subcontractor">Субподрядчик</option>
                                    <option value="service">Услуги</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Специализация</label>
                                <select id="contractor-specialization-filter">
                                    <option value="all">Все специализации</option>
                                    <option value="construction">Строительство</option>
                                    <option value="electrical">Электромонтаж</option>
                                    <option value="plumbing">Сантехника</option>
                                    <option value="heating">Отопление</option>
                                    <option value="roofing">Кровельные работы</option>
                                    <option value="finishing">Отделочные работы</option>
                                    <option value="materials">Стройматериалы</option>
                                    <option value="equipment">Оборудование</option>
                                    <option value="transport">Транспорт</option>
                                    <option value="security">Охрана</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Статус</label>
                                <select id="contractor-status-filter">
                                    <option value="all">Все статусы</option>
                                    <option value="active">Активный</option>
                                    <option value="inactive">Неактивный</option>
                                    <option value="verified">Проверенный</option>
                                    <option value="blacklisted">Черный список</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Рейтинг</label>
                                <select id="contractor-rating-filter">
                                    <option value="all">Любой рейтинг</option>
                                    <option value="5">⭐⭐⭐⭐⭐ (5.0)</option>
                                    <option value="4">⭐⭐⭐⭐ (4.0+)</option>
                                    <option value="3">⭐⭐⭐ (3.0+)</option>
                                    <option value="2">⭐⭐ (2.0+)</option>
                                    <option value="1">⭐ (1.0+)</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Сортировка</label>
                                <select id="contractor-sort-filter">
                                    <option value="created_at">По дате создания</option>
                                    <option value="name">По названию</option>
                                    <option value="rating">По рейтингу</option>
                                    <option value="projects_count">По количеству проектов</option>
                                    <option value="last_project">По дате последнего проекта</option>
                                </select>
                            </div>
                            <div class="filter-actions">
                                <button class="btn btn-outline-primary" onclick="contractorsModule.applyFilters()">
                                    <i class="fas fa-filter"></i> Применить
                                </button>
                                <button class="btn btn-outline-secondary" onclick="contractorsModule.resetFilters()">
                                    <i class="fas fa-times"></i> Сбросить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Content Header -->
                <div class="content-header">
                    <div class="results-info">
                        <span id="contractors-count">Загрузка...</span>
                    </div>
                    <div class="view-controls">
                        <div class="view-toggle">
                            <button class="btn ${this.viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}" 
                                    onclick="contractorsModule.setViewMode('grid')">
                                <i class="fas fa-th"></i>
                            </button>
                            <button class="btn ${this.viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}" 
                                    onclick="contractorsModule.setViewMode('table')">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Contractors Content -->
                <div class="contractors-content">
                    <div id="loading-contractors" class="loading-spinner" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i> Загрузка подрядчиков...
                    </div>
                    
                    <!-- Grid View -->
                    <div id="contractors-grid" class="contractors-grid" style="display: ${this.viewMode === 'grid' ? 'block' : 'none'};">
                        <!-- Contractor cards will be rendered here -->
                    </div>

                    <!-- Table View -->
                    <div id="contractors-table-container" class="table-container" style="display: ${this.viewMode === 'table' ? 'block' : 'none'};">
                        <table id="contractors-table" class="table">
                            <thead>
                                <tr>
                                    <th>Подрядчик</th>
                                    <th>Тип</th>
                                    <th>Специализация</th>
                                    <th>Рейтинг</th>
                                    <th>Контакты</th>
                                    <th>Статус</th>
                                    <th>Проекты</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Contractor rows will be rendered here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div id="contractors-pagination" class="pagination-container">
                    <!-- Pagination will be rendered here -->
                </div>
            </div>
        `;
    }

    async loadContractors() {
        try {
            this.showLoading();
            
            const params = {
                page: this.currentPage,
                limit: this.itemsPerPage,
                search: this.filters.search,
                type: this.filters.type !== 'all' ? this.filters.type : undefined,
                specialization: this.filters.specialization !== 'all' ? this.filters.specialization : undefined,
                status: this.filters.status !== 'all' ? this.filters.status : undefined,
                rating: this.filters.rating !== 'all' ? this.filters.rating : undefined,
                sortBy: this.filters.sortBy,
                sortOrder: this.filters.sortOrder
            };

            const response = await ContractorsAPI.getAll(params);
            
            this.contractors = response.data || [];
            this.totalItems = response.total || 0;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            
            this.renderContractors();
            this.updateResultsInfo();
            this.renderPagination();
            
        } catch (error) {
            console.error('Error loading contractors:', error);
            showNotification('Ошибка загрузки подрядчиков', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderContractors() {
        if (this.viewMode === 'grid') {
            this.renderContractorsGrid();
        } else {
            this.renderContractorsTable();
        }
    }

    renderContractorsGrid() {
        const gridContainer = document.getElementById('contractors-grid');
        
        if (this.contractors.length === 0) {
            gridContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hard-hat"></i>
                    <h3>Подрядчики не найдены</h3>
                    <p>Попробуйте изменить параметры фильтрации или добавьте нового подрядчика</p>
                    <button class="btn btn-primary" onclick="contractorsModule.showCreateContractorModal()">
                        <i class="fas fa-plus"></i> Добавить подрядчика
                    </button>
                </div>
            `;
            return;
        }

        const cardsHTML = this.contractors.map(contractor => `
            <div class="contractor-card" data-id="${contractor.id}">
                <div class="card">
                    <div class="card-header">
                        <div class="contractor-avatar">
                            <i class="fas ${this.getContractorIcon(contractor.type)}"></i>
                        </div>
                        <div class="contractor-info">
                            <h3 class="contractor-name">${contractor.name}</h3>
                            <span class="contractor-type">${this.getTypeText(contractor.type)}</span>
                            <div class="contractor-rating">
                                ${this.renderStars(contractor.rating || 0)}
                                <span class="rating-value">(${contractor.rating || 0})</span>
                            </div>
                        </div>
                        <div class="card-actions">
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary" data-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <div class="dropdown-menu">
                                    <a href="#" onclick="contractorsModule.viewContractor(${contractor.id})">
                                        <i class="fas fa-eye"></i> Просмотр
                                    </a>
                                    <a href="#" onclick="contractorsModule.editContractor(${contractor.id})">
                                        <i class="fas fa-edit"></i> Редактировать
                                    </a>
                                    <a href="#" onclick="contractorsModule.showContractorProjects(${contractor.id})">
                                        <i class="fas fa-project-diagram"></i> Проекты
                                    </a>
                                    <a href="#" onclick="contractorsModule.showContractorDocuments(${contractor.id})">
                                        <i class="fas fa-file-alt"></i> Документы
                                    </a>
                                    <a href="#" onclick="contractorsModule.rateContractor(${contractor.id})">
                                        <i class="fas fa-star"></i> Оценить
                                    </a>
                                    <div class="dropdown-divider"></div>
                                    <a href="#" onclick="contractorsModule.deleteContractor(${contractor.id})" class="text-danger">
                                        <i class="fas fa-trash"></i> Удалить
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="contractor-details">
                            <div class="detail-row">
                                <i class="fas fa-tools"></i>
                                <span>${this.getSpecializationText(contractor.specialization)}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-phone"></i>
                                <span>${contractor.phone || 'Не указан'}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-envelope"></i>
                                <span>${contractor.email || 'Не указан'}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${contractor.address || 'Не указан'}</span>
                            </div>
                        </div>
                        <div class="contractor-stats">
                            <div class="stat">
                                <span class="stat-value">${contractor.projects_count || 0}</span>
                                <span class="stat-label">Проектов</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${NumberUtils.formatCurrency(contractor.total_amount || 0)}</span>
                                <span class="stat-label">Сумма работ</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="contractor-status">
                            <span class="status-badge status-${contractor.status}">
                                ${this.getStatusText(contractor.status)}
                            </span>
                            ${contractor.is_verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Проверен</span>' : ''}
                        </div>
                        <div class="last-project">
                            <small class="text-muted">
                                Последний проект: ${contractor.last_project ? DateUtils.formatDateTime(contractor.last_project) : 'Нет данных'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        gridContainer.innerHTML = cardsHTML;
    }

    renderContractorsTable() {
        const tableBody = document.querySelector('#contractors-table tbody');
        
        if (this.contractors.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-hard-hat"></i>
                            <p>Подрядчики не найдены</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const rowsHTML = this.contractors.map(contractor => `
            <tr data-id="${contractor.id}">
                <td>
                    <div class="contractor-cell">
                        <div class="contractor-avatar">
                            <i class="fas ${this.getContractorIcon(contractor.type)}"></i>
                        </div>
                        <div class="contractor-info">
                            <div class="contractor-name">${contractor.name}</div>
                            <div class="contractor-id">ID: ${contractor.id}</div>
                            ${contractor.is_verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Проверен</span>' : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="type-badge type-${contractor.type}">
                        ${this.getTypeText(contractor.type)}
                    </span>
                </td>
                <td>
                    <span class="specialization-badge">
                        ${this.getSpecializationText(contractor.specialization)}
                    </span>
                </td>
                <td>
                    <div class="rating-cell">
                        ${this.renderStars(contractor.rating || 0)}
                        <span class="rating-value">(${contractor.rating || 0})</span>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        ${contractor.phone ? `<div><i class="fas fa-phone"></i> ${contractor.phone}</div>` : ''}
                        ${contractor.email ? `<div><i class="fas fa-envelope"></i> ${contractor.email}</div>` : ''}
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${contractor.status}">
                        ${this.getStatusText(contractor.status)}
                    </span>
                </td>
                <td>
                    <div class="projects-info">
                        <span class="projects-count">${contractor.projects_count || 0}</span>
                        <small class="text-muted">проектов</small>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="contractorsModule.viewContractor(${contractor.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="contractorsModule.editContractor(${contractor.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="contractorsModule.rateContractor(${contractor.id})" title="Оценить">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="contractorsModule.deleteContractor(${contractor.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = rowsHTML;
    }

    updateResultsInfo() {
        const countElement = document.getElementById('contractors-count');
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        
        if (this.totalItems === 0) {
            countElement.textContent = 'Подрядчики не найдены';
        } else {
            countElement.textContent = `Показано ${start}-${end} из ${this.totalItems} подрядчиков`;
        }
    }

    renderPagination() {
        const container = document.getElementById('contractors-pagination');
        
        if (this.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `
                <button class="btn btn-outline-primary" onclick="contractorsModule.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i> Предыдущая
                </button>
            `;
        }
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `<button class="btn btn-outline-primary" onclick="contractorsModule.changePage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="btn ${i === this.currentPage ? 'btn-primary' : 'btn-outline-primary'}" 
                        onclick="contractorsModule.changePage(${i})">${i}</button>
            `;
        }
        
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
            paginationHTML += `<button class="btn btn-outline-primary" onclick="contractorsModule.changePage(${this.totalPages})">${this.totalPages}</button>`;
        }
        
        // Next button
        if (this.currentPage < this.totalPages) {
            paginationHTML += `
                <button class="btn btn-outline-primary" onclick="contractorsModule.changePage(${this.currentPage + 1})">
                    Следующая <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }

    initEventListeners() {
        // Search input with debounce
        const searchInput = document.getElementById('contractor-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.loadContractors();
            }, 300));
        }

        // Filter change handlers
        const typeFilter = document.getElementById('contractor-type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.currentPage = 1;
                this.loadContractors();
            });
        }

        const specializationFilter = document.getElementById('contractor-specialization-filter');
        if (specializationFilter) {
            specializationFilter.addEventListener('change', (e) => {
                this.filters.specialization = e.target.value;
                this.currentPage = 1;
                this.loadContractors();
            });
        }

        const statusFilter = document.getElementById('contractor-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.currentPage = 1;
                this.loadContractors();
            });
        }

        const ratingFilter = document.getElementById('contractor-rating-filter');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', (e) => {
                this.filters.rating = e.target.value;
                this.currentPage = 1;
                this.loadContractors();
            });
        }

        const sortFilter = document.getElementById('contractor-sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.filters.sortBy = e.target.value;
                this.currentPage = 1;
                this.loadContractors();
            });
        }
    }

    setViewMode(mode) {
        this.viewMode = mode;
        
        // Update view toggle buttons
        const gridBtn = document.querySelector('.view-toggle button:first-child');
        const tableBtn = document.querySelector('.view-toggle button:last-child');
        
        if (mode === 'grid') {
            gridBtn.className = 'btn btn-primary';
            tableBtn.className = 'btn btn-outline-primary';
            document.getElementById('contractors-grid').style.display = 'block';
            document.getElementById('contractors-table-container').style.display = 'none';
        } else {
            gridBtn.className = 'btn btn-outline-primary';
            tableBtn.className = 'btn btn-primary';
            document.getElementById('contractors-grid').style.display = 'none';
            document.getElementById('contractors-table-container').style.display = 'block';
        }
        
        this.renderContractors();
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadContractors();
    }

    resetFilters() {
        this.filters = {
            search: '',
            type: 'all',
            specialization: 'all',
            status: 'all',
            rating: 'all',
            sortBy: 'created_at',
            sortOrder: 'desc'
        };
        
        // Reset form inputs
        document.getElementById('contractor-search').value = '';
        document.getElementById('contractor-type-filter').value = 'all';
        document.getElementById('contractor-specialization-filter').value = 'all';
        document.getElementById('contractor-status-filter').value = 'all';
        document.getElementById('contractor-rating-filter').value = 'all';
        document.getElementById('contractor-sort-filter').value = 'created_at';
        
        this.currentPage = 1;
        this.loadContractors();
    }

    changePage(page) {
        this.currentPage = page;
        this.loadContractors();
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star text-warning"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star text-muted"></i>';
        }
        
        return starsHTML;
    }

    getContractorIcon(type) {
        const icons = {
            contractor: 'fa-hard-hat',
            supplier: 'fa-truck',
            subcontractor: 'fa-users-cog',
            service: 'fa-cogs'
        };
        return icons[type] || 'fa-hard-hat';
    }

    getTypeText(type) {
        const types = {
            contractor: 'Подрядчик',
            supplier: 'Поставщик',
            subcontractor: 'Субподрядчик',
            service: 'Услуги'
        };
        return types[type] || type;
    }

    getSpecializationText(specialization) {
        const specializations = {
            construction: 'Строительство',
            electrical: 'Электромонтаж',
            plumbing: 'Сантехника',
            heating: 'Отопление',
            roofing: 'Кровельные работы',
            finishing: 'Отделочные работы',
            materials: 'Стройматериалы',
            equipment: 'Оборудование',
            transport: 'Транспорт',
            security: 'Охрана'
        };
        return specializations[specialization] || specialization;
    }

    getStatusText(status) {
        const statuses = {
            active: 'Активный',
            inactive: 'Неактивный',
            verified: 'Проверенный',
            blacklisted: 'Черный список'
        };
        return statuses[status] || status;
    }

    showLoading() {
        const loading = document.getElementById('loading-contractors');
        if (loading) loading.style.display = 'block';
    }

    hideLoading() {
        const loading = document.getElementById('loading-contractors');
        if (loading) loading.style.display = 'none';
    }

    // Contractor actions
    async viewContractor(contractorId) {
        try {
            const contractor = await ContractorsAPI.getById(contractorId);
            this.showContractorDetailsModal(contractor);
        } catch (error) {
            console.error('Error loading contractor:', error);
            showNotification('Ошибка загрузки данных подрядчика', 'error');
        }
    }

    showCreateContractorModal() {
        showNotification('Функция создания подрядчика будет реализована', 'info');
    }

    async editContractor(contractorId) {
        try {
            const contractor = await ContractorsAPI.getById(contractorId);
            this.showEditContractorModal(contractor);
        } catch (error) {
            console.error('Error loading contractor:', error);
            showNotification('Ошибка загрузки данных подрядчика', 'error');
        }
    }

    async deleteContractor(contractorId) {
        if (!confirm('Вы действительно хотите удалить этого подрядчика?')) {
            return;
        }

        try {
            await ContractorsAPI.delete(contractorId);
            showNotification('Подрядчик успешно удален', 'success');
            this.loadContractors();
        } catch (error) {
            console.error('Error deleting contractor:', error);
            showNotification('Ошибка удаления подрядчика', 'error');
        }
    }

    rateContractor(contractorId) {
        showNotification('Функция оценки подрядчика будет реализована', 'info');
    }

    showContractorProjects(contractorId) {
        app.navigateTo(`projects?contractor=${contractorId}`);
    }

    showContractorDocuments(contractorId) {
        app.navigateTo(`documents?contractor=${contractorId}`);
    }

    showContractorDetailsModal(contractor) {
        showNotification('Детальная информация о подрядчике будет реализована', 'info');
    }

    showEditContractorModal(contractor) {
        showNotification('Редактирование подрядчика будет реализовано', 'info');
    }

    async exportContractors() {
        try {
            const response = await ExportAPI.exportContractors(this.filters);
            downloadFile(response.url, 'contractors.xlsx');
            showNotification('Экспорт подрядчиков завершен', 'success');
        } catch (error) {
            console.error('Error exporting contractors:', error);
            showNotification('Ошибка экспорта подрядчиков', 'error');
        }
    }

    show() {
        document.querySelector('.contractors-module').style.display = 'block';
    }

    hide() {
        document.querySelector('.contractors-module').style.display = 'none';
    }
}

// Initialize module
const contractorsModule = new ContractorsModule();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.hash === '#contractors') {
            contractorsModule.init();
        }
    });
} else {
    if (window.location.hash === '#contractors') {
        contractorsModule.init();
    }
}