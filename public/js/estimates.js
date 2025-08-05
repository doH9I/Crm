// Модуль составления смет по ГОСТ для Construction CRM

class EstimatesModule {
    constructor() {
        this.currentEstimate = null;
        this.currentProject = null;
        this.estimateItems = [];
        this.templates = [];
        this.categories = [];
        this.priceList = [];
        this.filters = {
            status: 'all',
            project: 'all',
            dateFrom: '',
            dateTo: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 20,
            total: 0
        };
        this.sortBy = 'created_at';
        this.sortOrder = 'DESC';
    }

    // Инициализация модуля
    async init() {
        await this.render();
        await this.loadData();
        this.bindEvents();
    }

    // Рендеринг основного интерфейса
    async render() {
        const content = document.getElementById('main-content');
        content.innerHTML = `
            <div class="estimates-module">
                <div class="module-header">
                    <div class="header-title">
                        <h1><i class="fas fa-calculator"></i> Сметы</h1>
                        <p>Составление смет по ГОСТ и управление расчетами</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" onclick="estimatesModule.showTemplates()">
                            <i class="fas fa-file-alt"></i> Шаблоны
                        </button>
                        <button class="btn btn-primary" onclick="estimatesModule.showCreateForm()">
                            <i class="fas fa-plus"></i> Новая смета
                        </button>
                    </div>
                </div>

                <div class="module-toolbar">
                    <div class="toolbar-filters">
                        <div class="filter-group">
                            <select id="statusFilter" onchange="estimatesModule.applyFilters()">
                                <option value="all">Все статусы</option>
                                <option value="draft">Черновик</option>
                                <option value="in_progress">В работе</option>
                                <option value="approved">Утверждена</option>
                                <option value="rejected">Отклонена</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <select id="projectFilter" onchange="estimatesModule.applyFilters()">
                                <option value="all">Все проекты</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <input type="date" id="dateFromFilter" onchange="estimatesModule.applyFilters()" placeholder="От">
                        </div>
                        <div class="filter-group">
                            <input type="date" id="dateToFilter" onchange="estimatesModule.applyFilters()" placeholder="До">
                        </div>
                        <div class="filter-group search-group">
                            <input type="text" id="searchFilter" placeholder="Поиск по названию..." onkeyup="estimatesModule.handleSearch(event)">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                    <div class="toolbar-actions">
                        <div class="view-toggle">
                            <button class="view-btn active" data-view="grid" onclick="estimatesModule.setView('grid')">
                                <i class="fas fa-th-large"></i>
                            </button>
                            <button class="view-btn" data-view="table" onclick="estimatesModule.setView('table')">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        <button class="btn btn-outline" onclick="estimatesModule.exportData()">
                            <i class="fas fa-download"></i> Экспорт
                        </button>
                    </div>
                </div>

                <div class="estimates-content">
                    <div id="estimates-grid" class="estimates-grid">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Загрузка смет...</p>
                        </div>
                    </div>
                </div>

                <div class="module-pagination">
                    <div class="pagination-info">
                        <span id="pagination-info">Показано 0-0 из 0</span>
                    </div>
                    <div class="pagination-controls" id="pagination-controls">
                        <!-- Pagination will be generated here -->
                    </div>
                </div>
            </div>

            <!-- Модальное окно создания/редактирования сметы -->
            <div id="estimate-modal" class="modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3 id="estimate-modal-title">Новая смета</h3>
                        <button class="modal-close" onclick="estimatesModule.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="estimate-form" class="estimate-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="estimate-name">Название сметы *</label>
                                    <input type="text" id="estimate-name" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="estimate-project">Проект *</label>
                                    <select id="estimate-project" name="project_id" required>
                                        <option value="">Выберите проект</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="estimate-type">Тип сметы</label>
                                    <select id="estimate-type" name="type">
                                        <option value="local">Локальная смета</option>
                                        <option value="object">Объектная смета</option>
                                        <option value="summary">Сводный сметный расчет</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="estimate-template">Шаблон</label>
                                    <select id="estimate-template" name="template_id" onchange="estimatesModule.loadTemplate()">
                                        <option value="">Без шаблона</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="estimate-profit">Прибыль (%)</label>
                                    <input type="number" id="estimate-profit" name="profit_margin" value="8" min="0" max="100" step="0.1">
                                </div>
                                <div class="form-group">
                                    <label for="estimate-overhead">Накладные расходы (%)</label>
                                    <input type="number" id="estimate-overhead" name="overhead_costs" value="15" min="0" max="100" step="0.1">
                                </div>
                                <div class="form-group">
                                    <label for="estimate-vat">НДС (%)</label>
                                    <input type="number" id="estimate-vat" name="vat_rate" value="20" min="0" max="100" step="0.1">
                                </div>
                                <div class="form-group">
                                    <label for="estimate-currency">Валюта</label>
                                    <select id="estimate-currency" name="currency">
                                        <option value="RUB">₽ Рубли</option>
                                        <option value="USD">$ Доллары</option>
                                        <option value="EUR">€ Евро</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="estimate-description">Описание</label>
                                <textarea id="estimate-description" name="description" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" onclick="estimatesModule.closeModal()">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="estimatesModule.saveEstimate()">Создать смету</button>
                    </div>
                </div>
            </div>

            <!-- Модальное окно детального просмотра сметы -->
            <div id="estimate-detail-modal" class="modal">
                <div class="modal-content extra-large">
                    <div class="modal-header">
                        <h3 id="estimate-detail-title">Смета</h3>
                        <div class="modal-header-actions">
                            <button class="btn btn-sm btn-outline" onclick="estimatesModule.printEstimate()">
                                <i class="fas fa-print"></i> Печать
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="estimatesModule.exportEstimatePDF()">
                                <i class="fas fa-file-pdf"></i> PDF
                            </button>
                            <button class="modal-close" onclick="estimatesModule.closeDetailModal()">&times;</button>
                        </div>
                    </div>
                    <div class="modal-body estimate-detail-body">
                        <div id="estimate-detail-content">
                            <!-- Detailed estimate content will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Модальное окно шаблонов -->
            <div id="templates-modal" class="modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>Шаблоны смет</h3>
                        <button class="modal-close" onclick="estimatesModule.closeTemplatesModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="templates-toolbar">
                            <button class="btn btn-primary" onclick="estimatesModule.createTemplate()">
                                <i class="fas fa-plus"></i> Новый шаблон
                            </button>
                        </div>
                        <div id="templates-list" class="templates-list">
                            <!-- Templates will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Загрузка данных
    async loadData() {
        try {
            await Promise.all([
                this.loadEstimates(),
                this.loadProjects(),
                this.loadTemplates(),
                this.loadCategories(),
                this.loadPriceList()
            ]);
        } catch (error) {
            console.error('Error loading estimates data:', error);
            NotificationManager.error('Ошибка загрузки данных');
        }
    }

    // Загрузка списка смет
    async loadEstimates() {
        try {
            const params = new URLSearchParams({
                page: this.pagination.page,
                limit: this.pagination.limit,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder,
                ...this.filters
            });

            const response = await api.get(`/estimates?${params}`);
            
            if (response.estimates) {
                this.renderEstimates(response.estimates);
                this.updatePagination(response.pagination);
            }
        } catch (error) {
            console.error('Error loading estimates:', error);
            this.renderErrorState();
        }
    }

    // Загрузка проектов для фильтра
    async loadProjects() {
        try {
            const projects = await ProjectsAPI.getAll();
            const projectFilter = document.getElementById('projectFilter');
            const estimateProject = document.getElementById('estimate-project');
            
            const projectOptions = projects.map(project => 
                `<option value="${project.id}">${project.name}</option>`
            ).join('');
            
            if (projectFilter) {
                projectFilter.innerHTML = '<option value="all">Все проекты</option>' + projectOptions;
            }
            
            if (estimateProject) {
                estimateProject.innerHTML = '<option value="">Выберите проект</option>' + projectOptions;
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    // Загрузка шаблонов
    async loadTemplates() {
        try {
            // Пока используем демо-данные
            this.templates = [
                { id: 1, name: 'Электромонтажные работы', category: 'Электрика' },
                { id: 2, name: 'Сантехнические работы', category: 'Сантехника' },
                { id: 3, name: 'Отделочные работы', category: 'Отделка' }
            ];

            const templateSelect = document.getElementById('estimate-template');
            if (templateSelect) {
                const templateOptions = this.templates.map(template => 
                    `<option value="${template.id}">${template.name}</option>`
                ).join('');
                templateSelect.innerHTML = '<option value="">Без шаблона</option>' + templateOptions;
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    // Загрузка категорий работ
    async loadCategories() {
        try {
            // Пока используем демо-данные согласно ГОСТ
            this.categories = [
                { id: 1, name: 'Земляные работы', code: '01' },
                { id: 2, name: 'Фундаменты', code: '02' },
                { id: 3, name: 'Стены', code: '03' },
                { id: 4, name: 'Перекрытия', code: '04' },
                { id: 5, name: 'Кровли', code: '05' },
                { id: 6, name: 'Полы', code: '06' },
                { id: 7, name: 'Отделочные работы', code: '07' },
                { id: 8, name: 'Сантехнические работы', code: '08' },
                { id: 9, name: 'Электромонтажные работы', code: '09' },
                { id: 10, name: 'Слаботочные системы', code: '10' }
            ];
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Загрузка прайс-листа
    async loadPriceList() {
        try {
            const response = await api.get('/warehouse/items');
            this.priceList = response || [];
        } catch (error) {
            console.error('Error loading price list:', error);
            this.priceList = [];
        }
    }

    // Рендеринг списка смет
    renderEstimates(estimates) {
        const grid = document.getElementById('estimates-grid');
        
        if (estimates.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calculator"></i>
                    <h3>Нет смет</h3>
                    <p>Начните создавать сметы для ваших проектов</p>
                    <button class="btn btn-primary" onclick="estimatesModule.showCreateForm()">
                        <i class="fas fa-plus"></i> Создать первую смету
                    </button>
                </div>
            `;
            return;
        }

