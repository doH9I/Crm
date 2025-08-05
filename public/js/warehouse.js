// Модуль складского учета для Construction CRM

class WarehouseModule {
    constructor() {
        this.currentItem = null;
        this.currentMovement = null;
        this.items = [];
        this.categories = [];
        this.warehouses = [];
        this.movements = [];
        this.currentView = 'items';
        this.filters = {
            category: 'all',
            warehouse: 'all',
            status: 'all',
            search: '',
            lowStock: false
        };
        this.pagination = {
            page: 1,
            limit: 20,
            total: 0
        };
        this.sortBy = 'name';
        this.sortOrder = 'ASC';
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
            <div class="warehouse-module">
                <div class="module-header">
                    <div class="header-title">
                        <h1><i class="fas fa-warehouse"></i> Складской учет</h1>
                        <p>Управление материалами и оборудованием</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" onclick="warehouseModule.showInventoryReport()">
                            <i class="fas fa-chart-bar"></i> Отчет
                        </button>
                        <button class="btn btn-outline" onclick="warehouseModule.showMovementForm()">
                            <i class="fas fa-exchange-alt"></i> Движение
                        </button>
                        <button class="btn btn-primary" onclick="warehouseModule.showItemForm()">
                            <i class="fas fa-plus"></i> Новая позиция
                        </button>
                    </div>
                </div>

                <div class="module-tabs">
                    <button class="tab-btn active" data-tab="items" onclick="warehouseModule.switchTab('items')">
                        <i class="fas fa-boxes"></i> Номенклатура
                    </button>
                    <button class="tab-btn" data-tab="movements" onclick="warehouseModule.switchTab('movements')">
                        <i class="fas fa-exchange-alt"></i> Движения
                    </button>
                    <button class="tab-btn" data-tab="reports" onclick="warehouseModule.switchTab('reports')">
                        <i class="fas fa-chart-line"></i> Аналитика
                    </button>
                    <button class="tab-btn" data-tab="categories" onclick="warehouseModule.switchTab('categories')">
                        <i class="fas fa-tags"></i> Категории
                    </button>
                </div>

                <div class="module-toolbar">
                    <div class="toolbar-filters">
                        <div class="filter-group">
                            <select id="categoryFilter" onchange="warehouseModule.applyFilters()">
                                <option value="all">Все категории</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <select id="warehouseFilter" onchange="warehouseModule.applyFilters()">
                                <option value="all">Все склады</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <select id="statusFilter" onchange="warehouseModule.applyFilters()">
                                <option value="all">Все статусы</option>
                                <option value="in_stock">В наличии</option>
                                <option value="low_stock">Мало остатков</option>
                                <option value="out_of_stock">Нет в наличии</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="lowStockFilter" onchange="warehouseModule.applyFilters()">
                                <span class="checkmark"></span>
                                Низкие остатки
                            </label>
                        </div>
                        <div class="filter-group search-group">
                            <input type="text" id="searchFilter" placeholder="Поиск товаров..." onkeyup="warehouseModule.handleSearch(event)">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                    <div class="toolbar-actions">
                        <div class="view-toggle">
                            <button class="view-btn active" data-view="grid" onclick="warehouseModule.setView('grid')">
                                <i class="fas fa-th-large"></i>
                            </button>
                            <button class="view-btn" data-view="table" onclick="warehouseModule.setView('table')">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        <button class="btn btn-outline" onclick="warehouseModule.exportData()">
                            <i class="fas fa-download"></i> Экспорт
                        </button>
                    </div>
                </div>

                <div class="warehouse-content">
                    <div id="items-tab" class="tab-content active">
                        <div id="warehouse-grid" class="warehouse-grid">
                            <div class="loading-placeholder">
                                <div class="spinner"></div>
                                <p>Загрузка товаров...</p>
                            </div>
                        </div>
                    </div>

                    <div id="movements-tab" class="tab-content">
                        <div id="movements-list" class="movements-list">
                            <!-- Movements will be loaded here -->
                        </div>
                    </div>

                    <div id="reports-tab" class="tab-content">
                        <div class="reports-grid">
                            <div class="report-card">
                                <h3>Оборачиваемость</h3>
                                <div id="turnover-chart" class="chart-container"></div>
                            </div>
                            <div class="report-card">
                                <h3>Остатки по категориям</h3>
                                <div id="category-chart" class="chart-container"></div>
                            </div>
                            <div class="report-card">
                                <h3>Движения по складам</h3>
                                <div id="warehouse-chart" class="chart-container"></div>
                            </div>
                        </div>
                    </div>

                    <div id="categories-tab" class="tab-content">
                        <div class="categories-toolbar">
                            <button class="btn btn-primary" onclick="warehouseModule.showCategoryForm()">
                                <i class="fas fa-plus"></i> Новая категория
                            </button>
                        </div>
                        <div id="categories-list" class="categories-list">
                            <!-- Categories will be loaded here -->
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

            <!-- Модальное окно товарной позиции -->
            <div id="item-modal" class="modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3 id="item-modal-title">Новая позиция</h3>
                        <button class="modal-close" onclick="warehouseModule.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="item-form" class="item-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="item-name">Наименование *</label>
                                    <input type="text" id="item-name" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="item-code">Артикул</label>
                                    <input type="text" id="item-code" name="code">
                                </div>
                                <div class="form-group">
                                    <label for="item-category">Категория</label>
                                    <select id="item-category" name="category_id">
                                        <option value="">Выберите категорию</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="item-unit">Единица измерения</label>
                                    <select id="item-unit" name="unit">
                                        <option value="шт">шт</option>
                                        <option value="м">м</option>
                                        <option value="м²">м²</option>
                                        <option value="м³">м³</option>
                                        <option value="кг">кг</option>
                                        <option value="т">т</option>
                                        <option value="л">л</option>
                                        <option value="упак">упак</option>
                                        <option value="комплект">комплект</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="item-price">Цена за единицу</label>
                                    <input type="number" id="item-price" name="unit_price" step="0.01" min="0">
                                </div>
                                <div class="form-group">
                                    <label for="item-min-stock">Минимальный остаток</label>
                                    <input type="number" id="item-min-stock" name="min_stock_level" min="0">
                                </div>
                                <div class="form-group">
                                    <label for="item-warehouse">Склад</label>
                                    <select id="item-warehouse" name="warehouse_id">
                                        <option value="">Выберите склад</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="item-location">Место хранения</label>
                                    <input type="text" id="item-location" name="location" placeholder="Стеллаж, полка и т.д.">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="item-description">Описание</label>
                                <textarea id="item-description" name="description" rows="3"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="item-photo">Фото товара</label>
                                <input type="file" id="item-photo" name="photo" accept="image/*">
                                <div id="photo-preview" class="photo-preview"></div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" onclick="warehouseModule.closeModal()">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="warehouseModule.saveItem()">Сохранить</button>
                    </div>
                </div>
            </div>

            <!-- Модальное окно движения товара -->
            <div id="movement-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="movement-modal-title">Движение товара</h3>
                        <button class="modal-close" onclick="warehouseModule.closeMovementModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="movement-form" class="movement-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="movement-type">Тип операции *</label>
                                    <select id="movement-type" name="type" required onchange="warehouseModule.onMovementTypeChange()">
                                        <option value="">Выберите тип</option>
                                        <option value="receipt">Приход</option>
                                        <option value="consumption">Расход</option>
                                        <option value="transfer">Перемещение</option>
                                        <option value="write_off">Списание</option>
                                        <option value="inventory">Инвентаризация</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="movement-item">Товар *</label>
                                    <select id="movement-item" name="item_id" required>
                                        <option value="">Выберите товар</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="movement-quantity">Количество *</label>
                                    <input type="number" id="movement-quantity" name="quantity" required min="0" step="0.01">
                                </div>
                                <div class="form-group">
                                    <label for="movement-warehouse">Склад *</label>
                                    <select id="movement-warehouse" name="warehouse_id" required>
                                        <option value="">Выберите склад</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="movement-date">Дата операции</label>
                                    <input type="datetime-local" id="movement-date" name="movement_date">
                                </div>
                                <div class="form-group">
                                    <label for="movement-project">Проект</label>
                                    <select id="movement-project" name="project_id">
                                        <option value="">Выберите проект</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="movement-unit-cost">Цена за единицу</label>
                                    <input type="number" id="movement-unit-cost" name="unit_cost" step="0.01" min="0">
                                </div>
                                <div class="form-group">
                                    <label for="movement-supplier">Поставщик</label>
                                    <select id="movement-supplier" name="supplier_id">
                                        <option value="">Выберите поставщика</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="movement-notes">Примечание</label>
                                <textarea id="movement-notes" name="notes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" onclick="warehouseModule.closeMovementModal()">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="warehouseModule.saveMovement()">Сохранить</button>
                    </div>
                </div>
            </div>

            <!-- Модальное окно категории -->
            <div id="category-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="category-modal-title">Новая категория</h3>
                        <button class="modal-close" onclick="warehouseModule.closeCategoryModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="category-form" class="category-form">
                            <div class="form-group">
                                <label for="category-name">Название категории *</label>
                                <input type="text" id="category-name" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="category-parent">Родительская категория</label>
                                <select id="category-parent" name="parent_id">
                                    <option value="">Корневая категория</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="category-description">Описание</label>
                                <textarea id="category-description" name="description" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" onclick="warehouseModule.closeCategoryModal()">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="warehouseModule.saveCategory()">Сохранить</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Загрузка данных
    async loadData() {
        try {
            await Promise.all([
                this.loadItems(),
                this.loadCategories(),
                this.loadWarehouses(),
                this.loadMovements()
            ]);
        } catch (error) {
            console.error('Error loading warehouse data:', error);
            NotificationManager.error('Ошибка загрузки данных');
        }
    }

    // Загрузка товарных позиций
    async loadItems() {
        try {
            const params = new URLSearchParams({
                page: this.pagination.page,
                limit: this.pagination.limit,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder,
                ...this.filters
            });

            const response = await api.get(`/warehouse/items?${params}`);
            
            if (response.items) {
                this.items = response.items;
                this.renderItems(response.items);
                this.updatePagination(response.pagination);
            } else {
                // Демо данные если API не готов
                this.loadDemoItems();
            }
        } catch (error) {
            console.error('Error loading items:', error);
            this.loadDemoItems();
        }
    }

    // Демо данные для товаров
    loadDemoItems() {
        this.items = [
            {
                id: 1,
                name: 'Кирпич керамический',
                code: 'KIRP-001',
                category_name: 'Стеновые материалы',
                unit: 'шт',
                unit_price: 25.50,
                current_stock: 1500,
                min_stock_level: 100,
                warehouse_name: 'Основной склад',
                location: 'Стеллаж А-1',
                status: 'in_stock'
            },
            {
                id: 2,
                name: 'Цемент М400',
                code: 'CEM-400',
                category_name: 'Вяжущие материалы',
                unit: 'т',
                unit_price: 4500.00,
                current_stock: 15,
                min_stock_level: 5,
                warehouse_name: 'Основной склад',
                location: 'Площадка Б',
                status: 'in_stock'
            },
            {
                id: 3,
                name: 'Арматура d12',
                code: 'ARM-12',
                category_name: 'Металлопрокат',
                unit: 'м',
                unit_price: 89.50,
                current_stock: 25,
                min_stock_level: 50,
                warehouse_name: 'Основной склад',
                location: 'Площадка В',
                status: 'low_stock'
            }
        ];
        
        this.renderItems(this.items);
        this.updatePagination({ page: 1, limit: 20, total: this.items.length });
    }

    // Рендеринг товарных позиций
    renderItems(items) {
        const grid = document.getElementById('warehouse-grid');
        
        if (items.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-boxes"></i>
                    <h3>Нет товаров</h3>
                    <p>Начните добавлять товарные позиции на склад</p>
                    <button class="btn btn-primary" onclick="warehouseModule.showItemForm()">
                        <i class="fas fa-plus"></i> Добавить первый товар
                    </button>
                </div>
            `;
            return;
        }

        const itemsHtml = items.map(item => `
            <div class="warehouse-card" data-id="${item.id}">
                <div class="card-header">
                    <div class="card-title">
                        <h4>${item.name}</h4>
                        ${item.code ? `<span class="item-code">${item.code}</span>` : ''}
                    </div>
                    <div class="card-status">
                        <span class="status-badge status-${item.status}">${this.getStatusLabel(item.status)}</span>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="item-info">
                        <div class="info-item">
                            <i class="fas fa-tag"></i>
                            <span>${item.category_name || 'Без категории'}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-warehouse"></i>
                            <span>${item.warehouse_name || 'Не указан'}</span>
                        </div>
                        ${item.location ? `
                            <div class="info-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${item.location}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="item-stock">
                        <div class="stock-info">
                            <div class="stock-item">
                                <span class="stock-label">В наличии:</span>
                                <span class="stock-value ${item.current_stock <= item.min_stock_level ? 'low-stock' : ''}">${NumberUtils.formatNumber(item.current_stock)} ${item.unit}</span>
                            </div>
                            <div class="stock-item">
                                <span class="stock-label">Мин. остаток:</span>
                                <span class="stock-value">${NumberUtils.formatNumber(item.min_stock_level)} ${item.unit}</span>
                            </div>
                        </div>
                        
                        <div class="stock-chart">
                            <div class="stock-bar">
                                <div class="stock-fill" style="width: ${Math.min(100, (item.current_stock / (item.min_stock_level * 2)) * 100)}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="item-price">
                        <span class="price-label">Цена:</span>
                        <span class="price-value">${NumberUtils.formatCurrency(item.unit_price)} / ${item.unit}</span>
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn btn-sm btn-outline" onclick="warehouseModule.viewItem(${item.id})">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="warehouseModule.editItem(${item.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline dropdown-toggle">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a href="#" onclick="warehouseModule.moveItem(${item.id})">
                                <i class="fas fa-exchange-alt"></i> Движение
                            </a>
                            <a href="#" onclick="warehouseModule.inventoryItem(${item.id})">
                                <i class="fas fa-clipboard-list"></i> Инвентаризация
                            </a>
                            <hr>
                            <a href="#" class="text-danger" onclick="warehouseModule.deleteItem(${item.id})">
                                <i class="fas fa-trash"></i> Удалить
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        grid.innerHTML = itemsHtml;
    }

    // Загрузка категорий
    async loadCategories() {
        try {
            // Демо данные для категорий
            this.categories = [
                { id: 1, name: 'Стеновые материалы', parent_id: null },
                { id: 2, name: 'Вяжущие материалы', parent_id: null },
                { id: 3, name: 'Металлопрокат', parent_id: null },
                { id: 4, name: 'Кровельные материалы', parent_id: null },
                { id: 5, name: 'Отделочные материалы', parent_id: null },
                { id: 6, name: 'Инструменты', parent_id: null },
                { id: 7, name: 'Электрооборудование', parent_id: null },
                { id: 8, name: 'Сантехника', parent_id: null }
            ];

            this.updateCategorySelectors();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Обновление селекторов категорий
    updateCategorySelectors() {
        const categoryFilter = document.getElementById('categoryFilter');
        const itemCategory = document.getElementById('item-category');
        const categoryParent = document.getElementById('category-parent');
        
        const categoryOptions = this.categories.map(category => 
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
        
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="all">Все категории</option>' + categoryOptions;
        }
        
        if (itemCategory) {
            itemCategory.innerHTML = '<option value="">Выберите категорию</option>' + categoryOptions;
        }
        
        if (categoryParent) {
            categoryParent.innerHTML = '<option value="">Корневая категория</option>' + categoryOptions;
        }
    }

    // Загрузка складов
    async loadWarehouses() {
        try {
            // Демо данные для складов
            this.warehouses = [
                { id: 1, name: 'Основной склад', address: 'ул. Складская, 10' },
                { id: 2, name: 'Склад стройматериалов', address: 'ул. Промышленная, 25' },
                { id: 3, name: 'Инструментальная', address: 'ул. Заводская, 5' }
            ];

            this.updateWarehouseSelectors();
        } catch (error) {
            console.error('Error loading warehouses:', error);
        }
    }

    // Обновление селекторов складов
    updateWarehouseSelectors() {
        const warehouseFilter = document.getElementById('warehouseFilter');
        const itemWarehouse = document.getElementById('item-warehouse');
        const movementWarehouse = document.getElementById('movement-warehouse');
        
        const warehouseOptions = this.warehouses.map(warehouse => 
            `<option value="${warehouse.id}">${warehouse.name}</option>`
        ).join('');
        
        if (warehouseFilter) {
            warehouseFilter.innerHTML = '<option value="all">Все склады</option>' + warehouseOptions;
        }
        
        if (itemWarehouse) {
            itemWarehouse.innerHTML = '<option value="">Выберите склад</option>' + warehouseOptions;
        }
        
        if (movementWarehouse) {
            movementWarehouse.innerHTML = '<option value="">Выберите склад</option>' + warehouseOptions;
        }
    }

    // Загрузка движений
    async loadMovements() {
        try {
            // Демо данные для движений
            this.movements = [
                {
                    id: 1,
                    type: 'receipt',
                    item_name: 'Кирпич керамический',
                    quantity: 500,
                    unit: 'шт',
                    warehouse_name: 'Основной склад',
                    movement_date: '2024-01-15',
                    notes: 'Поступление от поставщика'
                },
                {
                    id: 2,
                    type: 'consumption',
                    item_name: 'Цемент М400',
                    quantity: 2,
                    unit: 'т',
                    warehouse_name: 'Основной склад',
                    movement_date: '2024-01-16',
                    notes: 'Расход на объект "Дом на Пушкина"'
                }
            ];
        } catch (error) {
            console.error('Error loading movements:', error);
        }
    }

    // Переключение вкладок
    switchTab(tabName) {
        this.currentView = tabName;
        
        // Обновляем активную вкладку
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Показываем соответствующий контент
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Загружаем данные для вкладки
        switch (tabName) {
            case 'movements':
                this.renderMovements();
                break;
            case 'reports':
                this.renderReports();
                break;
            case 'categories':
                this.renderCategories();
                break;
        }
    }

    // Рендеринг движений товаров
    renderMovements() {
        const list = document.getElementById('movements-list');
        
        if (this.movements.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exchange-alt"></i>
                    <h3>Нет движений</h3>
                    <p>История движений товаров появится здесь</p>
                </div>
            `;
            return;
        }

        const movementsHtml = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Тип</th>
                        <th>Товар</th>
                        <th>Количество</th>
                        <th>Склад</th>
                        <th>Примечание</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.movements.map(movement => `
                        <tr>
                            <td>${DateUtils.formatDate(movement.movement_date)}</td>
                            <td>
                                <span class="movement-type movement-${movement.type}">
                                    ${this.getMovementTypeLabel(movement.type)}
                                </span>
                            </td>
                            <td>${movement.item_name}</td>
                            <td>${NumberUtils.formatNumber(movement.quantity)} ${movement.unit}</td>
                            <td>${movement.warehouse_name}</td>
                            <td>${movement.notes || '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="warehouseModule.viewMovement(${movement.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        list.innerHTML = movementsHtml;
    }

    // Рендеринг отчетов
    renderReports() {
        // Простая аналитика для демонстрации
        const totalItems = this.items.length;
        const lowStockItems = this.items.filter(item => item.current_stock <= item.min_stock_level).length;
        const totalValue = this.items.reduce((sum, item) => sum + (item.current_stock * item.unit_price), 0);
        
        const charts = document.querySelectorAll('.chart-container');
        charts.forEach(chart => {
            chart.innerHTML = `
                <div class="chart-placeholder">
                    <i class="fas fa-chart-bar"></i>
                    <p>График будет загружен</p>
                </div>
            `;
        });
        
        // Добавляем статистику
        document.getElementById('reports-tab').innerHTML = `
            <div class="reports-stats">
                <div class="stat-card">
                    <h3>Общая статистика</h3>
                    <div class="stat-item">
                        <span class="stat-label">Всего позиций:</span>
                        <span class="stat-value">${totalItems}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Низкие остатки:</span>
                        <span class="stat-value text-warning">${lowStockItems}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Общая стоимость:</span>
                        <span class="stat-value">${NumberUtils.formatCurrency(totalValue)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Рендеринг категорий
    renderCategories() {
        const list = document.getElementById('categories-list');
        
        if (this.categories.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <h3>Нет категорий</h3>
                    <p>Создайте категории для организации товаров</p>
                    <button class="btn btn-primary" onclick="warehouseModule.showCategoryForm()">
                        <i class="fas fa-plus"></i> Создать категорию
                    </button>
                </div>
            `;
            return;
        }

        const categoriesHtml = this.categories.map(category => `
            <div class="category-item">
                <div class="category-info">
                    <h4>${category.name}</h4>
                    <span class="category-count">Товаров: ${this.getItemsCountByCategory(category.id)}</span>
                </div>
                <div class="category-actions">
                    <button class="btn btn-sm btn-outline" onclick="warehouseModule.editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline text-danger" onclick="warehouseModule.deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        list.innerHTML = categoriesHtml;
    }

    // Получить количество товаров в категории
    getItemsCountByCategory(categoryId) {
        return this.items.filter(item => item.category_id === categoryId).length;
    }

    // Показать форму товара
    showItemForm() {
        this.currentItem = null;
        document.getElementById('item-modal-title').textContent = 'Новая позиция';
        document.getElementById('item-form').reset();
        document.getElementById('item-modal').style.display = 'block';
        
        // Установка текущей даты для движения
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 16);
        const movementDate = document.getElementById('movement-date');
        if (movementDate) {
            movementDate.value = formattedDate;
        }
        
        setTimeout(() => {
            document.getElementById('item-name').focus();
        }, 100);
    }

    // Показать форму движения
    showMovementForm() {
        this.currentMovement = null;
        document.getElementById('movement-modal-title').textContent = 'Движение товара';
        document.getElementById('movement-form').reset();
        
        // Заполнение товаров
        const itemSelect = document.getElementById('movement-item');
        const itemOptions = this.items.map(item => 
            `<option value="${item.id}">${item.name} (${item.current_stock} ${item.unit})</option>`
        ).join('');
        itemSelect.innerHTML = '<option value="">Выберите товар</option>' + itemOptions;
        
        // Установка текущей даты
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 16);
        document.getElementById('movement-date').value = formattedDate;
        
        document.getElementById('movement-modal').style.display = 'block';
    }

    // Показать форму категории
    showCategoryForm() {
        document.getElementById('category-modal-title').textContent = 'Новая категория';
        document.getElementById('category-form').reset();
        document.getElementById('category-modal').style.display = 'block';
        
        setTimeout(() => {
            document.getElementById('category-name').focus();
        }, 100);
    }

    // Сохранение товара
    async saveItem() {
        const form = document.getElementById('item-form');
        const formData = new FormData(form);
        
        if (!formData.get('name')) {
            NotificationManager.error('Заполните обязательные поля');
            return;
        }

        const itemData = {
            name: formData.get('name'),
            code: formData.get('code'),
            category_id: parseInt(formData.get('category_id')) || null,
            unit: formData.get('unit'),
            unit_price: parseFloat(formData.get('unit_price')) || 0,
            min_stock_level: parseInt(formData.get('min_stock_level')) || 0,
            warehouse_id: parseInt(formData.get('warehouse_id')) || null,
            location: formData.get('location'),
            description: formData.get('description')
        };

        try {
            if (this.currentItem) {
                // Обновление товара
                await api.put(`/warehouse/items/${this.currentItem.id}`, itemData);
                NotificationManager.success('Товар обновлен');
            } else {
                // Создание товара
                await api.post('/warehouse/items', itemData);
                NotificationManager.success('Товар добавлен');
            }
            
            this.closeModal();
            await this.loadItems();
        } catch (error) {
            console.error('Error saving item:', error);
            NotificationManager.error('Ошибка сохранения товара');
        }
    }

    // Сохранение движения
    async saveMovement() {
        const form = document.getElementById('movement-form');
        const formData = new FormData(form);
        
        if (!formData.get('type') || !formData.get('item_id') || !formData.get('quantity')) {
            NotificationManager.error('Заполните обязательные поля');
            return;
        }

        const movementData = {
            type: formData.get('type'),
            item_id: parseInt(formData.get('item_id')),
            quantity: parseFloat(formData.get('quantity')),
            warehouse_id: parseInt(formData.get('warehouse_id')),
            movement_date: formData.get('movement_date'),
            project_id: parseInt(formData.get('project_id')) || null,
            unit_cost: parseFloat(formData.get('unit_cost')) || 0,
            supplier_id: parseInt(formData.get('supplier_id')) || null,
            notes: formData.get('notes')
        };

        try {
            await api.post('/warehouse/movements', movementData);
            NotificationManager.success('Движение товара зарегистрировано');
            
            this.closeMovementModal();
            await this.loadItems();
            await this.loadMovements();
        } catch (error) {
            console.error('Error saving movement:', error);
            NotificationManager.error('Ошибка регистрации движения');
        }
    }

    // Сохранение категории
    async saveCategory() {
        const form = document.getElementById('category-form');
        const formData = new FormData(form);
        
        if (!formData.get('name')) {
            NotificationManager.error('Заполните название категории');
            return;
        }

        const categoryData = {
            name: formData.get('name'),
            parent_id: parseInt(formData.get('parent_id')) || null,
            description: formData.get('description')
        };

        try {
            await api.post('/warehouse/categories', categoryData);
            NotificationManager.success('Категория создана');
            
            this.closeCategoryModal();
            await this.loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            NotificationManager.error('Ошибка создания категории');
        }
    }

    // Получить подпись статуса
    getStatusLabel(status) {
        const labels = {
            'in_stock': 'В наличии',
            'low_stock': 'Мало остатков',
            'out_of_stock': 'Нет в наличии'
        };
        return labels[status] || status;
    }

    // Получить подпись типа движения
    getMovementTypeLabel(type) {
        const labels = {
            'receipt': 'Приход',
            'consumption': 'Расход',
            'transfer': 'Перемещение',
            'write_off': 'Списание',
            'inventory': 'Инвентаризация'
        };
        return labels[type] || type;
    }

    // Применение фильтров
    async applyFilters() {
        this.filters = {
            category: document.getElementById('categoryFilter').value,
            warehouse: document.getElementById('warehouseFilter').value,
            status: document.getElementById('statusFilter').value,
            search: document.getElementById('searchFilter').value,
            lowStock: document.getElementById('lowStockFilter').checked
        };
        
        this.pagination.page = 1;
        await this.loadItems();
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
                        onclick="warehouseModule.goToPage(${pagination.page - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
            
            for (let i = Math.max(1, pagination.page - 2); i <= Math.min(totalPages, pagination.page + 2); i++) {
                paginationHtml += `
                    <button class="btn btn-sm ${i === pagination.page ? 'btn-primary' : 'btn-outline'}" 
                            onclick="warehouseModule.goToPage(${i})">
                        ${i}
                    </button>
                `;
            }
            
            paginationHtml += `
                <button class="btn btn-sm btn-outline" ${pagination.page === totalPages ? 'disabled' : ''} 
                        onclick="warehouseModule.goToPage(${pagination.page + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        controls.innerHTML = paginationHtml;
    }

    // Переход на страницу
    async goToPage(page) {
        this.pagination.page = page;
        await this.loadItems();
    }

    // Смена представления
    setView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        // TODO: Implement table view
    }

    // Закрытие модальных окон
    closeModal() {
        document.getElementById('item-modal').style.display = 'none';
    }

    closeMovementModal() {
        document.getElementById('movement-modal').style.display = 'none';
    }

    closeCategoryModal() {
        document.getElementById('category-modal').style.display = 'none';
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

    // Пустые методы для будущей реализации
    async viewItem(itemId) {
        NotificationManager.info('Функция просмотра в разработке');
    }

    async editItem(itemId) {
        NotificationManager.info('Функция редактирования в разработке');
    }

    async deleteItem(itemId) {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            NotificationManager.info('Функция удаления в разработке');
        }
    }

    async moveItem(itemId) {
        NotificationManager.info('Функция движения товара в разработке');
    }

    async inventoryItem(itemId) {
        NotificationManager.info('Функция инвентаризации в разработке');
    }

    async exportData() {
        NotificationManager.info('Функция экспорта в разработке');
    }

    async showInventoryReport() {
        NotificationManager.info('Отчет по инвентаризации в разработке');
    }

    onMovementTypeChange() {
        // Логика изменения типа движения
    }

    viewMovement(movementId) {
        NotificationManager.info('Функция просмотра движения в разработке');
    }

    editCategory(categoryId) {
        NotificationManager.info('Функция редактирования категории в разработке');
    }

    deleteCategory(categoryId) {
        if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
            NotificationManager.info('Функция удаления категории в разработке');
        }
    }
}

// Создание глобального экземпляра модуля
const warehouseModule = new WarehouseModule();

// Экспорт для использования в других модулях
window.WarehouseModule = WarehouseModule;
window.warehouseModule = warehouseModule;