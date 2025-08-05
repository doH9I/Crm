// Модуль коммерческих предложений для Construction CRM

class OffersModule {
    constructor() {
        this.currentOffer = null;
        this.offers = [];
        this.templates = [];
        this.clients = [];
        this.projects = [];
        this.filters = {
            status: 'all',
            client: 'all',
            template: 'all',
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
            <div class="offers-module">
                <div class="module-header">
                    <div class="header-title">
                        <h1><i class="fas fa-handshake"></i> Коммерческие предложения</h1>
                        <p>Создание и управление коммерческими предложениями</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" onclick="offersModule.showTemplates()">
                            <i class="fas fa-file-alt"></i> Шаблоны
                        </button>
                        <button class="btn btn-outline" onclick="offersModule.showStats()">
                            <i class="fas fa-chart-line"></i> Статистика
                        </button>
                        <button class="btn btn-primary" onclick="offersModule.showCreateForm()">
                            <i class="fas fa-plus"></i> Новое КП
                        </button>
                    </div>
                </div>

                <div class="module-toolbar">
                    <div class="toolbar-filters">
                        <div class="filter-group">
                            <select id="statusFilter" onchange="offersModule.applyFilters()">
                                <option value="all">Все статусы</option>
                                <option value="draft">Черновик</option>
                                <option value="sent">Отправлено</option>
                                <option value="viewed">Просмотрено</option>
                                <option value="accepted">Принято</option>
                                <option value="rejected">Отклонено</option>
                                <option value="expired">Истекло</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <select id="clientFilter" onchange="offersModule.applyFilters()">
                                <option value="all">Все клиенты</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <select id="templateFilter" onchange="offersModule.applyFilters()">
                                <option value="all">Все шаблоны</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <input type="date" id="dateFromFilter" onchange="offersModule.applyFilters()" placeholder="От">
                        </div>
                        <div class="filter-group">
                            <input type="date" id="dateToFilter" onchange="offersModule.applyFilters()" placeholder="До">
                        </div>
                        <div class="filter-group search-group">
                            <input type="text" id="searchFilter" placeholder="Поиск КП..." onkeyup="offersModule.handleSearch(event)">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                    <div class="toolbar-actions">
                        <div class="view-toggle">
                            <button class="view-btn active" data-view="grid" onclick="offersModule.setView('grid')">
                                <i class="fas fa-th-large"></i>
                            </button>
                            <button class="view-btn" data-view="table" onclick="offersModule.setView('table')">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        <button class="btn btn-outline" onclick="offersModule.exportData()">
                            <i class="fas fa-download"></i> Экспорт
                        </button>
                    </div>
                </div>

                <div class="offers-content">
                    <div id="offers-grid" class="offers-grid">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Загрузка коммерческих предложений...</p>
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

            <!-- Модальное окно создания/редактирования КП -->
            <div id="offer-modal" class="modal">
                <div class="modal-content extra-large">
                    <div class="modal-header">
                        <h3 id="offer-modal-title">Новое коммерческое предложение</h3>
                        <button class="modal-close" onclick="offersModule.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="offer-tabs">
                            <button class="tab-btn active" data-tab="general" onclick="offersModule.switchOfferTab('general')">
                                Общие данные
                            </button>
                            <button class="tab-btn" data-tab="content" onclick="offersModule.switchOfferTab('content')">
                                Содержание
                            </button>
                            <button class="tab-btn" data-tab="preview" onclick="offersModule.switchOfferTab('preview')">
                                Предварительный просмотр
                            </button>
                        </div>

                        <div id="general-tab" class="tab-content active">
                            <form id="offer-form" class="offer-form">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="offer-title">Название КП *</label>
                                        <input type="text" id="offer-title" name="title" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="offer-client">Клиент *</label>
                                        <select id="offer-client" name="client_id" required onchange="offersModule.onClientChange()">
                                            <option value="">Выберите клиента</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="offer-project">Проект</label>
                                        <select id="offer-project" name="project_id">
                                            <option value="">Выберите проект</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="offer-template">Шаблон</label>
                                        <select id="offer-template" name="template_id" onchange="offersModule.onTemplateChange()">
                                            <option value="">Выберите шаблон</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="offer-valid-until">Действительно до</label>
                                        <input type="date" id="offer-valid-until" name="valid_until">
                                    </div>
                                    <div class="form-group">
                                        <label for="offer-currency">Валюта</label>
                                        <select id="offer-currency" name="currency">
                                            <option value="RUB">₽ Рубли</option>
                                            <option value="USD">$ Доллары</option>
                                            <option value="EUR">€ Евро</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="offer-discount">Скидка (%)</label>
                                        <input type="number" id="offer-discount" name="discount" min="0" max="100" step="0.1" value="0">
                                    </div>
                                    <div class="form-group">
                                        <label for="offer-payment-terms">Условия оплаты</label>
                                        <select id="offer-payment-terms" name="payment_terms">
                                            <option value="prepayment_100">100% предоплата</option>
                                            <option value="prepayment_50">50% предоплата, 50% по готовности</option>
                                            <option value="prepayment_30">30% предоплата, 70% по готовности</option>
                                            <option value="post_payment">Оплата после выполнения</option>
                                            <option value="custom">Индивидуальные условия</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="offer-description">Описание предложения</label>
                                    <textarea id="offer-description" name="description" rows="4"></textarea>
                                </div>
                            </form>
                        </div>

                        <div id="content-tab" class="tab-content">
                            <div class="content-editor">
                                <div class="editor-toolbar">
                                    <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.addSection('text')">
                                        <i class="fas fa-text-height"></i> Текст
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.addSection('list')">
                                        <i class="fas fa-list"></i> Список работ
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.addSection('table')">
                                        <i class="fas fa-table"></i> Таблица
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.addSection('image')">
                                        <i class="fas fa-image"></i> Изображение
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.importFromEstimate()">
                                        <i class="fas fa-file-import"></i> Из сметы
                                    </button>
                                </div>
                                <div id="content-sections" class="content-sections">
                                    <!-- Dynamic content sections will be added here -->
                                </div>
                            </div>
                        </div>

                        <div id="preview-tab" class="tab-content">
                            <div class="preview-toolbar">
                                <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.refreshPreview()">
                                    <i class="fas fa-sync"></i> Обновить
                                </button>
                                <button type="button" class="btn btn-sm btn-primary" onclick="offersModule.generatePDF()">
                                    <i class="fas fa-file-pdf"></i> Создать PDF
                                </button>
                            </div>
                            <div id="offer-preview" class="offer-preview">
                                <!-- Preview will be generated here -->
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" onclick="offersModule.closeModal()">Отмена</button>
                        <button type="button" class="btn btn-secondary" onclick="offersModule.saveDraft()">Сохранить черновик</button>
                        <button type="button" class="btn btn-primary" onclick="offersModule.saveAndSend()">Сохранить и отправить</button>
                    </div>
                </div>
            </div>

            <!-- Модальное окно шаблонов -->
            <div id="templates-modal" class="modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>Шаблоны коммерческих предложений</h3>
                        <button class="modal-close" onclick="offersModule.closeTemplatesModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="templates-toolbar">
                            <button class="btn btn-primary" onclick="offersModule.createTemplate()">
                                <i class="fas fa-plus"></i> Новый шаблон
                            </button>
                        </div>
                        <div id="templates-list" class="templates-list">
                            <!-- Templates will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Модальное окно отправки -->
            <div id="send-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Отправка коммерческого предложения</h3>
                        <button class="modal-close" onclick="offersModule.closeSendModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="send-form">
                            <div class="form-group">
                                <label for="send-email">Email получателя *</label>
                                <input type="email" id="send-email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="send-subject">Тема письма</label>
                                <input type="text" id="send-subject" name="subject" value="Коммерческое предложение">
                            </div>
                            <div class="form-group">
                                <label for="send-message">Сопроводительное письмо</label>
                                <textarea id="send-message" name="message" rows="6" placeholder="Добавьте персональное сообщение..."></textarea>
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="send_copy" checked>
                                    <span class="checkmark"></span>
                                    Отправить копию на мой email
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" onclick="offersModule.closeSendModal()">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="offersModule.confirmSend()">
                            <i class="fas fa-paper-plane"></i> Отправить
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Загрузка данных
    async loadData() {
        try {
            await Promise.all([
                this.loadOffers(),
                this.loadClients(),
                this.loadProjects(),
                this.loadTemplates()
            ]);
        } catch (error) {
            console.error('Error loading offers data:', error);
            NotificationManager.error('Ошибка загрузки данных');
        }
    }

    // Загрузка списка КП
    async loadOffers() {
        try {
            // Демо данные для КП
            this.offers = [
                {
                    id: 1,
                    title: 'Строительство коттеджа',
                    client_name: 'ООО "Стройинвест"',
                    project_name: 'Дом на Пушкина, 15',
                    status: 'sent',
                    total_amount: 2500000,
                    currency: 'RUB',
                    valid_until: '2024-02-15',
                    created_at: '2024-01-15',
                    sent_at: '2024-01-16',
                    views_count: 3
                },
                {
                    id: 2,
                    title: 'Отделочные работы офиса',
                    client_name: 'ИП Петров А.В.',
                    project_name: null,
                    status: 'accepted',
                    total_amount: 850000,
                    currency: 'RUB',
                    valid_until: '2024-01-30',
                    created_at: '2024-01-10',
                    sent_at: '2024-01-12',
                    accepted_at: '2024-01-14',
                    views_count: 5
                }
            ];

            this.renderOffers(this.offers);
            this.updatePagination({ page: 1, limit: 20, total: this.offers.length });
        } catch (error) {
            console.error('Error loading offers:', error);
            this.renderErrorState();
        }
    }

    // Загрузка клиентов
    async loadClients() {
        try {
            const clients = await ClientsAPI.getAll();
            this.clients = clients;
            this.updateClientSelectors();
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    }

    // Загрузка проектов
    async loadProjects() {
        try {
            const projects = await ProjectsAPI.getAll();
            this.projects = projects;
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    // Загрузка шаблонов
    async loadTemplates() {
        try {
            // Демо данные для шаблонов
            this.templates = [
                {
                    id: 1,
                    name: 'Строительные работы',
                    description: 'Стандартный шаблон для строительных работ',
                    category: 'Строительство'
                },
                {
                    id: 2,
                    name: 'Отделочные работы',
                    description: 'Шаблон для отделочных работ',
                    category: 'Отделка'
                },
                {
                    id: 3,
                    name: 'Проектирование',
                    description: 'Шаблон для проектных работ',
                    category: 'Проектирование'
                }
            ];

            this.updateTemplateSelectors();
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    // Обновление селекторов клиентов
    updateClientSelectors() {
        const clientFilter = document.getElementById('clientFilter');
        const offerClient = document.getElementById('offer-client');
        
        const clientOptions = this.clients.map(client => 
            `<option value="${client.id}">${client.name}</option>`
        ).join('');
        
        if (clientFilter) {
            clientFilter.innerHTML = '<option value="all">Все клиенты</option>' + clientOptions;
        }
        
        if (offerClient) {
            offerClient.innerHTML = '<option value="">Выберите клиента</option>' + clientOptions;
        }
    }

    // Обновление селекторов шаблонов
    updateTemplateSelectors() {
        const templateFilter = document.getElementById('templateFilter');
        const offerTemplate = document.getElementById('offer-template');
        
        const templateOptions = this.templates.map(template => 
            `<option value="${template.id}">${template.name}</option>`
        ).join('');
        
        if (templateFilter) {
            templateFilter.innerHTML = '<option value="all">Все шаблоны</option>' + templateOptions;
        }
        
        if (offerTemplate) {
            offerTemplate.innerHTML = '<option value="">Выберите шаблон</option>' + templateOptions;
        }
    }

    // Рендеринг списка КП
    renderOffers(offers) {
        const grid = document.getElementById('offers-grid');
        
        if (offers.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-handshake"></i>
                    <h3>Нет коммерческих предложений</h3>
                    <p>Создайте первое коммерческое предложение для клиентов</p>
                    <button class="btn btn-primary" onclick="offersModule.showCreateForm()">
                        <i class="fas fa-plus"></i> Создать КП
                    </button>
                </div>
            `;
            return;
        }

        const offersHtml = offers.map(offer => `
            <div class="offer-card" data-id="${offer.id}">
                <div class="card-header">
                    <div class="card-title">
                        <h4>${offer.title}</h4>
                        <span class="offer-number">#КП-${String(offer.id).padStart(4, '0')}</span>
                    </div>
                    <div class="card-status">
                        <span class="status-badge status-${offer.status}">${this.getStatusLabel(offer.status)}</span>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="offer-info">
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <span>${offer.client_name}</span>
                        </div>
                        ${offer.project_name ? `
                            <div class="info-item">
                                <i class="fas fa-building"></i>
                                <span>${offer.project_name}</span>
                            </div>
                        ` : ''}
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span>Создано: ${DateUtils.formatDate(offer.created_at)}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>До: ${DateUtils.formatDate(offer.valid_until)}</span>
                        </div>
                    </div>
                    
                    <div class="offer-amount">
                        <div class="amount-value">${NumberUtils.formatCurrency(offer.total_amount, offer.currency)}</div>
                        ${offer.status === 'sent' ? `
                            <div class="offer-stats">
                                <span class="stat-item">
                                    <i class="fas fa-eye"></i> ${offer.views_count || 0}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn btn-sm btn-outline" onclick="offersModule.viewOffer(${offer.id})">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="offersModule.editOffer(${offer.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline dropdown-toggle">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a href="#" onclick="offersModule.duplicateOffer(${offer.id})">
                                <i class="fas fa-copy"></i> Дублировать
                            </a>
                            ${offer.status === 'draft' ? `
                                <a href="#" onclick="offersModule.sendOffer(${offer.id})">
                                    <i class="fas fa-paper-plane"></i> Отправить
                                </a>
                            ` : ''}
                            <a href="#" onclick="offersModule.generatePDF(${offer.id})">
                                <i class="fas fa-file-pdf"></i> Скачать PDF
                            </a>
                            <hr>
                            <a href="#" class="text-danger" onclick="offersModule.deleteOffer(${offer.id})">
                                <i class="fas fa-trash"></i> Удалить
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        grid.innerHTML = offersHtml;
    }

    // Рендеринг состояния ошибки
    renderErrorState() {
        const grid = document.getElementById('offers-grid');
        grid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить список коммерческих предложений</p>
                <button class="btn btn-primary" onclick="offersModule.loadOffers()">
                    <i class="fas fa-refresh"></i> Попробовать снова
                </button>
            </div>
        `;
    }

    // Показать форму создания КП
    showCreateForm() {
        this.currentOffer = null;
        document.getElementById('offer-modal-title').textContent = 'Новое коммерческое предложение';
        document.getElementById('offer-form').reset();
        
        // Установка даты действия (30 дней от сегодня)
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);
        document.getElementById('offer-valid-until').value = validUntil.toISOString().split('T')[0];
        
        document.getElementById('offer-modal').style.display = 'block';
        this.switchOfferTab('general');
        
        setTimeout(() => {
            document.getElementById('offer-title').focus();
        }, 100);
    }

    // Переключение вкладок в форме КП
    switchOfferTab(tabName) {
        // Обновляем активную вкладку
        document.querySelectorAll('.offer-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Показываем соответствующий контент
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Обновляем предварительный просмотр при переходе на вкладку
        if (tabName === 'preview') {
            this.refreshPreview();
        }
    }

    // Изменение клиента
    onClientChange() {
        const clientId = document.getElementById('offer-client').value;
        const projectSelect = document.getElementById('offer-project');
        
        if (clientId) {
            // Фильтрация проектов по клиенту
            const clientProjects = this.projects.filter(project => project.client_id == clientId);
            const projectOptions = clientProjects.map(project => 
                `<option value="${project.id}">${project.name}</option>`
            ).join('');
            projectSelect.innerHTML = '<option value="">Выберите проект</option>' + projectOptions;
            
            // Автозаполнение email из данных клиента
            const client = this.clients.find(c => c.id == clientId);
            if (client && client.email) {
                const sendEmail = document.getElementById('send-email');
                if (sendEmail) {
                    sendEmail.value = client.email;
                }
            }
        } else {
            projectSelect.innerHTML = '<option value="">Выберите проект</option>';
        }
    }

    // Изменение шаблона
    onTemplateChange() {
        const templateId = document.getElementById('offer-template').value;
        if (templateId) {
            this.loadTemplateContent(templateId);
        }
    }

    // Загрузка содержимого шаблона
    async loadTemplateContent(templateId) {
        try {
            // Загружаем контент шаблона
            // В реальном проекте здесь будет API запрос
            const template = this.templates.find(t => t.id == templateId);
            if (template) {
                // Очищаем текущие секции
                document.getElementById('content-sections').innerHTML = '';
                
                // Добавляем стандартные секции шаблона
                this.addSection('text', 'Уважаемые коллеги!\n\nРады представить вам наше коммерческое предложение.');
                this.addSection('list');
                this.addSection('text', 'Мы гарантируем высокое качество работ и соблюдение сроков.');
                
                NotificationManager.success(`Шаблон "${template.name}" загружен`);
            }
        } catch (error) {
            console.error('Error loading template content:', error);
            NotificationManager.error('Ошибка загрузки шаблона');
        }
    }

    // Добавление секции контента
    addSection(type, defaultContent = '') {
        const sectionsContainer = document.getElementById('content-sections');
        const sectionId = Date.now();
        
        let sectionHtml = '';
        
        switch (type) {
            case 'text':
                sectionHtml = `
                    <div class="content-section" data-id="${sectionId}" data-type="text">
                        <div class="section-header">
                            <span class="section-title">Текстовый блок</span>
                            <div class="section-actions">
                                <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.moveSection(${sectionId}, 'up')">
                                    <i class="fas fa-arrow-up"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.moveSection(${sectionId}, 'down')">
                                    <i class="fas fa-arrow-down"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline text-danger" onclick="offersModule.removeSection(${sectionId})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="section-content">
                            <textarea class="section-text" rows="4" placeholder="Введите текст...">${defaultContent}</textarea>
                        </div>
                    </div>
                `;
                break;
                
            case 'list':
                sectionHtml = `
                    <div class="content-section" data-id="${sectionId}" data-type="list">
                        <div class="section-header">
                            <span class="section-title">Список работ</span>
                            <div class="section-actions">
                                <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.addListItem(${sectionId})">
                                    <i class="fas fa-plus"></i> Добавить
                                </button>
                                <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.moveSection(${sectionId}, 'up')">
                                    <i class="fas fa-arrow-up"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.moveSection(${sectionId}, 'down')">
                                    <i class="fas fa-arrow-down"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline text-danger" onclick="offersModule.removeSection(${sectionId})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="section-content">
                            <div class="work-items">
                                <div class="work-item">
                                    <input type="text" placeholder="Наименование работ" class="work-name">
                                    <input type="text" placeholder="Ед. изм." class="work-unit" value="м²">
                                    <input type="number" placeholder="Количество" class="work-quantity" step="0.01">
                                    <input type="number" placeholder="Цена" class="work-price" step="0.01">
                                    <button type="button" class="btn btn-sm btn-outline text-danger" onclick="this.parentElement.remove()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'table':
                sectionHtml = `
                    <div class="content-section" data-id="${sectionId}" data-type="table">
                        <div class="section-header">
                            <span class="section-title">Таблица</span>
                            <div class="section-actions">
                                <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.moveSection(${sectionId}, 'up')">
                                    <i class="fas fa-arrow-up"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.moveSection(${sectionId}, 'down')">
                                    <i class="fas fa-arrow-down"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline text-danger" onclick="offersModule.removeSection(${sectionId})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="section-content">
                            <table class="section-table">
                                <thead>
                                    <tr>
                                        <th>Заголовок 1</th>
                                        <th>Заголовок 2</th>
                                        <th>Заголовок 3</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td contenteditable="true">Ячейка 1</td>
                                        <td contenteditable="true">Ячейка 2</td>
                                        <td contenteditable="true">Ячейка 3</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                break;
                
            case 'image':
                sectionHtml = `
                    <div class="content-section" data-id="${sectionId}" data-type="image">
                        <div class="section-header">
                            <span class="section-title">Изображение</span>
                            <div class="section-actions">
                                <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.moveSection(${sectionId}, 'up')">
                                    <i class="fas fa-arrow-up"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline" onclick="offersModule.moveSection(${sectionId}, 'down')">
                                    <i class="fas fa-arrow-down"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline text-danger" onclick="offersModule.removeSection(${sectionId})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="section-content">
                            <input type="file" accept="image/*" class="section-image-input">
                            <div class="image-preview"></div>
                        </div>
                    </div>
                `;
                break;
        }
        
        sectionsContainer.insertAdjacentHTML('beforeend', sectionHtml);
    }

    // Добавление элемента в список работ
    addListItem(sectionId) {
        const section = document.querySelector(`[data-id="${sectionId}"] .work-items`);
        const itemHtml = `
            <div class="work-item">
                <input type="text" placeholder="Наименование работ" class="work-name">
                <input type="text" placeholder="Ед. изм." class="work-unit" value="м²">
                <input type="number" placeholder="Количество" class="work-quantity" step="0.01">
                <input type="number" placeholder="Цена" class="work-price" step="0.01">
                <button type="button" class="btn btn-sm btn-outline text-danger" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        section.insertAdjacentHTML('beforeend', itemHtml);
    }

    // Перемещение секции
    moveSection(sectionId, direction) {
        const section = document.querySelector(`[data-id="${sectionId}"]`);
        const container = section.parentElement;
        
        if (direction === 'up' && section.previousElementSibling) {
            container.insertBefore(section, section.previousElementSibling);
        } else if (direction === 'down' && section.nextElementSibling) {
            container.insertBefore(section.nextElementSibling, section);
        }
    }

    // Удаление секции
    removeSection(sectionId) {
        if (confirm('Удалить эту секцию?')) {
            const section = document.querySelector(`[data-id="${sectionId}"]`);
            section.remove();
        }
    }

    // Импорт из сметы
    async importFromEstimate() {
        try {
            // Получаем проект из формы
            const projectId = document.getElementById('offer-project').value;
            if (!projectId) {
                NotificationManager.warning('Сначала выберите проект');
                return;
            }

            // Загружаем сметы проекта
            const estimates = await ProjectsAPI.getEstimates(projectId);
            
            if (estimates.length === 0) {
                NotificationManager.info('У проекта нет смет');
                return;
            }

            // Показываем выбор сметы
            const estimateId = estimates[0].id; // Берем первую смету для примера
            const estimateItems = await EstimatesAPI.getItems(estimateId);
            
            // Добавляем секцию с данными из сметы
            this.addSection('list');
            
            // Заполняем работы из сметы
            const lastSection = document.querySelector('.content-section:last-child .work-items');
            lastSection.innerHTML = estimateItems.map(item => `
                <div class="work-item">
                    <input type="text" value="${item.name}" class="work-name">
                    <input type="text" value="${item.unit || 'шт'}" class="work-unit">
                    <input type="number" value="${item.quantity}" class="work-quantity" step="0.01">
                    <input type="number" value="${item.unit_price}" class="work-price" step="0.01">
                    <button type="button" class="btn btn-sm btn-outline text-danger" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
            
            NotificationManager.success('Данные из сметы импортированы');
            
        } catch (error) {
            console.error('Error importing from estimate:', error);
            NotificationManager.error('Ошибка импорта из сметы');
        }
    }

    // Обновление предварительного просмотра
    refreshPreview() {
        const formData = new FormData(document.getElementById('offer-form'));
        const sections = document.querySelectorAll('.content-section');
        
        let previewHtml = `
            <div class="offer-document">
                <div class="document-header">
                    <h1>КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</h1>
                    <div class="offer-number">#КП-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}</div>
                    <div class="offer-date">от ${DateUtils.formatDate(new Date())}</div>
                </div>
                
                <div class="document-info">
                    <h2>${formData.get('title') || 'Название предложения'}</h2>
                    ${formData.get('description') ? `<p>${formData.get('description')}</p>` : ''}
                </div>
                
                <div class="document-content">
        `;
        
        sections.forEach(section => {
            const type = section.dataset.type;
            
            switch (type) {
                case 'text':
                    const text = section.querySelector('.section-text').value;
                    if (text) {
                        previewHtml += `<div class="text-section">${text.replace(/\n/g, '<br>')}</div>`;
                    }
                    break;
                    
                case 'list':
                    const items = section.querySelectorAll('.work-item');
                    if (items.length > 0) {
                        previewHtml += `
                            <table class="work-table">
                                <thead>
                                    <tr>
                                        <th>№</th>
                                        <th>Наименование работ</th>
                                        <th>Ед. изм.</th>
                                        <th>Количество</th>
                                        <th>Цена за ед.</th>
                                        <th>Сумма</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;
                        
                        let total = 0;
                        items.forEach((item, index) => {
                            const name = item.querySelector('.work-name').value;
                            const unit = item.querySelector('.work-unit').value;
                            const quantity = parseFloat(item.querySelector('.work-quantity').value) || 0;
                            const price = parseFloat(item.querySelector('.work-price').value) || 0;
                            const sum = quantity * price;
                            total += sum;
                            
                            if (name) {
                                previewHtml += `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${name}</td>
                                        <td>${unit}</td>
                                        <td>${NumberUtils.formatNumber(quantity)}</td>
                                        <td>${NumberUtils.formatCurrency(price)}</td>
                                        <td>${NumberUtils.formatCurrency(sum)}</td>
                                    </tr>
                                `;
                            }
                        });
                        
                        const discount = parseFloat(formData.get('discount')) || 0;
                        const discountAmount = total * (discount / 100);
                        const finalTotal = total - discountAmount;
                        
                        previewHtml += `
                                </tbody>
                                <tfoot>
                                    <tr class="total-row">
                                        <td colspan="5"><strong>Итого:</strong></td>
                                        <td><strong>${NumberUtils.formatCurrency(total)}</strong></td>
                                    </tr>
                        `;
                        
                        if (discount > 0) {
                            previewHtml += `
                                    <tr>
                                        <td colspan="5">Скидка (${discount}%):</td>
                                        <td>-${NumberUtils.formatCurrency(discountAmount)}</td>
                                    </tr>
                                    <tr class="final-total">
                                        <td colspan="5"><strong>К оплате:</strong></td>
                                        <td><strong>${NumberUtils.formatCurrency(finalTotal)}</strong></td>
                                    </tr>
                            `;
                        }
                        
                        previewHtml += `
                                </tfoot>
                            </table>
                        `;
                    }
                    break;
            }
        });
        
        const paymentTerms = formData.get('payment_terms');
        const validUntil = formData.get('valid_until');
        
        previewHtml += `
                </div>
                
                <div class="document-footer">
                    ${paymentTerms ? `<p><strong>Условия оплаты:</strong> ${this.getPaymentTermsLabel(paymentTerms)}</p>` : ''}
                    ${validUntil ? `<p><strong>Предложение действительно до:</strong> ${DateUtils.formatDate(validUntil)}</p>` : ''}
                    
                    <div class="company-info">
                        <p>С уважением,<br>Команда Construction CRM</p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('offer-preview').innerHTML = previewHtml;
    }

    // Получить подпись условий оплаты
    getPaymentTermsLabel(terms) {
        const labels = {
            'prepayment_100': '100% предоплата',
            'prepayment_50': '50% предоплата, 50% по готовности',
            'prepayment_30': '30% предоплата, 70% по готовности',
            'post_payment': 'Оплата после выполнения',
            'custom': 'Индивидуальные условия'
        };
        return labels[terms] || terms;
    }

    // Получить подпись статуса
    getStatusLabel(status) {
        const labels = {
            'draft': 'Черновик',
            'sent': 'Отправлено',
            'viewed': 'Просмотрено',
            'accepted': 'Принято',
            'rejected': 'Отклонено',
            'expired': 'Истекло'
        };
        return labels[status] || status;
    }

    // Сохранение черновика
    async saveDraft() {
        try {
            const offerData = this.collectOfferData();
            offerData.status = 'draft';
            
            if (this.currentOffer) {
                await api.put(`/offers/${this.currentOffer.id}`, offerData);
                NotificationManager.success('Черновик обновлен');
            } else {
                const result = await api.post('/offers', offerData);
                this.currentOffer = { id: result.offerId };
                NotificationManager.success('Черновик сохранен');
            }
            
        } catch (error) {
            console.error('Error saving draft:', error);
            NotificationManager.error('Ошибка сохранения черновика');
        }
    }

    // Сохранение и отправка
    async saveAndSend() {
        try {
            const offerData = this.collectOfferData();
            
            if (!offerData.title || !offerData.client_id) {
                NotificationManager.error('Заполните обязательные поля');
                return;
            }
            
            if (this.currentOffer) {
                await api.put(`/offers/${this.currentOffer.id}`, offerData);
            } else {
                const result = await api.post('/offers', offerData);
                this.currentOffer = { id: result.offerId };
            }
            
            this.showSendModal();
            
        } catch (error) {
            console.error('Error saving offer:', error);
            NotificationManager.error('Ошибка сохранения КП');
        }
    }

    // Сбор данных формы КП
    collectOfferData() {
        const formData = new FormData(document.getElementById('offer-form'));
        const sections = Array.from(document.querySelectorAll('.content-section')).map(section => {
            const type = section.dataset.type;
            
            switch (type) {
                case 'text':
                    return {
                        type: 'text',
                        content: section.querySelector('.section-text').value
                    };
                case 'list':
                    const items = Array.from(section.querySelectorAll('.work-item')).map(item => ({
                        name: item.querySelector('.work-name').value,
                        unit: item.querySelector('.work-unit').value,
                        quantity: parseFloat(item.querySelector('.work-quantity').value) || 0,
                        price: parseFloat(item.querySelector('.work-price').value) || 0
                    })).filter(item => item.name);
                    
                    return {
                        type: 'list',
                        items: items
                    };
                default:
                    return { type: type };
            }
        });
        
        return {
            title: formData.get('title'),
            client_id: parseInt(formData.get('client_id')),
            project_id: parseInt(formData.get('project_id')) || null,
            template_id: parseInt(formData.get('template_id')) || null,
            valid_until: formData.get('valid_until'),
            currency: formData.get('currency'),
            discount: parseFloat(formData.get('discount')) || 0,
            payment_terms: formData.get('payment_terms'),
            description: formData.get('description'),
            content: sections
        };
    }

    // Показать модальное окно отправки
    showSendModal() {
        const clientId = document.getElementById('offer-client').value;
        const client = this.clients.find(c => c.id == clientId);
        
        if (client && client.email) {
            document.getElementById('send-email').value = client.email;
        }
        
        const title = document.getElementById('offer-title').value;
        document.getElementById('send-subject').value = `Коммерческое предложение: ${title}`;
        
        document.getElementById('send-modal').style.display = 'block';
    }

    // Подтверждение отправки
    async confirmSend() {
        const form = document.getElementById('send-form');
        const formData = new FormData(form);
        
        if (!formData.get('email')) {
            NotificationManager.error('Укажите email получателя');
            return;
        }
        
        try {
            const sendData = {
                offer_id: this.currentOffer.id,
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                send_copy: formData.get('send_copy') === 'on'
            };
            
            await api.post('/offers/send', sendData);
            
            NotificationManager.success('Коммерческое предложение отправлено');
            this.closeSendModal();
            this.closeModal();
            await this.loadOffers();
            
        } catch (error) {
            console.error('Error sending offer:', error);
            NotificationManager.error('Ошибка отправки КП');
        }
    }

    // Генерация PDF
    async generatePDF(offerId = null) {
        try {
            const id = offerId || this.currentOffer?.id;
            if (!id) {
                NotificationManager.error('Сначала сохраните КП');
                return;
            }
            
            await api.download(`/offers/${id}/pdf`, `offer_${id}.pdf`);
            NotificationManager.success('PDF файл сохранен');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            NotificationManager.error('Ошибка создания PDF');
        }
    }

    // Применение фильтров
    async applyFilters() {
        this.filters = {
            status: document.getElementById('statusFilter').value,
            client: document.getElementById('clientFilter').value,
            template: document.getElementById('templateFilter').value,
            dateFrom: document.getElementById('dateFromFilter').value,
            dateTo: document.getElementById('dateToFilter').value,
            search: document.getElementById('searchFilter').value
        };
        
        this.pagination.page = 1;
        await this.loadOffers();
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
        
        // Генерация кнопок пагинации (аналогично другим модулям)
        controls.innerHTML = '';
    }

    // Закрытие модальных окон
    closeModal() {
        document.getElementById('offer-modal').style.display = 'none';
    }

    closeSendModal() {
        document.getElementById('send-modal').style.display = 'none';
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
    }

    // Методы-заглушки для будущей реализации
    async viewOffer(offerId) {
        NotificationManager.info('Функция просмотра КП в разработке');
    }

    async editOffer(offerId) {
        NotificationManager.info('Функция редактирования КП в разработке');
    }

    async duplicateOffer(offerId) {
        NotificationManager.info('Функция дублирования КП в разработке');
    }

    async deleteOffer(offerId) {
        if (confirm('Вы уверены, что хотите удалить это КП?')) {
            NotificationManager.info('Функция удаления КП в разработке');
        }
    }

    async sendOffer(offerId) {
        NotificationManager.info('Функция отправки КП в разработке');
    }

    showTemplates() {
        NotificationManager.info('Управление шаблонами КП в разработке');
    }

    showStats() {
        NotificationManager.info('Статистика КП в разработке');
    }

    createTemplate() {
        NotificationManager.info('Создание шаблона КП в разработке');
    }

    setView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
    }

    async exportData() {
        NotificationManager.info('Функция экспорта в разработке');
    }
}

// Создание глобального экземпляра модуля
const offersModule = new OffersModule();

// Экспорт для использования в других модулях
window.OffersModule = OffersModule;
window.offersModule = offersModule;