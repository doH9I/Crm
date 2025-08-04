// Clients module for Construction CRM

class ClientsModule {
    constructor() {
        this.clients = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalPages = 1;
        this.totalItems = 0;
        this.filters = {
            search: '',
            type: 'all',
            status: 'all',
            sortBy: 'created_at',
            sortOrder: 'desc'
        };
        this.viewMode = 'grid'; // grid or table
    }

    async init() {
        console.log('Initializing Clients module...');
        this.render();
        await this.loadClients();
        this.initEventListeners();
    }

    render() {
        const contentArea = document.querySelector('.content-area');
        contentArea.innerHTML = `
            <div class="clients-module">
                <!-- Module Header -->
                <div class="module-header">
                    <div class="module-title">
                        <h1><i class="fas fa-users"></i> Управление клиентами</h1>
                        <p>Полная база данных клиентов и контрагентов</p>
                    </div>
                    <div class="module-actions">
                        <button class="btn btn-primary" onclick="clientsModule.showCreateClientModal()">
                            <i class="fas fa-plus"></i> Добавить клиента
                        </button>
                        <button class="btn btn-secondary" onclick="clientsModule.exportClients()">
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
                                    <input type="text" id="client-search" placeholder="Поиск по названию, контактам..." value="${this.filters.search}">
                                </div>
                            </div>
                            <div class="filter-group">
                                <label>Тип клиента</label>
                                <select id="client-type-filter">
                                    <option value="all">Все типы</option>
                                    <option value="individual">Физическое лицо</option>
                                    <option value="company">Юридическое лицо</option>
                                    <option value="entrepreneur">ИП</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Статус</label>
                                <select id="client-status-filter">
                                    <option value="all">Все статусы</option>
                                    <option value="active">Активный</option>
                                    <option value="inactive">Неактивный</option>
                                    <option value="potential">Потенциальный</option>
                                    <option value="blocked">Заблокирован</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Сортировка</label>
                                <select id="client-sort-filter">
                                    <option value="created_at">По дате создания</option>
                                    <option value="name">По названию</option>
                                    <option value="last_contact">По дате контакта</option>
                                    <option value="projects_count">По количеству проектов</option>
                                </select>
                            </div>
                            <div class="filter-actions">
                                <button class="btn btn-outline-primary" onclick="clientsModule.applyFilters()">
                                    <i class="fas fa-filter"></i> Применить
                                </button>
                                <button class="btn btn-outline-secondary" onclick="clientsModule.resetFilters()">
                                    <i class="fas fa-times"></i> Сбросить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Content Header -->
                <div class="content-header">
                    <div class="results-info">
                        <span id="clients-count">Загрузка...</span>
                    </div>
                    <div class="view-controls">
                        <div class="view-toggle">
                            <button class="btn ${this.viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}" 
                                    onclick="clientsModule.setViewMode('grid')">
                                <i class="fas fa-th"></i>
                            </button>
                            <button class="btn ${this.viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}" 
                                    onclick="clientsModule.setViewMode('table')">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Clients Content -->
                <div class="clients-content">
                    <div id="loading-clients" class="loading-spinner" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i> Загрузка клиентов...
                    </div>
                    
                    <!-- Grid View -->
                    <div id="clients-grid" class="clients-grid" style="display: ${this.viewMode === 'grid' ? 'block' : 'none'};">
                        <!-- Client cards will be rendered here -->
                    </div>

                    <!-- Table View -->
                    <div id="clients-table-container" class="table-container" style="display: ${this.viewMode === 'table' ? 'block' : 'none'};">
                        <table id="clients-table" class="table">
                            <thead>
                                <tr>
                                    <th>Клиент</th>
                                    <th>Тип</th>
                                    <th>Контакты</th>
                                    <th>Статус</th>
                                    <th>Проекты</th>
                                    <th>Последний контакт</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Client rows will be rendered here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div id="clients-pagination" class="pagination-container">
                    <!-- Pagination will be rendered here -->
                </div>
            </div>
        `;
    }

