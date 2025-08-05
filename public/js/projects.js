// Projects module for Construction CRM

class ProjectsModule {
    constructor() {
        this.container = null;
        this.projects = [];
        this.currentProject = null;
        this.filters = {
            status: '',
            type: '',
            manager: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 20,
            total: 0
        };
    }

    // Initialize projects module
    async init() {
        this.container = document.getElementById('content-area');
        await this.render();
        await this.loadProjects();
        this.initEventListeners();
    }

    // Render projects layout
    async render() {
        this.container.innerHTML = `
            <div class="projects-module">
                <!-- Header with actions -->
                <div class="module-header">
                    <div class="header-left">
                        <h2 class="module-title">Управление проектами</h2>
                        <p class="module-description">Полный контроль строительных проектов</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" onclick="this.exportProjects()">
                            <i class="fas fa-download"></i>
                            Экспорт
                        </button>
                        <button class="btn btn-primary" onclick="this.showCreateProjectModal()">
                            <i class="fas fa-plus"></i>
                            Новый проект
                        </button>
                    </div>
                </div>

                <!-- Filters and search -->
                <div class="filters-panel card">
                    <div class="card-body">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label class="form-label">Поиск</label>
                                <input type="text" class="form-control" id="projects-search" placeholder="Поиск по названию, клиенту...">
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Статус</label>
                                <select class="form-select" id="projects-status-filter">
                                    <option value="">Все статусы</option>
                                    <option value="planning">Планирование</option>
                                    <option value="design">Проектирование</option>
                                    <option value="approval">Согласование</option>
                                    <option value="construction">Строительство</option>
                                    <option value="completion">Завершение</option>
                                    <option value="warranty">Гарантия</option>
                                    <option value="closed">Закрыт</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Тип</label>
                                <select class="form-select" id="projects-type-filter">
                                    <option value="">Все типы</option>
                                    <option value="residential">Жилое</option>
                                    <option value="commercial">Коммерческое</option>
                                    <option value="industrial">Промышленное</option>
                                    <option value="renovation">Реконструкция</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="form-label">Менеджер</label>
                                <select class="form-select" id="projects-manager-filter">
                                    <option value="">Все менеджеры</option>
                                    <!-- Будет заполнено динамически -->
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

                <!-- Projects grid/table -->
                <div class="projects-content">
                    <div class="content-header">
                        <div class="results-info">
                            <span id="projects-count">Загрузка...</span>
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
                    <div class="projects-grid grid-responsive cols-3" id="projects-grid">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Загрузка проектов...</p>
                        </div>
                    </div>

                    <!-- Table view -->
                    <div class="projects-table d-none" id="projects-table">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Проект</th>
                                        <th>Клиент</th>
                                        <th>Тип</th>
                                        <th>Статус</th>
                                        <th>Прогресс</th>
                                        <th>Бюджет</th>
                                        <th>Дата начала</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody id="projects-table-body">
                                    <tr>
                                        <td colspan="8" class="text-center">Загрузка...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <div class="pagination-container" id="projects-pagination">
                        <!-- Будет заполнено динамически -->
                    </div>
                </div>
            </div>
        `;
    }

    // Load projects from API
    async loadProjects() {
        try {
            const params = {
                page: this.pagination.page,
                limit: this.pagination.limit,
                ...this.filters
            };

            const response = await ProjectsAPI.getAll(params);
            this.projects = response.projects || [];
            this.pagination.total = response.total || 0;

            this.renderProjects();
            this.updateResultsInfo();
            this.renderPagination();

        } catch (error) {
            console.error('Projects loading error:', error);
            showNotification('Ошибка загрузки проектов', 'error');
            this.renderEmptyState();
        }
    }

    // Render projects in current view
    renderProjects() {
        const viewMode = document.querySelector('.view-controls .btn.active').dataset.view;
        
        if (viewMode === 'grid') {
            this.renderProjectsGrid();
        } else {
            this.renderProjectsTable();
        }
    }