        const estimatesHtml = estimates.map(estimate => `
            <div class="estimate-card" data-id="${estimate.id}">
                <div class="card-header">
                    <div class="card-title">
                        <h4>${estimate.name}</h4>
                        <span class="estimate-type">${this.getEstimateTypeLabel(estimate.type)}</span>
                    </div>
                    <div class="card-status">
                        <span class="status-badge status-${estimate.status}">${this.getStatusLabel(estimate.status)}</span>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="estimate-info">
                        <div class="info-item">
                            <i class="fas fa-building"></i>
                            <span>${estimate.project_name || 'Без проекта'}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span>${DateUtils.formatDate(estimate.created_at)}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <span>${estimate.created_by_name || 'Неизвестно'}</span>
                        </div>
                    </div>
                    
                    <div class="estimate-amounts">
                        <div class="amount-item">
                            <span class="amount-label">Базовая стоимость:</span>
                            <span class="amount-value">${NumberUtils.formatCurrency(estimate.base_cost || 0, estimate.currency)}</span>
                        </div>
                        <div class="amount-item total">
                            <span class="amount-label">Итого:</span>
                            <span class="amount-value">${NumberUtils.formatCurrency(estimate.final_amount || 0, estimate.currency)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn btn-sm btn-outline" onclick="estimatesModule.viewEstimate(${estimate.id})">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="estimatesModule.editEstimate(${estimate.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline dropdown-toggle">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a href="#" onclick="estimatesModule.duplicateEstimate(${estimate.id})">
                                <i class="fas fa-copy"></i> Дублировать
                            </a>
                            <a href="#" onclick="estimatesModule.exportEstimatePDF(${estimate.id})">
                                <i class="fas fa-file-pdf"></i> Экспорт PDF
                            </a>
                            <a href="#" onclick="estimatesModule.exportEstimateExcel(${estimate.id})">
                                <i class="fas fa-file-excel"></i> Экспорт Excel
                            </a>
                            <hr>
                            <a href="#" class="text-danger" onclick="estimatesModule.deleteEstimate(${estimate.id})">
                                <i class="fas fa-trash"></i> Удалить
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        grid.innerHTML = estimatesHtml;
    }

    // Рендеринг состояния ошибки
    renderErrorState() {
        const grid = document.getElementById('estimates-grid');
        grid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить список смет</p>
                <button class="btn btn-primary" onclick="estimatesModule.loadEstimates()">
                    <i class="fas fa-refresh"></i> Попробовать снова
                </button>
            </div>
        `;
    }