    async loadClients() {
        try {
            this.showLoading();
            
            const params = {
                page: this.currentPage,
                limit: this.itemsPerPage,
                search: this.filters.search,
                type: this.filters.type !== 'all' ? this.filters.type : undefined,
                status: this.filters.status !== 'all' ? this.filters.status : undefined,
                sortBy: this.filters.sortBy,
                sortOrder: this.filters.sortOrder
            };

            const response = await ClientsAPI.getAll(params);
            
            this.clients = response.data || [];
            this.totalItems = response.total || 0;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            
            this.renderClients();
            this.updateResultsInfo();
            this.renderPagination();
            
        } catch (error) {
            console.error('Error loading clients:', error);
            showNotification('Ошибка загрузки клиентов', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderClients() {
        if (this.viewMode === 'grid') {
            this.renderClientsGrid();
        } else {
            this.renderClientsTable();
        }
    }

    renderClientsGrid() {
        const gridContainer = document.getElementById('clients-grid');
        
        if (this.clients.length === 0) {
            gridContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Клиенты не найдены</h3>
                    <p>Попробуйте изменить параметры фильтрации или добавьте нового клиента</p>
                    <button class="btn btn-primary" onclick="clientsModule.showCreateClientModal()">
                        <i class="fas fa-plus"></i> Добавить клиента
                    </button>
                </div>
            `;
            return;
        }

        const cardsHTML = this.clients.map(client => `
            <div class="client-card" data-id="${client.id}">
                <div class="card">
                    <div class="card-header">
                        <div class="client-avatar">
                            <i class="fas ${this.getClientIcon(client.type)}"></i>
                        </div>
                        <div class="client-info">
                            <h3 class="client-name">${client.name}</h3>
                            <span class="client-type">${this.getTypeText(client.type)}</span>
                        </div>
                        <div class="card-actions">
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary" data-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <div class="dropdown-menu">
                                    <a href="#" onclick="clientsModule.viewClient(${client.id})">
                                        <i class="fas fa-eye"></i> Просмотр
                                    </a>
                                    <a href="#" onclick="clientsModule.editClient(${client.id})">
                                        <i class="fas fa-edit"></i> Редактировать
                                    </a>
                                    <a href="#" onclick="clientsModule.showClientProjects(${client.id})">
                                        <i class="fas fa-project-diagram"></i> Проекты
                                    </a>
                                    <a href="#" onclick="clientsModule.showClientDocuments(${client.id})">
                                        <i class="fas fa-file-alt"></i> Документы
                                    </a>
                                    <div class="dropdown-divider"></div>
                                    <a href="#" onclick="clientsModule.deleteClient(${client.id})" class="text-danger">
                                        <i class="fas fa-trash"></i> Удалить
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="client-details">
                            <div class="detail-row">
                                <i class="fas fa-phone"></i>
                                <span>${client.phone || 'Не указан'}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-envelope"></i>
                                <span>${client.email || 'Не указан'}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${client.address || 'Не указан'}</span>
                            </div>
                        </div>
                        <div class="client-stats">
                            <div class="stat">
                                <span class="stat-value">${client.projects_count || 0}</span>
                                <span class="stat-label">Проектов</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${NumberUtils.formatCurrency(client.total_revenue || 0)}</span>
                                <span class="stat-label">Выручка</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="client-status">
                            <span class="status-badge status-${client.status}">
                                ${this.getStatusText(client.status)}
                            </span>
                        </div>
                        <div class="last-contact">
                            <small class="text-muted">
                                Последний контакт: ${client.last_contact ? DateUtils.formatDateTime(client.last_contact) : 'Нет данных'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        gridContainer.innerHTML = cardsHTML;
    }

    renderClientsTable() {
        const tableBody = document.querySelector('#clients-table tbody');
        
        if (this.clients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <p>Клиенты не найдены</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const rowsHTML = this.clients.map(client => `
            <tr data-id="${client.id}">
                <td>
                    <div class="client-cell">
                        <div class="client-avatar">
                            <i class="fas ${this.getClientIcon(client.type)}"></i>
                        </div>
                        <div class="client-info">
                            <div class="client-name">${client.name}</div>
                            <div class="client-id">ID: ${client.id}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="type-badge type-${client.type}">
                        ${this.getTypeText(client.type)}
                    </span>
                </td>
                <td>
                    <div class="contact-info">
                        ${client.phone ? `<div><i class="fas fa-phone"></i> ${client.phone}</div>` : ''}
                        ${client.email ? `<div><i class="fas fa-envelope"></i> ${client.email}</div>` : ''}
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${client.status}">
                        ${this.getStatusText(client.status)}
                    </span>
                </td>
                <td>
                    <div class="projects-info">
                        <span class="projects-count">${client.projects_count || 0}</span>
                        <small class="text-muted">проектов</small>
                    </div>
                </td>
                <td>
                    <small class="text-muted">
                        ${client.last_contact ? DateUtils.formatDateTime(client.last_contact) : 'Нет данных'}
                    </small>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="clientsModule.viewClient(${client.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="clientsModule.editClient(${client.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="clientsModule.deleteClient(${client.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = rowsHTML;
    }

    updateResultsInfo() {
        const countElement = document.getElementById('clients-count');
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        
        if (this.totalItems === 0) {
            countElement.textContent = 'Клиенты не найдены';
        } else {
            countElement.textContent = `Показано ${start}-${end} из ${this.totalItems} клиентов`;
        }
    }

    renderPagination() {
        const container = document.getElementById('clients-pagination');
        
        if (this.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `
                <button class="btn btn-outline-primary" onclick="clientsModule.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i> Предыдущая
                </button>
            `;
        }
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `<button class="btn btn-outline-primary" onclick="clientsModule.changePage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="btn ${i === this.currentPage ? 'btn-primary' : 'btn-outline-primary'}" 
                        onclick="clientsModule.changePage(${i})">${i}</button>
            `;
        }
        
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
            paginationHTML += `<button class="btn btn-outline-primary" onclick="clientsModule.changePage(${this.totalPages})">${this.totalPages}</button>`;
        }
        
        // Next button
        if (this.currentPage < this.totalPages) {
            paginationHTML += `
                <button class="btn btn-outline-primary" onclick="clientsModule.changePage(${this.currentPage + 1})">
                    Следующая <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }

    initEventListeners() {
        // Search input with debounce
        const searchInput = document.getElementById('client-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.loadClients();
            }, 300));
        }

        // Filter change handlers
        const typeFilter = document.getElementById('client-type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.currentPage = 1;
                this.loadClients();
            });
        }

        const statusFilter = document.getElementById('client-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.currentPage = 1;
                this.loadClients();
            });
        }

        const sortFilter = document.getElementById('client-sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.filters.sortBy = e.target.value;
                this.currentPage = 1;
                this.loadClients();
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
            document.getElementById('clients-grid').style.display = 'block';
            document.getElementById('clients-table-container').style.display = 'none';
        } else {
            gridBtn.className = 'btn btn-outline-primary';
            tableBtn.className = 'btn btn-primary';
            document.getElementById('clients-grid').style.display = 'none';
            document.getElementById('clients-table-container').style.display = 'block';
        }
        
        this.renderClients();
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadClients();
    }

