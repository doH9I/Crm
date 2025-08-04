// Clients module for Construction CRM

class ClientsModule {
    constructor() {
        this.container = null;
        this.clients = [];
        this.currentClient = null;
        this.filters = {
            type: '',
            status: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 20,
            total: 0
        };
    }

    // Initialize clients module
    async init() {
        this.container = document.getElementById('content-area');
        await this.render();
        await this.loadClients();
        this.initEventListeners();
    }

    // Render clients layout
    async render() {
        this.container.innerHTML = `
            <div class="clients-module">
                <!-- Header with actions -->
                <div class="module-header">
                    <div class="header-left">
                        <h2 class="module-title">Управление клиентами</h2>
                        <p class="module-description">База данных клиентов и заказчиков</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" onclick="this.exportClients()">
                            <i class="fas fa-download"></i>
                            Экспорт
                        </button>
                        <button class="btn btn-outline" onclick="this.importClients()">
                            <i class="fas fa-upload"></i>
                            Импорт
                        </button>
                        <button class="btn btn-primary" onclick="this.showCreateClientModal()">
                            <i class="fas fa-plus"></i>
                            Новый клиент
                        </button>
                    </div>
                </div>

                <!-- Filters and search -->
                <div class="filters-panel card">
                    <div class="card-body">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label class="form-label">Поиск</label>
                                <input type="text" class="form-control" id="clients-search" placeholder="Поиск по названию, контактам...">
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Тип клиента</label>
                                <select class="form-select" id="clients-type-filter">
                                    <option value="">Все типы</option>
                                    <option value="individual">Физическое лицо</option>
                                    <option value="company">Юридическое лицо</option>
                                    <option value="government">Государственная организация</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Статус</label>
                                <select class="form-select" id="clients-status-filter">
                                    <option value="">Все статусы</option>
                                    <option value="active">Активный</option>
                                    <option value="potential">Потенциальный</option>
                                    <option value="inactive">Неактивный</option>
                                    <option value="vip">VIP клиент</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Регион</label>
                                <select class="form-select" id="clients-region-filter">
                                    <option value="">Все регионы</option>
                                    <option value="moscow">Москва</option>
                                    <option value="spb">Санкт-Петербург</option>
                                    <option value="regions">Регионы</option>
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

                <!-- Clients grid/table -->
                <div class="clients-content">
                    <div class="content-header">
                        <div class="results-info">
                            <span id="clients-count">Загрузка...</span>
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
                    <div class="clients-grid grid-responsive cols-3" id="clients-grid">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Загрузка клиентов...</p>
                        </div>
                    </div>

                    <!-- Table view -->
                    <div class="clients-table d-none" id="clients-table">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Клиент</th>
                                        <th>Тип</th>
                                        <th>Контакты</th>
                                        <th>Статус</th>
                                        <th>Проекты</th>
                                        <th>Общая сумма</th>
                                        <th>Дата создания</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody id="clients-table-body">
                                    <tr>
                                        <td colspan="8" class="text-center">Загрузка...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <div class="pagination-container" id="clients-pagination">
                        <!-- Будет заполнено динамически -->
                    </div>
                </div>
            </div>

            <!-- Client Modal -->
            <div class="modal fade" id="clientModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="clientModalTitle">Новый клиент</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="clientForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Тип клиента *</label>
                                            <select class="form-select" name="type" required>
                                                <option value="">Выберите тип</option>
                                                <option value="individual">Физическое лицо</option>
                                                <option value="company">Юридическое лицо</option>
                                                <option value="government">Государственная организация</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Статус</label>
                                            <select class="form-select" name="status">
                                                <option value="potential">Потенциальный</option>
                                                <option value="active">Активный</option>
                                                <option value="inactive">Неактивный</option>
                                                <option value="vip">VIP клиент</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label class="form-label">Название/ФИО *</label>
                                            <input type="text" class="form-control" name="name" required placeholder="Введите название компании или ФИО">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Email</label>
                                            <input type="email" class="form-control" name="email" placeholder="client@example.com">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Телефон *</label>
                                            <input type="tel" class="form-control" name="phone" required placeholder="+7 (999) 123-45-67">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label class="form-label">Адрес</label>
                                            <textarea class="form-control" name="address" rows="2" placeholder="Полный адрес клиента"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div class="company-fields d-none">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">ИНН</label>
                                                <input type="text" class="form-control" name="inn" placeholder="1234567890">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">КПП</label>
                                                <input type="text" class="form-control" name="kpp" placeholder="123456789">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">ОГРН</label>
                                                <input type="text" class="form-control" name="ogrn" placeholder="1234567890123">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Юридический адрес</label>
                                                <input type="text" class="form-control" name="legal_address" placeholder="Юридический адрес">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label class="form-label">Примечания</label>
                                            <textarea class="form-control" name="notes" rows="3" placeholder="Дополнительная информация о клиенте"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-primary" onclick="this.saveClient()">Сохранить</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Load clients from API
    async loadClients() {
        try {
            const params = {
                page: this.pagination.page,
                limit: this.pagination.limit,
                ...this.filters
            };

            const response = await ClientsAPI.getAll(params);
            this.clients = response.clients || [];
            this.pagination.total = response.total || 0;

            this.renderClients();
            this.updateResultsInfo();
            this.renderPagination();

        } catch (error) {
            console.error('Clients loading error:', error);
            showNotification('Ошибка загрузки клиентов', 'error');
            this.renderEmptyState();
        }
    }

    // Render clients in current view
    renderClients() {
        const viewMode = document.querySelector('.view-controls .btn.active').dataset.view;
        
        if (viewMode === 'grid') {
            this.renderClientsGrid();
        } else {
            this.renderClientsTable();
        }
    }

    // Render clients grid view
    renderClientsGrid() {
        const container = document.getElementById('clients-grid');
        
        if (this.clients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h4>Клиенты не найдены</h4>
                    <p>Добавьте первого клиента или измените параметры поиска</p>
                    <button class="btn btn-primary" onclick="this.showCreateClientModal()">
                        <i class="fas fa-plus"></i>
                        Добавить клиента
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.clients.map(client => `
            <div class="client-card card" data-client-id="${client.id}">
                <div class="card-header">
                    <div class="client-status">
                        <span class="status-badge status-${client.status}">${this.getStatusText(client.status)}</span>
                        <span class="type-badge type-${client.type}">${this.getTypeText(client.type)}</span>
                    </div>
                    <div class="client-actions">
                        <button class="btn btn-sm btn-outline" onclick="this.viewClient(${client.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="this.editClient(${client.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="client-name">${client.name}</h3>
                    <div class="client-contacts">
                        <p class="client-phone">
                            <i class="fas fa-phone"></i>
                            ${client.phone || 'Телефон не указан'}
                        </p>
                        <p class="client-email">
                            <i class="fas fa-envelope"></i>
                            ${client.email || 'Email не указан'}
                        </p>
                    </div>
                    <div class="client-meta">
                        <div class="meta-item">
                            <span class="meta-label">Проекты:</span>
                            <span class="meta-value">${client.projects_count || 0}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Общая сумма:</span>
                            <span class="meta-value">${NumberUtils.formatCurrency(client.total_amount || 0)}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="client-dates">
                        <small class="text-muted">
                            Создан: ${DateUtils.format(client.created_at)}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render clients table view
    renderClientsTable() {
        const tbody = document.getElementById('clients-table-body');
        
        if (this.clients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center empty-state">
                        <i class="fas fa-users"></i>
                        <div>Клиенты не найдены</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.clients.map(client => `
            <tr data-client-id="${client.id}">
                <td>
                    <div class="table-client-info">
                        <div class="client-name">${client.name}</div>
                        <div class="client-address text-muted">${StringUtils.truncate(client.address || '', 30)}</div>
                    </div>
                </td>
                <td>
                    <span class="type-badge type-${client.type}">${this.getTypeText(client.type)}</span>
                </td>
                <td>
                    <div class="client-contacts">
                        <div>${client.phone || '-'}</div>
                        <div class="text-muted">${client.email || '-'}</div>
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${client.status}">${this.getStatusText(client.status)}</span>
                </td>
                <td class="text-center">${client.projects_count || 0}</td>
                <td>${NumberUtils.formatCurrency(client.total_amount || 0)}</td>
                <td>${DateUtils.format(client.created_at)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="this.viewClient(${client.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="this.editClient(${client.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="this.deleteClient(${client.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update results info
    updateResultsInfo() {
        const container = document.getElementById('clients-count');
        const start = (this.pagination.page - 1) * this.pagination.limit + 1;
        const end = Math.min(start + this.clients.length - 1, this.pagination.total);
        
        container.textContent = `Показано ${start}-${end} из ${this.pagination.total} клиентов`;
    }

    // Render pagination
    renderPagination() {
        const container = document.getElementById('clients-pagination');
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
        document.getElementById('clients-search').addEventListener('input', debounce((e) => {
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
                    document.getElementById('clients-grid').classList.remove('d-none');
                    document.getElementById('clients-table').classList.add('d-none');
                } else {
                    document.getElementById('clients-grid').classList.add('d-none');
                    document.getElementById('clients-table').classList.remove('d-none');
                }
                
                this.renderClients();
            });
        });

        // Client type change
        document.querySelector('[name="type"]').addEventListener('change', (e) => {
            const companyFields = document.querySelector('.company-fields');
            if (e.target.value === 'company' || e.target.value === 'government') {
                companyFields.classList.remove('d-none');
            } else {
                companyFields.classList.add('d-none');
            }
        });
    }

    // Apply filters
    applyFilters() {
        this.filters.type = document.getElementById('clients-type-filter').value;
        this.filters.status = document.getElementById('clients-status-filter').value;
        this.filters.region = document.getElementById('clients-region-filter').value;
        
        this.pagination.page = 1;
        this.loadClients();
    }

    // Reset filters
    resetFilters() {
        this.filters = { type: '', status: '', search: '' };
        
        document.getElementById('clients-search').value = '';
        document.getElementById('clients-type-filter').value = '';
        document.getElementById('clients-status-filter').value = '';
        document.getElementById('clients-region-filter').value = '';
        
        this.pagination.page = 1;
        this.loadClients();
    }

    // Change page
    changePage(page) {
        this.pagination.page = page;
        this.loadClients();
    }

    // Get status text
    getStatusText(status) {
        const statusMap = {
            active: 'Активный',
            potential: 'Потенциальный',
            inactive: 'Неактивный',
            vip: 'VIP клиент'
        };
        return statusMap[status] || status;
    }

    // Get type text
    getTypeText(type) {
        const typeMap = {
            individual: 'Физ. лицо',
            company: 'Юр. лицо',
            government: 'Гос. организация'
        };
        return typeMap[type] || type;
    }

    // View client details
    viewClient(clientId) {
        showNotification('Открытие карточки клиента...', 'info');
        // Здесь будет переход к детальной странице клиента
    }

    // Edit client
    editClient(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) return;

        this.currentClient = client;
        
        // Fill form with client data
        const form = document.getElementById('clientForm');
        Object.keys(client).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = client[key] || '';
            }
        });

        // Show company fields if needed
        const companyFields = document.querySelector('.company-fields');
        if (client.type === 'company' || client.type === 'government') {
            companyFields.classList.remove('d-none');
        } else {
            companyFields.classList.add('d-none');
        }

        document.getElementById('clientModalTitle').textContent = 'Редактировать клиента';
        
        // Show modal (assuming Bootstrap 5)
        const modal = new bootstrap.Modal(document.getElementById('clientModal'));
        modal.show();
    }

    // Delete client
    async deleteClient(clientId) {
        if (!confirm('Вы уверены, что хотите удалить этого клиента?')) {
            return;
        }

        try {
            await ClientsAPI.delete(clientId);
            showNotification('Клиент удален', 'success');
            this.loadClients();
        } catch (error) {
            console.error('Client deletion error:', error);
            showNotification('Ошибка удаления клиента', 'error');
        }
    }

    // Show create client modal
    showCreateClientModal() {
        this.currentClient = null;
        
        // Reset form
        document.getElementById('clientForm').reset();
        document.querySelector('.company-fields').classList.add('d-none');
        
        document.getElementById('clientModalTitle').textContent = 'Новый клиент';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('clientModal'));
        modal.show();
    }

    // Save client
    async saveClient() {
        const form = document.getElementById('clientForm');
        const formData = new FormData(form);
        const clientData = Object.fromEntries(formData.entries());

        // Validate required fields
        if (!clientData.name || !clientData.phone || !clientData.type) {
            showNotification('Заполните обязательные поля', 'error');
            return;
        }

        try {
            if (this.currentClient) {
                // Update existing client
                await ClientsAPI.update(this.currentClient.id, clientData);
                showNotification('Клиент обновлен', 'success');
            } else {
                // Create new client
                await ClientsAPI.create(clientData);
                showNotification('Клиент создан', 'success');
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('clientModal'));
            modal.hide();

            // Reload clients
            this.loadClients();

        } catch (error) {
            console.error('Client save error:', error);
            showNotification('Ошибка сохранения клиента', 'error');
        }
    }

    // Export clients
    async exportClients() {
        try {
            showNotification('Экспорт данных...', 'info');
            await ExportAPI.exportClients('excel');
            showNotification('Данные экспортированы', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Ошибка экспорта', 'error');
        }
    }

    // Import clients
    importClients() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                showNotification('Импорт данных...', 'info');
                await ClientsAPI.import(file);
                showNotification('Данные импортированы', 'success');
                this.loadClients();
            } catch (error) {
                console.error('Import error:', error);
                showNotification('Ошибка импорта', 'error');
            }
        };
        input.click();
    }

    // Show module
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.loadClients();
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
window.ClientsModule = ClientsModule;