    // Показать форму создания сметы
    showCreateForm() {
        this.currentEstimate = null;
        document.getElementById('estimate-modal-title').textContent = 'Новая смета';
        document.getElementById('estimate-form').reset();
        document.getElementById('estimate-modal').style.display = 'block';
        
        // Фокус на первое поле
        setTimeout(() => {
            document.getElementById('estimate-name').focus();
        }, 100);
    }

    // Редактирование сметы
    async editEstimate(estimateId) {
        try {
            const estimate = await EstimatesAPI.get(estimateId);
            this.currentEstimate = estimate;
            
            document.getElementById('estimate-modal-title').textContent = 'Редактирование сметы';
            document.getElementById('estimate-name').value = estimate.name || '';
            document.getElementById('estimate-project').value = estimate.project_id || '';
            document.getElementById('estimate-type').value = estimate.type || 'local';
            document.getElementById('estimate-profit').value = estimate.profit_margin || 8;
            document.getElementById('estimate-overhead').value = estimate.overhead_costs || 15;
            document.getElementById('estimate-vat').value = estimate.vat_rate || 20;
            document.getElementById('estimate-currency').value = estimate.currency || 'RUB';
            document.getElementById('estimate-description').value = estimate.description || '';
            
            document.getElementById('estimate-modal').style.display = 'block';
        } catch (error) {
            console.error('Error loading estimate:', error);
            NotificationManager.error('Ошибка загрузки сметы');
        }
    }