    resetFilters() {
        this.filters = {
            search: '',
            type: 'all',
            status: 'all',
            sortBy: 'created_at',
            sortOrder: 'desc'
        };
        
        // Reset form inputs
        document.getElementById('client-search').value = '';
        document.getElementById('client-type-filter').value = 'all';
        document.getElementById('client-status-filter').value = 'all';
        document.getElementById('client-sort-filter').value = 'created_at';
        
        this.currentPage = 1;
        this.loadClients();
    }

    changePage(page) {
        this.currentPage = page;
        this.loadClients();
    }

    getClientIcon(type) {
        const icons = {
            individual: 'fa-user',
            company: 'fa-building',
            entrepreneur: 'fa-user-tie'
        };
        return icons[type] || 'fa-user';
    }

    getTypeText(type) {
        const types = {
            individual: 'Физ. лицо',
            company: 'Юр. лицо',
            entrepreneur: 'ИП'
        };
        return types[type] || type;
    }

    getStatusText(status) {
        const statuses = {
            active: 'Активный',
            inactive: 'Неактивный',
            potential: 'Потенциальный',
            blocked: 'Заблокирован'
        };
        return statuses[status] || status;
    }

    showLoading() {
        const loading = document.getElementById('loading-clients');
        if (loading) loading.style.display = 'block';
    }

    hideLoading() {
        const loading = document.getElementById('loading-clients');
        if (loading) loading.style.display = 'none';
    }

    // Client actions (placeholders for full implementation)
    async viewClient(clientId) {
        try {
            const client = await ClientsAPI.getById(clientId);
            // Show client details modal
            this.showClientDetailsModal(client);
        } catch (error) {
            console.error('Error loading client:', error);
            showNotification('Ошибка загрузки данных клиента', 'error');
        }
    }

    showCreateClientModal() {
        // Implementation for create client modal
        showNotification('Функция создания клиента будет реализована', 'info');
    }

    async editClient(clientId) {
        try {
            const client = await ClientsAPI.getById(clientId);
            // Show edit client modal
            this.showEditClientModal(client);
        } catch (error) {
            console.error('Error loading client:', error);
            showNotification('Ошибка загрузки данных клиента', 'error');
        }
    }

    async deleteClient(clientId) {
        if (!confirm('Вы действительно хотите удалить этого клиента?')) {
            return;
        }

        try {
            await ClientsAPI.delete(clientId);
            showNotification('Клиент успешно удален', 'success');
            this.loadClients();
        } catch (error) {
            console.error('Error deleting client:', error);
            showNotification('Ошибка удаления клиента', 'error');
        }
    }

    showClientProjects(clientId) {
        // Navigate to projects with client filter
        app.navigateTo(`projects?client=${clientId}`);
    }

    showClientDocuments(clientId) {
        // Navigate to documents with client filter
        app.navigateTo(`documents?client=${clientId}`);
    }

    showClientDetailsModal(client) {
        // Implementation for client details modal
        showNotification('Детальная информация о клиенте будет реализована', 'info');
    }

    showEditClientModal(client) {
        // Implementation for edit client modal
        showNotification('Редактирование клиента будет реализовано', 'info');
    }

    async exportClients() {
        try {
            const response = await ExportAPI.exportClients(this.filters);
            downloadFile(response.url, 'clients.xlsx');
            showNotification('Экспорт клиентов завершен', 'success');
        } catch (error) {
            console.error('Error exporting clients:', error);
            showNotification('Ошибка экспорта клиентов', 'error');
        }
    }

    show() {
        document.querySelector('.clients-module').style.display = 'block';
    }

    hide() {
        document.querySelector('.clients-module').style.display = 'none';
    }
}

// Initialize module
const clientsModule = new ClientsModule();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.hash === '#clients') {
            clientsModule.init();
        }
    });
} else {
    if (window.location.hash === '#clients') {
        clientsModule.init();
    }
}