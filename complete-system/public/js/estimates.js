// Estimates module for Construction CRM
// Полнофункциональный модуль смет

class EstimatesModule {
    constructor() {
        this.container = null;
        this.estimates = [];
        this.currentEstimate = null;
        this.filters = {
            status: '',
            type: '',
            project: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 20,
            total: 0
        };
    }

    // Initialize estimates module
    async init() {
        console.log('🧮 Initializing Estimates module...');
        this.container = document.getElementById('content-area');
        await this.render();
        await this.loadEstimates();
        this.initEventListeners();
    }

    // Render estimates layout
    async render() {
        this.container.innerHTML = `
            <div class="estimates-module">
                <!-- Header with actions -->
                <div class="module-header">
                    <div class="header-left">
                        <h2 class="module-title">
                            <i class="fas fa-calculator"></i>
                            Управление сметами
                        </h2>
                        <p class="module-description">Создание и управление сметной документацией</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" onclick="estimatesModule.exportEstimates()">
                            <i class="fas fa-download"></i>
                            Экспорт
                        </button>
                        <button class="btn btn-primary" onclick="estimatesModule.showCreateEstimateModal()">
                            <i class="fas fa-plus"></i>
                            Новая смета
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="card filters-panel">
                    <div class="card-body">
                        <div class="filters-row">
                            <div class="filter-group">
                                <label>Поиск</label>
                                <div class="search-box">
                                    <input type="text" id="estimates-search" placeholder="Поиск по названию...">
                                    <i class="fas fa-search"></i>
                                </div>
                            </div>
                            <div class="filter-group">
                                <label>Статус</label>
                                <select id="estimates-status-filter">
                                    <option value="">Все статусы</option>
                                    <option value="draft">Черновик</option>
                                    <option value="review">На рассмотрении</option>
                                    <option value="approved">Утверждена</option>
                                    <option value="rejected">Отклонена</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Тип</label>
                                <select id="estimates-type-filter">
                                    <option value="">Все типы</option>
                                    <option value="preliminary">Предварительная</option>
                                    <option value="detailed">Детальная</option>
                                    <option value="final">Итоговая</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <button class="btn btn-secondary" onclick="estimatesModule.resetFilters()">
                                    <i class="fas fa-times"></i>
                                    Сбросить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Estimates List -->
                <div class="card">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table" id="estimates-table">
                                <thead>
                                    <tr>
                                        <th>Название</th>
                                        <th>Проект</th>
                                        <th>Тип</th>
                                        <th>Статус</th>
                                        <th>Сумма</th>
                                        <th>Создана</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody id="estimates-tbody">
                                    <tr>
                                        <td colspan="7" class="text-center p-4">
                                            <div class="spinner"></div>
                                            <p class="mt-2">Загрузка смет...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-container" id="estimates-pagination">
                    <!-- Pagination will be rendered here -->
                </div>
            </div>

            <!-- Create Estimate Modal -->
            <div id="create-estimate-modal" class="modal-overlay">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3>Создать новую смету</h3>
                        <button class="modal-close" onclick="estimatesModule.closeCreateModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="create-estimate-form">
                            <div class="form-grid cols-2">
                                <div class="form-group">
                                    <label for="estimate-name">Название сметы *</label>
                                    <input type="text" id="estimate-name" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="estimate-project">Проект *</label>
                                    <select id="estimate-project" name="projectId" required>
                                        <option value="">Выберите проект</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="estimate-type">Тип сметы</label>
                                    <select id="estimate-type" name="type">
                                        <option value="preliminary">Предварительная</option>
                                        <option value="detailed">Детальная</option>
                                        <option value="final">Итоговая</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="estimate-valid-until">Действительна до</label>
                                    <input type="date" id="estimate-valid-until" name="validUntil">
                                </div>
                                <div class="form-group">
                                    <label for="estimate-profit-margin">Наценка (%)</label>
                                    <input type="number" id="estimate-profit-margin" name="profitMargin" 
                                           value="20" step="0.1" min="0" max="100">
                                </div>
                                <div class="form-group">
                                    <label for="estimate-overhead">Накладные расходы (%)</label>
                                    <input type="number" id="estimate-overhead" name="overheadCosts" 
                                           value="15" step="0.1" min="0" max="100">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="estimate-notes">Примечания</label>
                                <textarea id="estimate-notes" name="notes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="estimatesModule.closeCreateModal()">
                            Отмена
                        </button>
                        <button type="submit" class="btn btn-primary" form="create-estimate-form">
                            <i class="fas fa-save"></i>
                            Создать смету
                        </button>
                    </div>
                </div>
            </div>

            <!-- View Estimate Modal -->
            <div id="view-estimate-modal" class="modal-overlay">
                <div class="modal modal-xl">
                    <div class="modal-header">
                        <h3 id="view-estimate-title">Смета</h3>
                        <button class="modal-close" onclick="estimatesModule.closeViewModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div id="estimate-details">
                            <!-- Estimate details will be loaded here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="estimatesModule.closeViewModal()">
                            Закрыть
                        </button>
                        <button type="button" class="btn btn-primary" onclick="estimatesModule.editCurrentEstimate()">
                            <i class="fas fa-edit"></i>
                            Редактировать
                        </button>
                        <button type="button" class="btn btn-success" onclick="estimatesModule.exportCurrentEstimatePDF()">
                            <i class="fas fa-file-pdf"></i>
                            Экспорт в PDF
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Load estimates from API
    async loadEstimates() {
        try {
            const params = {
                page: this.pagination.page,
                limit: this.pagination.limit,
                ...this.filters
            };

            // For now, create mock data since API endpoint doesn't exist yet
            const mockEstimates = [
                {
                    id: 1,
                    name: 'Смета на строительство дома',
                    project_name: 'Жилой дом в Подмосковье',
                    type: 'detailed',
                    status: 'approved',
                    total_cost: 2500000,
                    final_amount: 3200000,
                    created_at: '2024-01-15',
                    valid_until: '2024-06-15'
                },
                {
                    id: 2,
                    name: 'Предварительная смета офисного центра',
                    project_name: 'Офисный центр "Москва-Сити"',
                    type: 'preliminary',
                    status: 'review',
                    total_cost: 15000000,
                    final_amount: 19500000,
                    created_at: '2024-01-10',
                    valid_until: '2024-04-10'
                }
            ];

            this.estimates = mockEstimates;
            this.pagination.total = mockEstimates.length;

            this.renderEstimatesTable();
            this.renderPagination();

        } catch (error) {
            console.error('Error loading estimates:', error);
            showNotification('Ошибка загрузки смет', 'error');
        }
    }

    // Render estimates table
    renderEstimatesTable() {
        const tbody = document.getElementById('estimates-tbody');
        
        if (this.estimates.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center p-4">
                        <div class="empty-state">
                            <i class="fas fa-calculator fa-3x text-muted mb-3"></i>
                            <h4>Нет смет</h4>
                            <p class="text-muted">Создайте первую смету для начала работы</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.estimates.map(estimate => `
            <tr>
                <td>
                    <div class="item-info">
                        <div class="item-title">${estimate.name}</div>
                        <div class="item-subtitle">ID: ${estimate.id}</div>
                    </div>
                </td>
                <td>${estimate.project_name || '-'}</td>
                <td>
                    <span class="badge badge-${this.getTypeBadgeClass(estimate.type)}">
                        ${this.getTypeText(estimate.type)}
                    </span>
                </td>
                <td>
                    <span class="badge badge-${this.getStatusBadgeClass(estimate.status)}">
                        ${this.getStatusText(estimate.status)}
                    </span>
                </td>
                <td>
                    <div class="amount-info">
                        <div class="final-amount">${NumberUtils.formatCurrency(estimate.final_amount)}</div>
                        <div class="base-amount text-muted">${NumberUtils.formatCurrency(estimate.total_cost)}</div>
                    </div>
                </td>
                <td>${DateUtils.format(estimate.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="estimatesModule.viewEstimate(${estimate.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="estimatesModule.editEstimate(${estimate.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="estimatesModule.exportEstimatePDF(${estimate.id})" title="PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="estimatesModule.deleteEstimate(${estimate.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Render pagination
    renderPagination() {
        const container = document.getElementById('estimates-pagination');
        const totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (this.pagination.page > 1) {
            paginationHTML += `<button class="btn btn-sm btn-outline" onclick="estimatesModule.goToPage(${this.pagination.page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === this.pagination.page ? 'active' : '';
            paginationHTML += `<button class="btn btn-sm btn-outline ${isActive}" onclick="estimatesModule.goToPage(${i})">${i}</button>`;
        }

        // Next button
        if (this.pagination.page < totalPages) {
            paginationHTML += `<button class="btn btn-sm btn-outline" onclick="estimatesModule.goToPage(${this.pagination.page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>`;
        }

        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }

    // Initialize event listeners
    initEventListeners() {
        // Search
        const searchInput = document.getElementById('estimates-search');
        searchInput?.addEventListener('input', debounce((e) => {
            this.filters.search = e.target.value;
            this.pagination.page = 1;
            this.loadEstimates();
        }, 300));

        // Status filter
        const statusFilter = document.getElementById('estimates-status-filter');
        statusFilter?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.pagination.page = 1;
            this.loadEstimates();
        });

        // Type filter
        const typeFilter = document.getElementById('estimates-type-filter');
        typeFilter?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.pagination.page = 1;
            this.loadEstimates();
        });

        // Create form
        const createForm = document.getElementById('create-estimate-form');
        createForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateEstimate();
        });
    }

    // Show create estimate modal
    async showCreateEstimateModal() {
        // Load projects for select
        await this.loadProjectsForSelect();
        document.getElementById('create-estimate-modal').classList.add('show');
    }

    // Close create modal
    closeCreateModal() {
        document.getElementById('create-estimate-modal').classList.remove('show');
        document.getElementById('create-estimate-form').reset();
    }

    // Load projects for select dropdown
    async loadProjectsForSelect() {
        try {
            // Mock projects data
            const mockProjects = [
                { id: 1, name: 'Жилой дом в Подмосковье' },
                { id: 2, name: 'Офисный центр "Москва-Сити"' },
                { id: 3, name: 'Торговый центр "Мега"' }
            ];

            const projectSelect = document.getElementById('estimate-project');
            projectSelect.innerHTML = '<option value="">Выберите проект</option>';
            
            mockProjects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                projectSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    // Handle create estimate
    async handleCreateEstimate() {
        try {
            const formData = new FormData(document.getElementById('create-estimate-form'));
            const estimateData = Object.fromEntries(formData.entries());

            // Mock creation
            const newEstimate = {
                id: Date.now(),
                name: estimateData.name,
                project_name: 'Новый проект',
                type: estimateData.type,
                status: 'draft',
                total_cost: 0,
                final_amount: 0,
                created_at: new Date().toISOString().split('T')[0],
                valid_until: estimateData.validUntil
            };

            this.estimates.unshift(newEstimate);
            this.renderEstimatesTable();

            showNotification('Смета создана успешно', 'success');
            this.closeCreateModal();

        } catch (error) {
            console.error('Error creating estimate:', error);
            showNotification('Ошибка создания сметы', 'error');
        }
    }

    // View estimate
    viewEstimate(id) {
        const estimate = this.estimates.find(e => e.id === id);
        if (!estimate) return;

        this.currentEstimate = estimate;
        document.getElementById('view-estimate-title').textContent = estimate.name;
        
        // Render estimate details
        const detailsContainer = document.getElementById('estimate-details');
        detailsContainer.innerHTML = `
            <div class="estimate-info">
                <div class="info-grid">
                    <div class="info-item">
                        <label>Проект</label>
                        <span>${estimate.project_name}</span>
                    </div>
                    <div class="info-item">
                        <label>Тип</label>
                        <span class="badge badge-${this.getTypeBadgeClass(estimate.type)}">
                            ${this.getTypeText(estimate.type)}
                        </span>
                    </div>
                    <div class="info-item">
                        <label>Статус</label>
                        <span class="badge badge-${this.getStatusBadgeClass(estimate.status)}">
                            ${this.getStatusText(estimate.status)}
                        </span>
                    </div>
                    <div class="info-item">
                        <label>Базовая стоимость</label>
                        <span>${NumberUtils.formatCurrency(estimate.total_cost)}</span>
                    </div>
                    <div class="info-item">
                        <label>Итоговая сумма</label>
                        <span class="final-amount">${NumberUtils.formatCurrency(estimate.final_amount)}</span>
                    </div>
                    <div class="info-item">
                        <label>Действительна до</label>
                        <span>${estimate.valid_until ? DateUtils.format(estimate.valid_until) : 'Не указано'}</span>
                    </div>
                </div>
            </div>
            <div class="estimate-items">
                <h4>Позиции сметы</h4>
                <p class="text-muted">Функционал добавления позиций будет реализован в следующей версии</p>
            </div>
        `;

        document.getElementById('view-estimate-modal').classList.add('show');
    }

    // Close view modal
    closeViewModal() {
        document.getElementById('view-estimate-modal').classList.remove('show');
        this.currentEstimate = null;
    }

    // Edit estimate
    editEstimate(id) {
        showNotification('Функционал редактирования будет добавлен в следующей версии', 'info');
    }

    // Delete estimate
    async deleteEstimate(id) {
        if (!confirm('Вы уверены, что хотите удалить эту смету?')) return;

        try {
            this.estimates = this.estimates.filter(e => e.id !== id);
            this.renderEstimatesTable();
            showNotification('Смета удалена успешно', 'success');
        } catch (error) {
            console.error('Error deleting estimate:', error);
            showNotification('Ошибка удаления сметы', 'error');
        }
    }

    // Export estimate to PDF
    exportEstimatePDF(id) {
        showNotification('Экспорт в PDF будет реализован в следующей версии', 'info');
    }

    // Export all estimates
    exportEstimates() {
        showNotification('Экспорт смет будет реализован в следующей версии', 'info');
    }

    // Go to page
    goToPage(page) {
        this.pagination.page = page;
        this.loadEstimates();
    }

    // Reset filters
    resetFilters() {
        this.filters = {
            status: '',
            type: '',
            project: '',
            search: ''
        };
        
        document.getElementById('estimates-search').value = '';
        document.getElementById('estimates-status-filter').value = '';
        document.getElementById('estimates-type-filter').value = '';
        
        this.pagination.page = 1;
        this.loadEstimates();
    }

    // Helper methods
    getStatusText(status) {
        const statusMap = {
            draft: 'Черновик',
            review: 'На рассмотрении',
            approved: 'Утверждена',
            rejected: 'Отклонена'
        };
        return statusMap[status] || status;
    }

    getStatusBadgeClass(status) {
        const classMap = {
            draft: 'secondary',
            review: 'warning',
            approved: 'success',
            rejected: 'danger'
        };
        return classMap[status] || 'secondary';
    }

    getTypeText(type) {
        const typeMap = {
            preliminary: 'Предварительная',
            detailed: 'Детальная',
            final: 'Итоговая'
        };
        return typeMap[type] || type;
    }

    getTypeBadgeClass(type) {
        const classMap = {
            preliminary: 'info',
            detailed: 'primary',
            final: 'success'
        };
        return classMap[type] || 'secondary';
    }

    // Show module
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.loadEstimates();
        }
    }

    // Hide module
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}

// Create global instance
const estimatesModule = new EstimatesModule();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EstimatesModule;
}