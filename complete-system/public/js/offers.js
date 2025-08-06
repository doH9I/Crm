// Offers module for Construction CRM
// Полнофункциональный модуль коммерческих предложений

class OffersModule {
    constructor() {
        this.container = null;
        this.offers = [];
        this.currentOffer = null;
        this.filters = {
            status: '',
            type: '',
            client: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 20,
            total: 0
        };
    }

    // Initialize offers module
    async init() {
        console.log('📄 Initializing Offers module...');
        this.container = document.getElementById('content-area');
        await this.render();
        await this.loadOffers();
        this.initEventListeners();
    }

    // Render offers layout
    async render() {
        this.container.innerHTML = `
            <div class="offers-module">
                <!-- Header with actions -->
                <div class="module-header">
                    <div class="header-left">
                        <h2 class="module-title">
                            <i class="fas fa-file-contract"></i>
                            Коммерческие предложения
                        </h2>
                        <p class="module-description">Создание и управление коммерческими предложениями</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" onclick="offersModule.exportOffers()">
                            <i class="fas fa-download"></i>
                            Экспорт
                        </button>
                        <button class="btn btn-primary" onclick="offersModule.showCreateOfferModal()">
                            <i class="fas fa-plus"></i>
                            Новое предложение
                        </button>
                    </div>
                </div>

                <!-- Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-offers">0</div>
                            <div class="stat-label">Всего предложений</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="pending-offers">0</div>
                            <div class="stat-label">В ожидании</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="accepted-offers">0</div>
                            <div class="stat-label">Принятые</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-ruble-sign"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-value">0 ₽</div>
                            <div class="stat-label">Общая сумма</div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="card filters-panel">
                    <div class="card-body">
                        <div class="filters-row">
                            <div class="filter-group">
                                <label>Поиск</label>
                                <div class="search-box">
                                    <input type="text" id="offers-search" placeholder="Поиск предложений...">
                                    <i class="fas fa-search"></i>
                                </div>
                            </div>
                            <div class="filter-group">
                                <label>Статус</label>
                                <select id="offers-status-filter">
                                    <option value="">Все статусы</option>
                                    <option value="draft">Черновик</option>
                                    <option value="sent">Отправлено</option>
                                    <option value="viewed">Просмотрено</option>
                                    <option value="accepted">Принято</option>
                                    <option value="rejected">Отклонено</option>
                                    <option value="expired">Истекло</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Тип</label>
                                <select id="offers-type-filter">
                                    <option value="">Все типы</option>
                                    <option value="construction">Строительство</option>
                                    <option value="renovation">Ремонт</option>
                                    <option value="design">Проектирование</option>
                                    <option value="consultation">Консультация</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <button class="btn btn-secondary" onclick="offersModule.resetFilters()">
                                    <i class="fas fa-times"></i>
                                    Сбросить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Offers List -->
                <div class="card">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table" id="offers-table">
                                <thead>
                                    <tr>
                                        <th>№</th>
                                        <th>Клиент</th>
                                        <th>Тип</th>
                                        <th>Сумма</th>
                                        <th>Статус</th>
                                        <th>Срок действия</th>
                                        <th>Создано</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody id="offers-tbody">
                                    <tr>
                                        <td colspan="8" class="text-center p-4">
                                            <div class="spinner"></div>
                                            <p class="mt-2">Загрузка предложений...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-container" id="offers-pagination">
                    <!-- Pagination will be rendered here -->
                </div>
            </div>

            <!-- Create Offer Modal -->
            <div id="create-offer-modal" class="modal-overlay">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3>Создать коммерческое предложение</h3>
                        <button class="modal-close" onclick="offersModule.closeCreateModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="create-offer-form">
                            <div class="form-grid cols-2">
                                <div class="form-group">
                                    <label for="offer-title">Название предложения *</label>
                                    <input type="text" id="offer-title" name="title" required>
                                </div>
                                <div class="form-group">
                                    <label for="offer-client">Клиент *</label>
                                    <select id="offer-client" name="clientId" required>
                                        <option value="">Выберите клиента</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="offer-type">Тип работ *</label>
                                    <select id="offer-type" name="type" required>
                                        <option value="">Выберите тип</option>
                                        <option value="construction">Строительство</option>
                                        <option value="renovation">Ремонт</option>
                                        <option value="design">Проектирование</option>
                                        <option value="consultation">Консультация</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="offer-amount">Сумма предложения</label>
                                    <input type="number" id="offer-amount" name="amount" step="0.01" min="0">
                                </div>
                                <div class="form-group">
                                    <label for="offer-valid-until">Действительно до</label>
                                    <input type="date" id="offer-valid-until" name="validUntil">
                                </div>
                                <div class="form-group">
                                    <label for="offer-delivery-time">Срок выполнения (дней)</label>
                                    <input type="number" id="offer-delivery-time" name="deliveryTime" min="1">
                                </div>
                                <div class="form-group">
                                    <label for="offer-payment-terms">Условия оплаты</label>
                                    <select id="offer-payment-terms" name="paymentTerms">
                                        <option value="prepayment_100">100% предоплата</option>
                                        <option value="prepayment_50">50% предоплата, 50% по завершении</option>
                                        <option value="prepayment_30">30% предоплата, 70% по завершении</option>
                                        <option value="after_completion">Оплата по завершении</option>
                                        <option value="monthly">Ежемесячные платежи</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="offer-warranty">Гарантия (месяцев)</label>
                                    <input type="number" id="offer-warranty" name="warranty" min="0" value="12">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="offer-description">Описание работ *</label>
                                <textarea id="offer-description" name="description" rows="4" required 
                                         placeholder="Подробное описание предлагаемых работ..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="offer-terms">Условия и требования</label>
                                <textarea id="offer-terms" name="terms" rows="3" 
                                         placeholder="Дополнительные условия, требования к материалам, график работ..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="offersModule.closeCreateModal()">
                            Отмена
                        </button>
                        <button type="submit" class="btn btn-primary" form="create-offer-form">
                            <i class="fas fa-save"></i>
                            Создать предложение
                        </button>
                    </div>
                </div>
            </div>

            <!-- View Offer Modal -->
            <div id="view-offer-modal" class="modal-overlay">
                <div class="modal modal-xl">
                    <div class="modal-header">
                        <h3 id="view-offer-title">Коммерческое предложение</h3>
                        <button class="modal-close" onclick="offersModule.closeViewModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div id="offer-details">
                            <!-- Offer details will be loaded here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="offersModule.closeViewModal()">
                            Закрыть
                        </button>
                        <button type="button" class="btn btn-primary" onclick="offersModule.editCurrentOffer()">
                            <i class="fas fa-edit"></i>
                            Редактировать
                        </button>
                        <button type="button" class="btn btn-success" onclick="offersModule.sendOffer()">
                            <i class="fas fa-paper-plane"></i>
                            Отправить клиенту
                        </button>
                        <button type="button" class="btn btn-info" onclick="offersModule.exportOfferPDF()">
                            <i class="fas fa-file-pdf"></i>
                            Скачать PDF
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Load offers from API
    async loadOffers() {
        try {
            // Mock offers data
            const mockOffers = [
                {
                    id: 1,
                    number: 'КП-2024-001',
                    title: 'Строительство загородного дома',
                    client_name: 'Иванов И.И.',
                    type: 'construction',
                    amount: 3500000,
                    status: 'sent',
                    valid_until: '2024-03-15',
                    delivery_time: 120,
                    payment_terms: 'prepayment_30',
                    warranty: 24,
                    description: 'Строительство двухэтажного загородного дома площадью 180 м²',
                    terms: 'Материалы согласно спецификации, все работы выполняются согласно СНиП',
                    created_at: '2024-01-15',
                    sent_at: '2024-01-16'
                },
                {
                    id: 2,
                    number: 'КП-2024-002',
                    title: 'Ремонт офисного помещения',
                    client_name: 'ООО "Бизнес-Центр"',
                    type: 'renovation',
                    amount: 850000,
                    status: 'accepted',
                    valid_until: '2024-02-28',
                    delivery_time: 45,
                    payment_terms: 'prepayment_50',
                    warranty: 12,
                    description: 'Капитальный ремонт офисного помещения 120 м²',
                    terms: 'Работы выполняются в нерабочее время',
                    created_at: '2024-01-10',
                    sent_at: '2024-01-11',
                    accepted_at: '2024-01-18'
                },
                {
                    id: 3,
                    number: 'КП-2024-003',
                    title: 'Проектирование торгового центра',
                    client_name: 'ООО "Ритейл Девелопмент"',
                    type: 'design',
                    amount: 1200000,
                    status: 'viewed',
                    valid_until: '2024-04-01',
                    delivery_time: 90,
                    payment_terms: 'prepayment_50',
                    warranty: 0,
                    description: 'Разработка архитектурного проекта торгового центра',
                    terms: 'Включает все разделы проектной документации',
                    created_at: '2024-01-08',
                    sent_at: '2024-01-09',
                    viewed_at: '2024-01-12'
                }
            ];

            this.offers = mockOffers;
            this.pagination.total = mockOffers.length;

            this.renderOffersTable();
            this.renderPagination();
            this.updateStatistics();

        } catch (error) {
            console.error('Error loading offers:', error);
            showNotification('Ошибка загрузки предложений', 'error');
        }
    }

    // Render offers table
    renderOffersTable() {
        const tbody = document.getElementById('offers-tbody');
        
        if (this.offers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center p-4">
                        <div class="empty-state">
                            <i class="fas fa-file-contract fa-3x text-muted mb-3"></i>
                            <h4>Нет коммерческих предложений</h4>
                            <p class="text-muted">Создайте первое предложение для клиента</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.offers.map(offer => `
            <tr>
                <td>
                    <div class="offer-number">
                        <strong>${offer.number}</strong>
                        <div class="offer-title">${offer.title}</div>
                    </div>
                </td>
                <td>${offer.client_name}</td>
                <td>
                    <span class="badge badge-${this.getTypeBadgeClass(offer.type)}">
                        ${this.getTypeText(offer.type)}
                    </span>
                </td>
                <td>
                    <div class="amount-display">
                        ${NumberUtils.formatCurrency(offer.amount)}
                    </div>
                </td>
                <td>
                    <span class="badge badge-${this.getStatusBadgeClass(offer.status)}">
                        ${this.getStatusText(offer.status)}
                    </span>
                </td>
                <td>
                    <div class="date-display ${this.isExpiringSoon(offer.valid_until) ? 'text-warning' : ''}">
                        ${DateUtils.format(offer.valid_until)}
                        ${this.isExpired(offer.valid_until) ? '<br><small class="text-danger">Истекло</small>' : ''}
                    </div>
                </td>
                <td>${DateUtils.format(offer.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="offersModule.viewOffer(${offer.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="offersModule.editOffer(${offer.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="offersModule.exportOfferPDF(${offer.id})" title="PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="offersModule.duplicateOffer(${offer.id})" title="Дублировать">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="offersModule.deleteOffer(${offer.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update statistics
    updateStatistics() {
        const totalOffers = this.offers.length;
        const pendingOffers = this.offers.filter(o => ['draft', 'sent', 'viewed'].includes(o.status)).length;
        const acceptedOffers = this.offers.filter(o => o.status === 'accepted').length;
        const totalValue = this.offers.reduce((sum, offer) => sum + (offer.amount || 0), 0);

        document.getElementById('total-offers').textContent = totalOffers;
        document.getElementById('pending-offers').textContent = pendingOffers;
        document.getElementById('accepted-offers').textContent = acceptedOffers;
        document.getElementById('total-value').textContent = NumberUtils.formatCurrency(totalValue);
    }

    // Initialize event listeners
    initEventListeners() {
        // Search
        const searchInput = document.getElementById('offers-search');
        searchInput?.addEventListener('input', debounce((e) => {
            this.filters.search = e.target.value;
            this.pagination.page = 1;
            this.loadOffers();
        }, 300));

        // Status filter
        const statusFilter = document.getElementById('offers-status-filter');
        statusFilter?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.pagination.page = 1;
            this.loadOffers();
        });

        // Type filter
        const typeFilter = document.getElementById('offers-type-filter');
        typeFilter?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.pagination.page = 1;
            this.loadOffers();
        });

        // Create form
        const createForm = document.getElementById('create-offer-form');
        createForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateOffer();
        });
    }

    // Show create offer modal
    async showCreateOfferModal() {
        await this.loadClientsForSelect();
        
        // Set default valid until date (30 days from now)
        const validUntilInput = document.getElementById('offer-valid-until');
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        validUntilInput.value = futureDate.toISOString().split('T')[0];

        document.getElementById('create-offer-modal').classList.add('show');
    }

    // Close create modal
    closeCreateModal() {
        document.getElementById('create-offer-modal').classList.remove('show');
        document.getElementById('create-offer-form').reset();
    }

    // Load clients for select
    async loadClientsForSelect() {
        try {
            // Mock clients data
            const mockClients = [
                { id: 1, name: 'Иванов И.И.' },
                { id: 2, name: 'ООО "Бизнес-Центр"' },
                { id: 3, name: 'ООО "Ритейл Девелопмент"' },
                { id: 4, name: 'Петров П.П.' }
            ];

            const clientSelect = document.getElementById('offer-client');
            clientSelect.innerHTML = '<option value="">Выберите клиента</option>';
            
            mockClients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = client.name;
                clientSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error loading clients:', error);
        }
    }

    // Handle create offer
    async handleCreateOffer() {
        try {
            const formData = new FormData(document.getElementById('create-offer-form'));
            const offerData = Object.fromEntries(formData.entries());

            // Generate offer number
            const offerNumber = `КП-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;

            const newOffer = {
                id: Date.now(),
                number: offerNumber,
                title: offerData.title,
                client_name: 'Новый клиент',
                type: offerData.type,
                amount: parseFloat(offerData.amount) || 0,
                status: 'draft',
                valid_until: offerData.validUntil,
                delivery_time: parseInt(offerData.deliveryTime) || 0,
                payment_terms: offerData.paymentTerms,
                warranty: parseInt(offerData.warranty) || 0,
                description: offerData.description,
                terms: offerData.terms,
                created_at: new Date().toISOString().split('T')[0]
            };

            this.offers.unshift(newOffer);
            this.renderOffersTable();
            this.updateStatistics();

            showNotification('Коммерческое предложение создано успешно', 'success');
            this.closeCreateModal();

        } catch (error) {
            console.error('Error creating offer:', error);
            showNotification('Ошибка создания предложения', 'error');
        }
    }

    // View offer
    viewOffer(id) {
        const offer = this.offers.find(o => o.id === id);
        if (!offer) return;

        this.currentOffer = offer;
        document.getElementById('view-offer-title').textContent = `${offer.number} - ${offer.title}`;
        
        const detailsContainer = document.getElementById('offer-details');
        detailsContainer.innerHTML = `
            <div class="offer-preview">
                <div class="offer-header">
                    <div class="company-info">
                        <h3>ООО "СтройМонтаж"</h3>
                        <p>г. Москва, ул. Строительная, д. 1</p>
                        <p>Тел: +7 (495) 123-45-67</p>
                        <p>Email: info@construction-crm.local</p>
                    </div>
                    <div class="offer-info">
                        <h3>Коммерческое предложение ${offer.number}</h3>
                        <p>от ${DateUtils.format(offer.created_at)}</p>
                        <p>для: ${offer.client_name}</p>
                    </div>
                </div>

                <div class="offer-content">
                    <div class="offer-section">
                        <h4>Предмет предложения</h4>
                        <p><strong>${offer.title}</strong></p>
                        <p>${offer.description}</p>
                    </div>

                    <div class="offer-section">
                        <h4>Коммерческие условия</h4>
                        <div class="conditions-grid">
                            <div class="condition-item">
                                <label>Стоимость работ:</label>
                                <span class="amount">${NumberUtils.formatCurrency(offer.amount)}</span>
                            </div>
                            <div class="condition-item">
                                <label>Срок выполнения:</label>
                                <span>${offer.delivery_time} дней</span>
                            </div>
                            <div class="condition-item">
                                <label>Условия оплаты:</label>
                                <span>${this.getPaymentTermsText(offer.payment_terms)}</span>
                            </div>
                            <div class="condition-item">
                                <label>Гарантия:</label>
                                <span>${offer.warranty} месяцев</span>
                            </div>
                            <div class="condition-item">
                                <label>Действительно до:</label>
                                <span class="${this.isExpired(offer.valid_until) ? 'text-danger' : ''}">${DateUtils.format(offer.valid_until)}</span>
                            </div>
                        </div>
                    </div>

                    ${offer.terms ? `
                        <div class="offer-section">
                            <h4>Дополнительные условия</h4>
                            <p>${offer.terms}</p>
                        </div>
                    ` : ''}

                    <div class="offer-section">
                        <h4>Статус предложения</h4>
                        <span class="badge badge-${this.getStatusBadgeClass(offer.status)} badge-lg">
                            ${this.getStatusText(offer.status)}
                        </span>
                        ${offer.sent_at ? `<p class="mt-2">Отправлено: ${DateUtils.format(offer.sent_at)}</p>` : ''}
                        ${offer.viewed_at ? `<p>Просмотрено: ${DateUtils.format(offer.viewed_at)}</p>` : ''}
                        ${offer.accepted_at ? `<p>Принято: ${DateUtils.format(offer.accepted_at)}</p>` : ''}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('view-offer-modal').classList.add('show');
    }

    // Close view modal
    closeViewModal() {
        document.getElementById('view-offer-modal').classList.remove('show');
        this.currentOffer = null;
    }

    // Edit offer
    editOffer(id) {
        showNotification('Функционал редактирования будет добавлен в следующей версии', 'info');
    }

    // Send offer
    sendOffer() {
        if (!this.currentOffer) return;
        
        // Update offer status
        this.currentOffer.status = 'sent';
        this.currentOffer.sent_at = new Date().toISOString().split('T')[0];
        
        this.renderOffersTable();
        this.updateStatistics();
        this.closeViewModal();
        
        showNotification('Предложение отправлено клиенту', 'success');
    }

    // Export offer to PDF
    exportOfferPDF(id) {
        showNotification('Экспорт в PDF будет реализован в следующей версии', 'info');
    }

    // Duplicate offer
    duplicateOffer(id) {
        const offer = this.offers.find(o => o.id === id);
        if (!offer) return;

        const duplicatedOffer = {
            ...offer,
            id: Date.now(),
            number: `КП-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
            status: 'draft',
            created_at: new Date().toISOString().split('T')[0],
            sent_at: null,
            viewed_at: null,
            accepted_at: null
        };

        this.offers.unshift(duplicatedOffer);
        this.renderOffersTable();
        this.updateStatistics();

        showNotification('Предложение дублировано', 'success');
    }

    // Delete offer
    async deleteOffer(id) {
        if (!confirm('Вы уверены, что хотите удалить это предложение?')) return;

        try {
            this.offers = this.offers.filter(o => o.id !== id);
            this.renderOffersTable();
            this.updateStatistics();
            showNotification('Предложение удалено успешно', 'success');
        } catch (error) {
            console.error('Error deleting offer:', error);
            showNotification('Ошибка удаления предложения', 'error');
        }
    }

    // Export all offers
    exportOffers() {
        showNotification('Экспорт предложений будет реализован в следующей версии', 'info');
    }

    // Reset filters
    resetFilters() {
        this.filters = {
            status: '',
            type: '',
            client: '',
            search: ''
        };
        
        document.getElementById('offers-search').value = '';
        document.getElementById('offers-status-filter').value = '';
        document.getElementById('offers-type-filter').value = '';
        
        this.pagination.page = 1;
        this.loadOffers();
    }

    // Render pagination
    renderPagination() {
        const container = document.getElementById('offers-pagination');
        const totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination">';
        
        if (this.pagination.page > 1) {
            paginationHTML += `<button class="btn btn-sm btn-outline" onclick="offersModule.goToPage(${this.pagination.page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === this.pagination.page ? 'active' : '';
            paginationHTML += `<button class="btn btn-sm btn-outline ${isActive}" onclick="offersModule.goToPage(${i})">${i}</button>`;
        }

        if (this.pagination.page < totalPages) {
            paginationHTML += `<button class="btn btn-sm btn-outline" onclick="offersModule.goToPage(${this.pagination.page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>`;
        }

        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }

    // Go to page
    goToPage(page) {
        this.pagination.page = page;
        this.loadOffers();
    }

    // Helper methods
    getStatusText(status) {
        const statusMap = {
            draft: 'Черновик',
            sent: 'Отправлено',
            viewed: 'Просмотрено',
            accepted: 'Принято',
            rejected: 'Отклонено',
            expired: 'Истекло'
        };
        return statusMap[status] || status;
    }

    getStatusBadgeClass(status) {
        const classMap = {
            draft: 'secondary',
            sent: 'info',
            viewed: 'warning',
            accepted: 'success',
            rejected: 'danger',
            expired: 'dark'
        };
        return classMap[status] || 'secondary';
    }

    getTypeText(type) {
        const typeMap = {
            construction: 'Строительство',
            renovation: 'Ремонт',
            design: 'Проектирование',
            consultation: 'Консультация'
        };
        return typeMap[type] || type;
    }

    getTypeBadgeClass(type) {
        const classMap = {
            construction: 'primary',
            renovation: 'info',
            design: 'success',
            consultation: 'warning'
        };
        return classMap[type] || 'secondary';
    }

    getPaymentTermsText(terms) {
        const termsMap = {
            prepayment_100: '100% предоплата',
            prepayment_50: '50% предоплата, 50% по завершении',
            prepayment_30: '30% предоплата, 70% по завершении',
            after_completion: 'Оплата по завершении',
            monthly: 'Ежемесячные платежи'
        };
        return termsMap[terms] || terms;
    }

    isExpired(date) {
        return new Date(date) < new Date();
    }

    isExpiringSoon(date) {
        const now = new Date();
        const expiry = new Date(date);
        const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }

    // Show/hide module
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.loadOffers();
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}

// Create global instance
const offersModule = new OffersModule();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OffersModule;
}