    // Просмотр детальной информации о смете
    async viewEstimate(estimateId) {
        try {
            const estimate = await EstimatesAPI.get(estimateId);
            const items = await EstimatesAPI.getItems(estimateId);
            
            this.renderEstimateDetail(estimate, items);
            document.getElementById('estimate-detail-modal').style.display = 'block';
        } catch (error) {
            console.error('Error loading estimate details:', error);
            NotificationManager.error('Ошибка загрузки деталей сметы');
        }
    }

    // Рендеринг детального просмотра сметы
    renderEstimateDetail(estimate, items) {
        const content = document.getElementById('estimate-detail-content');
        document.getElementById('estimate-detail-title').textContent = estimate.name;
        
        const baseCost = items.reduce((sum, item) => sum + (item.total_cost || 0), 0);
        const profitAmount = baseCost * (estimate.profit_margin / 100);
        const overheadAmount = baseCost * (estimate.overhead_costs / 100);
        const subtotal = baseCost + profitAmount + overheadAmount;
        const vatAmount = subtotal * (estimate.vat_rate / 100);
        const finalAmount = subtotal + vatAmount;
        
        content.innerHTML = `
            <div class="estimate-detail">
                <div class="estimate-header">
                    <div class="header-info">
                        <h2>${estimate.name}</h2>
                        <div class="estimate-meta">
                            <span class="meta-item">
                                <strong>Проект:</strong> ${estimate.project_name || 'Не указан'}
                            </span>
                            <span class="meta-item">
                                <strong>Тип:</strong> ${this.getEstimateTypeLabel(estimate.type)}
                            </span>
                            <span class="meta-item">
                                <strong>Статус:</strong> 
                                <span class="status-badge status-${estimate.status}">${this.getStatusLabel(estimate.status)}</span>
                            </span>
                            <span class="meta-item">
                                <strong>Создана:</strong> ${DateUtils.formatDateTime(estimate.created_at)}
                            </span>
                        </div>
                    </div>
                    <div class="estimate-summary">
                        <div class="summary-item">
                            <span class="summary-label">Итоговая сумма:</span>
                            <span class="summary-value main">${NumberUtils.formatCurrency(finalAmount, estimate.currency)}</span>
                        </div>
                    </div>
                </div>

                <div class="estimate-items">
                    <div class="items-header">
                        <h3>Позиции сметы</h3>
                        <button class="btn btn-primary" onclick="estimatesModule.addEstimateItem(${estimate.id})">
                            <i class="fas fa-plus"></i> Добавить позицию
                        </button>
                    </div>
                    
                    <div class="items-table">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>Наименование работ</th>
                                    <th>Ед. изм.</th>
                                    <th>Количество</th>
                                    <th>Цена за ед.</th>
                                    <th>Всего</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>
                                            <div class="item-name">${item.name}</div>
                                            ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                                        </td>
                                        <td>${item.unit || '-'}</td>
                                        <td>${NumberUtils.formatNumber(item.quantity)}</td>
                                        <td>${NumberUtils.formatCurrency(item.unit_price, estimate.currency)}</td>
                                        <td>${NumberUtils.formatCurrency(item.total_cost, estimate.currency)}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline" onclick="estimatesModule.editEstimateItem(${item.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline text-danger" onclick="estimatesModule.deleteEstimateItem(${item.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="estimate-calculations">
                    <div class="calculations-table">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td>Базовая стоимость работ:</td>
                                    <td class="text-right">${NumberUtils.formatCurrency(baseCost, estimate.currency)}</td>
                                </tr>
                                <tr>
                                    <td>Накладные расходы (${estimate.overhead_costs}%):</td>
                                    <td class="text-right">${NumberUtils.formatCurrency(overheadAmount, estimate.currency)}</td>
                                </tr>
                                <tr>
                                    <td>Плановая прибыль (${estimate.profit_margin}%):</td>
                                    <td class="text-right">${NumberUtils.formatCurrency(profitAmount, estimate.currency)}</td>
                                </tr>
                                <tr class="subtotal">
                                    <td><strong>Всего с НР и ПП:</strong></td>
                                    <td class="text-right"><strong>${NumberUtils.formatCurrency(subtotal, estimate.currency)}</strong></td>
                                </tr>
                                <tr>
                                    <td>НДС (${estimate.vat_rate}%):</td>
                                    <td class="text-right">${NumberUtils.formatCurrency(vatAmount, estimate.currency)}</td>
                                </tr>
                                <tr class="total">
                                    <td><strong>ИТОГО с НДС:</strong></td>
                                    <td class="text-right"><strong>${NumberUtils.formatCurrency(finalAmount, estimate.currency)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                ${estimate.description ? `
                    <div class="estimate-description">
                        <h4>Описание</h4>
                        <p>${estimate.description}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Сохранение сметы
    async saveEstimate() {
        const form = document.getElementById('estimate-form');
        const formData = new FormData(form);
        
        if (!formData.get('name') || !formData.get('project_id')) {
            NotificationManager.error('Заполните обязательные поля');
            return;
        }

        const estimateData = {
            name: formData.get('name'),
            project_id: parseInt(formData.get('project_id')),
            type: formData.get('type'),
            profit_margin: parseFloat(formData.get('profit_margin')) || 8,
            overhead_costs: parseFloat(formData.get('overhead_costs')) || 15,
            vat_rate: parseFloat(formData.get('vat_rate')) || 20,
            currency: formData.get('currency'),
            description: formData.get('description')
        };

        try {
            let result;
            if (this.currentEstimate) {
                result = await EstimatesAPI.update(this.currentEstimate.id, estimateData);
                NotificationManager.success('Смета обновлена успешно');
            } else {
                result = await ProjectsAPI.createEstimate(estimateData.project_id, estimateData);
                NotificationManager.success('Смета создана успешно');
            }
            
            this.closeModal();
            await this.loadEstimates();
            
            // Если создается новая смета, открываем ее для редактирования
            if (!this.currentEstimate && result.estimateId) {
                setTimeout(() => {
                    this.viewEstimate(result.estimateId);
                }, 500);
            }
        } catch (error) {
            console.error('Error saving estimate:', error);
            NotificationManager.error('Ошибка сохранения сметы');
        }
    }

    // Удаление сметы
    async deleteEstimate(estimateId) {
        if (!confirm('Вы уверены, что хотите удалить эту смету?')) {
            return;
        }

        try {
            await EstimatesAPI.delete(estimateId);
            NotificationManager.success('Смета удалена');
            await this.loadEstimates();
        } catch (error) {
            console.error('Error deleting estimate:', error);
            NotificationManager.error('Ошибка удаления сметы');
        }
    }

    // Дублирование сметы
    async duplicateEstimate(estimateId) {
        try {
            const estimate = await EstimatesAPI.get(estimateId);
            const items = await EstimatesAPI.getItems(estimateId);
            
            // Создаем копию сметы
            const duplicateData = {
                ...estimate,
                name: `${estimate.name} (копия)`,
                status: 'draft'
            };
            delete duplicateData.id;
            delete duplicateData.created_at;
            delete duplicateData.updated_at;
            
            const result = await ProjectsAPI.createEstimate(estimate.project_id, duplicateData);
            
            // Копируем позиции
            for (const item of items) {
                const itemData = { ...item };
                delete itemData.id;
                delete itemData.estimate_id;
                await EstimatesAPI.addItem(result.estimateId, itemData);
            }
            
            NotificationManager.success('Смета скопирована');
            await this.loadEstimates();
        } catch (error) {
            console.error('Error duplicating estimate:', error);
            NotificationManager.error('Ошибка копирования сметы');
        }
    }

    // Экспорт в PDF
    async exportEstimatePDF(estimateId) {
        try {
            await EstimatesAPI.exportPDF(estimateId);
            NotificationManager.success('PDF файл сохранен');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            NotificationManager.error('Ошибка экспорта в PDF');
        }
    }

    // Получить подпись статуса
    getStatusLabel(status) {
        const labels = {
            'draft': 'Черновик',
            'in_progress': 'В работе',
            'approved': 'Утверждена',
            'rejected': 'Отклонена'
        };
        return labels[status] || status;
    }

    // Получить подпись типа сметы
    getEstimateTypeLabel(type) {
        const labels = {
            'local': 'Локальная',
            'object': 'Объектная', 
            'summary': 'Сводная'
        };
        return labels[type] || type;
    }

    // Применение фильтров
    async applyFilters() {
        this.filters = {
            status: document.getElementById('statusFilter').value,
            project: document.getElementById('projectFilter').value,
            dateFrom: document.getElementById('dateFromFilter').value,
            dateTo: document.getElementById('dateToFilter').value,
            search: document.getElementById('searchFilter').value
        };
        
        this.pagination.page = 1;
        await this.loadEstimates();
    }

    // Обработка поиска
    handleSearch(event) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    // Обновление пагинации
    updatePagination(pagination) {
        this.pagination = pagination;
        
        const info = document.getElementById('pagination-info');
        const controls = document.getElementById('pagination-controls');
        
        const start = (pagination.page - 1) * pagination.limit + 1;
        const end = Math.min(pagination.page * pagination.limit, pagination.total);
        
        info.textContent = `Показано ${start}-${end} из ${pagination.total}`;
        
        // Генерация кнопок пагинации
        const totalPages = Math.ceil(pagination.total / pagination.limit);
        let paginationHtml = '';
        
        if (totalPages > 1) {
            paginationHtml += `
                <button class="btn btn-sm btn-outline" ${pagination.page === 1 ? 'disabled' : ''} 
                        onclick="estimatesModule.goToPage(${pagination.page - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
            
            for (let i = Math.max(1, pagination.page - 2); i <= Math.min(totalPages, pagination.page + 2); i++) {
                paginationHtml += `
                    <button class="btn btn-sm ${i === pagination.page ? 'btn-primary' : 'btn-outline'}" 
                            onclick="estimatesModule.goToPage(${i})">
                        ${i}
                    </button>
                `;
            }
            
            paginationHtml += `
                <button class="btn btn-sm btn-outline" ${pagination.page === totalPages ? 'disabled' : ''} 
                        onclick="estimatesModule.goToPage(${pagination.page + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        controls.innerHTML = paginationHtml;
    }

    // Переход на страницу
    async goToPage(page) {
        this.pagination.page = page;
        await this.loadEstimates();
    }

    // Смена представления
    setView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        // TODO: Implement table view
    }

    // Показать шаблоны
    showTemplates() {
        this.renderTemplates();
        document.getElementById('templates-modal').style.display = 'block';
    }

    // Рендеринг шаблонов
    renderTemplates() {
        const list = document.getElementById('templates-list');
        
        if (this.templates.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h4>Нет шаблонов</h4>
                    <p>Создайте шаблоны для быстрого составления смет</p>
                </div>
            `;
            return;
        }
        
        const templatesHtml = this.templates.map(template => `
            <div class="template-item">
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <span class="template-category">${template.category}</span>
                </div>
                <div class="template-actions">
                    <button class="btn btn-sm btn-outline" onclick="estimatesModule.editTemplate(${template.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="estimatesModule.useTemplate(${template.id})">
                        <i class="fas fa-plus"></i> Использовать
                    </button>
                </div>
            </div>
        `).join('');
        
        list.innerHTML = templatesHtml;
    }

    // Закрытие модальных окон
    closeModal() {
        document.getElementById('estimate-modal').style.display = 'none';
    }

    closeDetailModal() {
        document.getElementById('estimate-detail-modal').style.display = 'none';
    }

    closeTemplatesModal() {
        document.getElementById('templates-modal').style.display = 'none';
    }

    // Привязка событий
    bindEvents() {
        // Закрытие модальных окон по клику вне области
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Обработка Enter в форме поиска
        document.getElementById('searchFilter').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyFilters();
            }
        });
    }

    // Экспорт данных
    async exportData() {
        try {
            // TODO: Implement export functionality
            NotificationManager.info('Функция экспорта в разработке');
        } catch (error) {
            console.error('Error exporting data:', error);
            NotificationManager.error('Ошибка экспорта');
        }
    }

    // Печать сметы
    printEstimate() {
        window.print();
    }
}

// Создание глобального экземпляра модуля
const estimatesModule = new EstimatesModule();

// Экспорт для использования в других модулях
window.EstimatesModule = EstimatesModule;
window.estimatesModule = estimatesModule;