    // Render projects grid view
    renderProjectsGrid() {
        const container = document.getElementById('projects-grid');
        
        if (this.projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-project-diagram"></i>
                    <h4>Проекты не найдены</h4>
                    <p>Создайте первый проект или измените параметры поиска</p>
                    <button class="btn btn-primary" onclick="this.showCreateProjectModal()">
                        <i class="fas fa-plus"></i>
                        Создать проект
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.projects.map(project => `
            <div class="project-card card" data-project-id="${project.id}">
                <div class="card-header">
                    <div class="project-status">
                        <span class="status-badge status-${project.status}">${this.getStatusText(project.status)}</span>
                    </div>
                    <div class="project-actions">
                        <button class="btn btn-sm btn-outline" onclick="this.viewProject(${project.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="this.editProject(${project.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="project-title">${project.name}</h3>
                    <p class="project-client">
                        <i class="fas fa-user"></i>
                        ${project.client_name || 'Без клиента'}
                    </p>
                    <p class="project-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${project.address || 'Адрес не указан'}
                    </p>
                    <div class="project-meta">
                        <div class="meta-item">
                            <span class="meta-label">Тип:</span>
                            <span class="meta-value">${this.getTypeText(project.type)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Бюджет:</span>
                            <span class="meta-value">${NumberUtils.formatCurrency(project.budget)}</span>
                        </div>
                    </div>
                    <div class="project-progress">
                        <div class="progress-header">
                            <span>Прогресс</span>
                            <span class="progress-value">${project.progress || 0}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="project-dates">
                        <small class="text-muted">
                            Создан: ${DateUtils.format(project.created_at)}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render projects table view
    renderProjectsTable() {
        const tbody = document.getElementById('projects-table-body');
        
        if (this.projects.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center empty-state">
                        <i class="fas fa-project-diagram"></i>
                        <div>Проекты не найдены</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.projects.map(project => `
            <tr data-project-id="${project.id}">
                <td>
                    <div class="table-project-info">
                        <div class="project-name">${project.name}</div>
                        <div class="project-description text-muted">${StringUtils.truncate(project.description, 50)}</div>
                    </div>
                </td>
                <td>${project.client_name || 'Без клиента'}</td>
                <td>${this.getTypeText(project.type)}</td>
                <td>
                    <span class="status-badge status-${project.status}">${this.getStatusText(project.status)}</span>
                </td>
                <td>
                    <div class="table-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                        </div>
                        <span class="progress-text">${project.progress || 0}%</span>
                    </div>
                </td>
                <td>${NumberUtils.formatCurrency(project.budget)}</td>
                <td>${DateUtils.format(project.start_date)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="this.viewProject(${project.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="this.editProject(${project.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="this.deleteProject(${project.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update results info
    updateResultsInfo() {
        const container = document.getElementById('projects-count');
        const start = (this.pagination.page - 1) * this.pagination.limit + 1;
        const end = Math.min(start + this.projects.length - 1, this.pagination.total);
        
        container.textContent = `Показано ${start}-${end} из ${this.pagination.total} проектов`;
    }

    // Render pagination
    renderPagination() {
        const container = document.getElementById('projects-pagination');
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
        document.getElementById('projects-search').addEventListener('input', debounce((e) => {
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
                    document.getElementById('projects-grid').classList.remove('d-none');
                    document.getElementById('projects-table').classList.add('d-none');
                } else {
                    document.getElementById('projects-grid').classList.add('d-none');
                    document.getElementById('projects-table').classList.remove('d-none');
                }
                
                this.renderProjects();
            });
        });
    }

    // Apply filters
    applyFilters() {
        this.filters.status = document.getElementById('projects-status-filter').value;
        this.filters.type = document.getElementById('projects-type-filter').value;
        this.filters.manager = document.getElementById('projects-manager-filter').value;
        
        this.pagination.page = 1;
        this.loadProjects();
    }

    // Reset filters
    resetFilters() {
        this.filters = { status: '', type: '', manager: '', search: '' };
        
        document.getElementById('projects-search').value = '';
        document.getElementById('projects-status-filter').value = '';
        document.getElementById('projects-type-filter').value = '';
        document.getElementById('projects-manager-filter').value = '';
        
        this.pagination.page = 1;
        this.loadProjects();
    }

    // Change page
    changePage(page) {
        this.pagination.page = page;
        this.loadProjects();
    }

    // Get status text
    getStatusText(status) {
        const statusMap = {
            planning: 'Планирование',
            design: 'Проектирование',
            approval: 'Согласование',
            construction: 'Строительство',
            completion: 'Завершение',
            warranty: 'Гарантия',
            closed: 'Закрыт'
        };
        return statusMap[status] || status;
    }

    // Get type text
    getTypeText(type) {
        const typeMap = {
            residential: 'Жилое',
            commercial: 'Коммерческое',
            industrial: 'Промышленное',
            renovation: 'Реконструкция'
        };
        return typeMap[type] || type;
    }

    // View project details
    viewProject(projectId) {
        showNotification('Открытие проекта...', 'info');
        // Здесь будет переход к детальной странице проекта
    }

    // Edit project
    editProject(projectId) {
        showNotification('Редактирование проекта...', 'info');
        // Здесь будет модальное окно редактирования
    }

    // Delete project
    async deleteProject(projectId) {
        if (!confirm('Вы уверены, что хотите удалить этот проект?')) {
            return;
        }

        try {
            await ProjectsAPI.delete(projectId);
            showNotification('Проект удален', 'success');
            this.loadProjects();
        } catch (error) {
            console.error('Project deletion error:', error);
            showNotification('Ошибка удаления проекта', 'error');
        }
    }

    // Show create project modal
    showCreateProjectModal() {
        showNotification('Создание нового проекта...', 'info');
        // Здесь будет модальное окно создания проекта
    }

    // Export projects
    async exportProjects() {
        try {
            showNotification('Экспорт данных...', 'info');
            await ExportAPI.exportProjects('excel');
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
            this.loadProjects();
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
window.ProjectsModule = ProjectsModule;