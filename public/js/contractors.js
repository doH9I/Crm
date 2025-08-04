// Contractors module for Construction CRM

class ContractorsModule {
    constructor() {
        this.container = null;
        this.contractors = [];
        this.currentContractor = null;
        this.filters = {
            specialty: '',
            status: '',
            rating: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 20,
            total: 0
        };
    }

    // Initialize contractors module
    async init() {
        this.container = document.getElementById('content-area');
        await this.render();
        await this.loadContractors();
        this.initEventListeners();
    }

    // Render contractors layout
    async render() {
        this.container.innerHTML = `
            <div class="contractors-module">
                <!-- Header with actions -->
                <div class="module-header">
                    <div class="header-left">
                        <h2 class="module-title">Управление подрядчиками</h2>
                        <p class="module-description">База данных подрядчиков и поставщиков</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" onclick="this.exportContractors()">
                            <i class="fas fa-download"></i>
                            Экспорт
                        </button>
                        <button class="btn btn-outline" onclick="this.importContractors()">
                            <i class="fas fa-upload"></i>
                            Импорт
                        </button>
                        <button class="btn btn-primary" onclick="this.showCreateContractorModal()">
                            <i class="fas fa-plus"></i>
                            Новый подрядчик
                        </button>
                    </div>
                </div>

                <!-- Filters and search -->
                <div class="filters-panel card">
                    <div class="card-body">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label class="form-label">Поиск</label>
                                <input type="text" class="form-control" id="contractors-search" placeholder="Поиск по названию, специализации...">
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Специализация</label>
                                <select class="form-select" id="contractors-specialty-filter">
                                    <option value="">Все специализации</option>
                                    <option value="construction">Строительство</option>
                                    <option value="electrical">Электромонтаж</option>
                                    <option value="plumbing">Сантехника</option>
                                    <option value="hvac">Вентиляция и кондиционирование</option>
                                    <option value="finishing">Отделочные работы</option>
                                    <option value="roofing">Кровельные работы</option>
                                    <option value="flooring">Напольные покрытия</option>
                                    <option value="painting">Малярные работы</option>
                                    <option value="landscaping">Благоустройство</option>
                                    <option value="demolition">Демонтаж</option>
                                    <option value="materials">Поставка материалов</option>
                                    <option value="equipment">Аренда техники</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Статус</label>
                                <select class="form-select" id="contractors-status-filter">
                                    <option value="">Все статусы</option>
                                    <option value="active">Активный</option>
                                    <option value="verified">Проверенный</option>
                                    <option value="preferred">Предпочтительный</option>
                                    <option value="blocked">Заблокированный</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Рейтинг</label>
                                <select class="form-select" id="contractors-rating-filter">
                                    <option value="">Любой рейтинг</option>
                                    <option value="5">5 звезд</option>
                                    <option value="4">4+ звезд</option>
                                    <option value="3">3+ звезд</option>
                                    <option value="2">2+ звезд</option>
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

                <!-- Contractors grid/table -->
                <div class="contractors-content">
                    <div class="content-header">
                        <div class="results-info">
                            <span id="contractors-count">Загрузка...</span>
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
                    <div class="contractors-grid grid-responsive cols-3" id="contractors-grid">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Загрузка подрядчиков...</p>
                        </div>
                    </div>

                    <!-- Table view -->
                    <div class="contractors-table d-none" id="contractors-table">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Подрядчик</th>
                                        <th>Специализация</th>
                                        <th>Контакты</th>
                                        <th>Рейтинг</th>
                                        <th>Статус</th>
                                        <th>Проекты</th>
                                        <th>Общая сумма</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody id="contractors-table-body">
                                    <tr>
                                        <td colspan="8" class="text-center">Загрузка...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <div class="pagination-container" id="contractors-pagination">
                        <!-- Будет заполнено динамически -->
                    </div>
                </div>
            </div>

            <!-- Contractor Modal -->
            <div class="modal fade" id="contractorModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="contractorModalTitle">Новый подрядчик</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="contractorForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Название компании *</label>
                                            <input type="text" class="form-control" name="name" required placeholder="Название компании">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Специализация *</label>
                                            <select class="form-select" name="specialty" required>
                                                <option value="">Выберите специализацию</option>
                                                <option value="construction">Строительство</option>
                                                <option value="electrical">Электромонтаж</option>
                                                <option value="plumbing">Сантехника</option>
                                                <option value="hvac">Вентиляция и кондиционирование</option>
                                                <option value="finishing">Отделочные работы</option>
                                                <option value="roofing">Кровельные работы</option>
                                                <option value="flooring">Напольные покрытия</option>
                                                <option value="painting">Малярные работы</option>
                                                <option value="landscaping">Благоустройство</option>
                                                <option value="demolition">Демонтаж</option>
                                                <option value="materials">Поставка материалов</option>
                                                <option value="equipment">Аренда техники</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Контактное лицо *</label>
                                            <input type="text" class="form-control" name="contact_person" required placeholder="ФИО контактного лица">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Должность</label>
                                            <input type="text" class="form-control" name="contact_position" placeholder="Должность контактного лица">
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
                                            <input type="email" class="form-control" name="email" placeholder="contractor@example.com">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label class="form-label">Адрес</label>
                                            <textarea class="form-control" name="address" rows="2" placeholder="Юридический адрес подрядчика"></textarea>
                                        </div>
                                    </div>
                                </div>

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
                                            <label class="form-label">Статус</label>
                                            <select class="form-select" name="status">
                                                <option value="active">Активный</option>
                                                <option value="verified">Проверенный</option>
                                                <option value="preferred">Предпочтительный</option>
                                                <option value="blocked">Заблокированный</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Рейтинг</label>
                                            <select class="form-select" name="rating">
                                                <option value="">Без рейтинга</option>
                                                <option value="1">1 звезда</option>
                                                <option value="2">2 звезды</option>
                                                <option value="3">3 звезды</option>
                                                <option value="4">4 звезды</option>
                                                <option value="5">5 звезд</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label class="form-label">Услуги и возможности</label>
                                            <textarea class="form-control" name="services" rows="3" placeholder="Описание предоставляемых услуг и возможностей"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label class="form-label">Примечания</label>
                                            <textarea class="form-control" name="notes" rows="2" placeholder="Дополнительная информация о подрядчике"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-primary" onclick="this.saveContractor()">Сохранить</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Load contractors from API
    async loadContractors() {
        try {
            const params = {
                page: this.pagination.page,
                limit: this.pagination.limit,
                ...this.filters
            };

            const response = await ContractorsAPI.getAll(params);
            this.contractors = response.contractors || [];
            this.pagination.total = response.total || 0;

            this.renderContractors();
            this.updateResultsInfo();
            this.renderPagination();

        } catch (error) {
            console.error('Contractors loading error:', error);
            showNotification('Ошибка загрузки подрядчиков', 'error');
            this.renderEmptyState();
        }
    }

    // Render contractors in current view
    renderContractors() {
        const viewMode = document.querySelector('.view-controls .btn.active').dataset.view;
        
        if (viewMode === 'grid') {
            this.renderContractorsGrid();
        } else {
            this.renderContractorsTable();
        }
    }

    // Render contractors grid view
    renderContractorsGrid() {
        const container = document.getElementById('contractors-grid');
        
        if (this.contractors.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hard-hat"></i>
                    <h4>Подрядчики не найдены</h4>
                    <p>Добавьте первого подрядчика или измените параметры поиска</p>
                    <button class="btn btn-primary" onclick="this.showCreateContractorModal()">
                        <i class="fas fa-plus"></i>
                        Добавить подрядчика
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.contractors.map(contractor => `
            <div class="contractor-card card" data-contractor-id="${contractor.id}">
                <div class="card-header">
                    <div class="contractor-status">
                        <span class="status-badge status-${contractor.status}">${this.getStatusText(contractor.status)}</span>
                        <div class="contractor-rating">
                            ${this.renderStars(contractor.rating)}
                        </div>
                    </div>
                    <div class="contractor-actions">
                        <button class="btn btn-sm btn-outline" onclick="this.viewContractor(${contractor.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="this.editContractor(${contractor.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="contractor-name">${contractor.name}</h3>
                    <p class="contractor-specialty">
                        <i class="fas fa-tools"></i>
                        ${this.getSpecialtyText(contractor.specialty)}
                    </p>
                    <div class="contractor-contact">
                        <p class="contact-person">
                            <i class="fas fa-user"></i>
                            ${contractor.contact_person || 'Контактное лицо не указано'}
                        </p>
                        <p class="contact-phone">
                            <i class="fas fa-phone"></i>
                            ${contractor.phone || 'Телефон не указан'}
                        </p>
                    </div>
                    <div class="contractor-meta">
                        <div class="meta-item">
                            <span class="meta-label">Проекты:</span>
                            <span class="meta-value">${contractor.projects_count || 0}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Общая сумма:</span>
                            <span class="meta-value">${NumberUtils.formatCurrency(contractor.total_amount || 0)}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="contractor-dates">
                        <small class="text-muted">
                            Добавлен: ${DateUtils.format(contractor.created_at)}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render contractors table view
    renderContractorsTable() {
        const tbody = document.getElementById('contractors-table-body');
        
        if (this.contractors.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center empty-state">
                        <i class="fas fa-hard-hat"></i>
                        <div>Подрядчики не найдены</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.contractors.map(contractor => `
            <tr data-contractor-id="${contractor.id}">
                <td>
                    <div class="table-contractor-info">
                        <div class="contractor-name">${contractor.name}</div>
                        <div class="contact-person text-muted">${contractor.contact_person || 'Контактное лицо не указано'}</div>
                    </div>
                </td>
                <td>
                    <span class="specialty-badge">${this.getSpecialtyText(contractor.specialty)}</span>
                </td>
                <td>
                    <div class="contractor-contacts">
                        <div>${contractor.phone || '-'}</div>
                        <div class="text-muted">${contractor.email || '-'}</div>
                    </div>
                </td>
                <td>
                    <div class="rating-display">
                        ${this.renderStars(contractor.rating)}
                        <span class="rating-text">${contractor.rating || 'Нет'}</span>
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${contractor.status}">${this.getStatusText(contractor.status)}</span>
                </td>
                <td class="text-center">${contractor.projects_count || 0}</td>
                <td>${NumberUtils.formatCurrency(contractor.total_amount || 0)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="this.viewContractor(${contractor.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="this.editContractor(${contractor.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="this.deleteContractor(${contractor.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Render star rating
    renderStars(rating) {
        if (!rating) return '<span class="text-muted">Без рейтинга</span>';
        
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star text-warning"></i>';
            } else {
                stars += '<i class="far fa-star text-muted"></i>';
            }
        }
        return stars;
    }

    // Update results info
    updateResultsInfo() {
        const container = document.getElementById('contractors-count');
        const start = (this.pagination.page - 1) * this.pagination.limit + 1;
        const end = Math.min(start + this.contractors.length - 1, this.pagination.total);
        
        container.textContent = `Показано ${start}-${end} из ${this.pagination.total} подрядчиков`;
    }

    // Render pagination
    renderPagination() {
        const container = document.getElementById('contractors-pagination');
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
        document.getElementById('contractors-search').addEventListener('input', debounce((e) => {
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
                    document.getElementById('contractors-grid').classList.remove('d-none');
                    document.getElementById('contractors-table').classList.add('d-none');
                } else {
                    document.getElementById('contractors-grid').classList.add('d-none');
                    document.getElementById('contractors-table').classList.remove('d-none');
                }
                
                this.renderContractors();
            });
        });
    }

    // Apply filters
    applyFilters() {
        this.filters.specialty = document.getElementById('contractors-specialty-filter').value;
        this.filters.status = document.getElementById('contractors-status-filter').value;
        this.filters.rating = document.getElementById('contractors-rating-filter').value;
        
        this.pagination.page = 1;
        this.loadContractors();
    }

    // Reset filters
    resetFilters() {
        this.filters = { specialty: '', status: '', rating: '', search: '' };
        
        document.getElementById('contractors-search').value = '';
        document.getElementById('contractors-specialty-filter').value = '';
        document.getElementById('contractors-status-filter').value = '';
        document.getElementById('contractors-rating-filter').value = '';
        
        this.pagination.page = 1;
        this.loadContractors();
    }

    // Change page
    changePage(page) {
        this.pagination.page = page;
        this.loadContractors();
    }

    // Get status text
    getStatusText(status) {
        const statusMap = {
            active: 'Активный',
            verified: 'Проверенный',
            preferred: 'Предпочтительный',
            blocked: 'Заблокированный'
        };
        return statusMap[status] || status;
    }

    // Get specialty text
    getSpecialtyText(specialty) {
        const specialtyMap = {
            construction: 'Строительство',
            electrical: 'Электромонтаж',
            plumbing: 'Сантехника',
            hvac: 'Вентиляция',
            finishing: 'Отделка',
            roofing: 'Кровля',
            flooring: 'Полы',
            painting: 'Покраска',
            landscaping: 'Благоустройство',
            demolition: 'Демонтаж',
            materials: 'Материалы',
            equipment: 'Техника'
        };
        return specialtyMap[specialty] || specialty;
    }

    // View contractor details
    viewContractor(contractorId) {
        showNotification('Открытие карточки подрядчика...', 'info');
        // Здесь будет переход к детальной странице подрядчика
    }

    // Edit contractor
    editContractor(contractorId) {
        const contractor = this.contractors.find(c => c.id === contractorId);
        if (!contractor) return;

        this.currentContractor = contractor;
        
        // Fill form with contractor data
        const form = document.getElementById('contractorForm');
        Object.keys(contractor).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = contractor[key] || '';
            }
        });

        document.getElementById('contractorModalTitle').textContent = 'Редактировать подрядчика';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('contractorModal'));
        modal.show();
    }

    // Delete contractor
    async deleteContractor(contractorId) {
        if (!confirm('Вы уверены, что хотите удалить этого подрядчика?')) {
            return;
        }

        try {
            await ContractorsAPI.delete(contractorId);
            showNotification('Подрядчик удален', 'success');
            this.loadContractors();
        } catch (error) {
            console.error('Contractor deletion error:', error);
            showNotification('Ошибка удаления подрядчика', 'error');
        }
    }

    // Show create contractor modal
    showCreateContractorModal() {
        this.currentContractor = null;
        
        // Reset form
        document.getElementById('contractorForm').reset();
        
        document.getElementById('contractorModalTitle').textContent = 'Новый подрядчик';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('contractorModal'));
        modal.show();
    }

    // Save contractor
    async saveContractor() {
        const form = document.getElementById('contractorForm');
        const formData = new FormData(form);
        const contractorData = Object.fromEntries(formData.entries());

        // Validate required fields
        if (!contractorData.name || !contractorData.specialty || !contractorData.contact_person || !contractorData.phone) {
            showNotification('Заполните обязательные поля', 'error');
            return;
        }

        try {
            if (this.currentContractor) {
                // Update existing contractor
                await ContractorsAPI.update(this.currentContractor.id, contractorData);
                showNotification('Подрядчик обновлен', 'success');
            } else {
                // Create new contractor
                await ContractorsAPI.create(contractorData);
                showNotification('Подрядчик создан', 'success');
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('contractorModal'));
            modal.hide();

            // Reload contractors
            this.loadContractors();

        } catch (error) {
            console.error('Contractor save error:', error);
            showNotification('Ошибка сохранения подрядчика', 'error');
        }
    }

    // Export contractors
    async exportContractors() {
        try {
            showNotification('Экспорт данных...', 'info');
            await ExportAPI.exportContractors('excel');
            showNotification('Данные экспортированы', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Ошибка экспорта', 'error');
        }
    }

    // Import contractors
    importContractors() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                showNotification('Импорт данных...', 'info');
                await ContractorsAPI.import(file);
                showNotification('Данные импортированы', 'success');
                this.loadContractors();
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
            this.loadContractors();
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
window.ContractorsModule = ContractorsModule;