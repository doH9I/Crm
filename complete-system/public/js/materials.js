// Materials module for Construction CRM
// Полнофункциональный модуль материалов

class MaterialsModule {
    constructor() {
        this.container = null;
        this.materials = [];
        this.currentMaterial = null;
        this.filters = {
            category: '',
            status: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 20,
            total: 0
        };
        this.categories = [
            'Строительные материалы',
            'Отделочные материалы',
            'Электрооборудование',
            'Сантехника',
            'Инструменты',
            'Крепежные изделия',
            'Изоляционные материалы',
            'Лакокрасочные материалы'
        ];
    }

    // Initialize materials module
    async init() {
        console.log('🧱 Initializing Materials module...');
        this.container = document.getElementById('content-area');
        await this.render();
        await this.loadMaterials();
        this.initEventListeners();
    }

    // Render materials layout
    async render() {
        this.container.innerHTML = `
            <div class="materials-module">
                <!-- Header with actions -->
                <div class="module-header">
                    <div class="header-left">
                        <h2 class="module-title">
                            <i class="fas fa-boxes"></i>
                            Управление материалами
                        </h2>
                        <p class="module-description">Каталог строительных материалов и их характеристики</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-outline" onclick="materialsModule.exportMaterials()">
                            <i class="fas fa-download"></i>
                            Экспорт
                        </button>
                        <button class="btn btn-outline" onclick="materialsModule.importMaterials()">
                            <i class="fas fa-upload"></i>
                            Импорт
                        </button>
                        <button class="btn btn-primary" onclick="materialsModule.showCreateMaterialModal()">
                            <i class="fas fa-plus"></i>
                            Добавить материал
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
                                    <input type="text" id="materials-search" placeholder="Поиск материалов...">
                                    <i class="fas fa-search"></i>
                                </div>
                            </div>
                            <div class="filter-group">
                                <label>Категория</label>
                                <select id="materials-category-filter">
                                    <option value="">Все категории</option>
                                    ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Статус</label>
                                <select id="materials-status-filter">
                                    <option value="">Все статусы</option>
                                    <option value="active">Активный</option>
                                    <option value="discontinued">Снят с производства</option>
                                    <option value="out_of_stock">Нет в наличии</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <button class="btn btn-secondary" onclick="materialsModule.resetFilters()">
                                    <i class="fas fa-times"></i>
                                    Сбросить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Materials Grid/List Toggle -->
                <div class="view-controls">
                    <div class="view-toggle">
                        <button class="btn btn-sm btn-outline active" data-view="grid" onclick="materialsModule.setViewMode('grid')">
                            <i class="fas fa-th"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" data-view="list" onclick="materialsModule.setViewMode('list')">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                    <div class="results-info">
                        <span id="materials-count">Загрузка...</span>
                    </div>
                </div>

                <!-- Materials Content -->
                <div id="materials-content" class="materials-grid">
                    <div class="loading-placeholder">
                        <div class="spinner"></div>
                        <p>Загрузка материалов...</p>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-container" id="materials-pagination">
                    <!-- Pagination will be rendered here -->
                </div>
            </div>

            <!-- Create Material Modal -->
            <div id="create-material-modal" class="modal-overlay">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3>Добавить материал</h3>
                        <button class="modal-close" onclick="materialsModule.closeCreateModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="create-material-form">
                            <div class="form-grid cols-2">
                                <div class="form-group">
                                    <label for="material-name">Название *</label>
                                    <input type="text" id="material-name" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="material-article">Артикул</label>
                                    <input type="text" id="material-article" name="article">
                                </div>
                                <div class="form-group">
                                    <label for="material-category">Категория *</label>
                                    <select id="material-category" name="category" required>
                                        <option value="">Выберите категорию</option>
                                        ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="material-unit">Единица измерения *</label>
                                    <select id="material-unit" name="unit" required>
                                        <option value="">Выберите единицу</option>
                                        <option value="шт">шт</option>
                                        <option value="м">м</option>
                                        <option value="м²">м²</option>
                                        <option value="м³">м³</option>
                                        <option value="кг">кг</option>
                                        <option value="т">т</option>
                                        <option value="л">л</option>
                                        <option value="упак">упак</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="material-price">Цена за единицу</label>
                                    <input type="number" id="material-price" name="price" step="0.01" min="0">
                                </div>
                                <div class="form-group">
                                    <label for="material-supplier">Поставщик</label>
                                    <input type="text" id="material-supplier" name="supplier">
                                </div>
                                <div class="form-group">
                                    <label for="material-min-stock">Минимальный остаток</label>
                                    <input type="number" id="material-min-stock" name="minStock" min="0">
                                </div>
                                <div class="form-group">
                                    <label for="material-status">Статус</label>
                                    <select id="material-status" name="status">
                                        <option value="active">Активный</option>
                                        <option value="discontinued">Снят с производства</option>
                                        <option value="out_of_stock">Нет в наличии</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="material-specifications">Технические характеристики</label>
                                <textarea id="material-specifications" name="specifications" rows="3" 
                                         placeholder="Размеры, вес, материал, цвет и другие характеристики..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="material-description">Описание</label>
                                <textarea id="material-description" name="description" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="materialsModule.closeCreateModal()">
                            Отмена
                        </button>
                        <button type="submit" class="btn btn-primary" form="create-material-form">
                            <i class="fas fa-save"></i>
                            Сохранить
                        </button>
                    </div>
                </div>
            </div>

            <!-- View Material Modal -->
            <div id="view-material-modal" class="modal-overlay">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3 id="view-material-title">Материал</h3>
                        <button class="modal-close" onclick="materialsModule.closeViewModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div id="material-details">
                            <!-- Material details will be loaded here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="materialsModule.closeViewModal()">
                            Закрыть
                        </button>
                        <button type="button" class="btn btn-primary" onclick="materialsModule.editCurrentMaterial()">
                            <i class="fas fa-edit"></i>
                            Редактировать
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Load materials from API
    async loadMaterials() {
        try {
            // Mock materials data
            const mockMaterials = [
                {
                    id: 1,
                    name: 'Кирпич керамический',
                    article: 'KIR-001',
                    category: 'Строительные материалы',
                    unit: 'шт',
                    price: 12.50,
                    supplier: 'ООО "СтройМатериалы"',
                    status: 'active',
                    min_stock: 1000,
                    current_stock: 5000,
                    specifications: 'Размер: 250x120x65 мм, Прочность: М150, Морозостойкость: F50',
                    description: 'Керамический кирпич одинарный полнотелый',
                    created_at: '2024-01-10'
                },
                {
                    id: 2,
                    name: 'Цемент М400',
                    article: 'CEM-400',
                    category: 'Строительные материалы',
                    unit: 'кг',
                    price: 8.50,
                    supplier: 'Цементный завод "Прогресс"',
                    status: 'active',
                    min_stock: 500,
                    current_stock: 2000,
                    specifications: 'Марка: М400, Упаковка: мешок 50кг',
                    description: 'Портландцемент общестроительного назначения',
                    created_at: '2024-01-08'
                },
                {
                    id: 3,
                    name: 'Краска водоэмульсионная белая',
                    article: 'PAINT-WE-001',
                    category: 'Лакокрасочные материалы',
                    unit: 'л',
                    price: 350.00,
                    supplier: 'Лакокрасочный завод "Радуга"',
                    status: 'active',
                    min_stock: 50,
                    current_stock: 120,
                    specifications: 'Основа: водная, Расход: 8-12 м²/л, Время высыхания: 2 часа',
                    description: 'Водоэмульсионная краска для внутренних работ',
                    created_at: '2024-01-05'
                },
                {
                    id: 4,
                    name: 'Плитка керамическая 30x30',
                    article: 'TILE-CER-001',
                    category: 'Отделочные материалы',
                    unit: 'м²',
                    price: 890.00,
                    supplier: 'Керамика-Люкс',
                    status: 'active',
                    min_stock: 10,
                    current_stock: 45,
                    specifications: 'Размер: 300x300 мм, Класс износостойкости: PEI III, Водопоглощение: <3%',
                    description: 'Керамическая напольная плитка для внутренних помещений',
                    created_at: '2024-01-03'
                }
            ];

            this.materials = mockMaterials;
            this.pagination.total = mockMaterials.length;

            this.renderMaterials();
            this.renderPagination();
            this.updateResultsInfo();

        } catch (error) {
            console.error('Error loading materials:', error);
            showNotification('Ошибка загрузки материалов', 'error');
        }
    }

    // Render materials
    renderMaterials() {
        const container = document.getElementById('materials-content');
        
        if (this.materials.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-boxes fa-3x text-muted mb-3"></i>
                    <h4>Нет материалов</h4>
                    <p class="text-muted">Добавьте первый материал в каталог</p>
                </div>
            `;
            return;
        }

        const isGridView = container.classList.contains('materials-grid');

        if (isGridView) {
            container.innerHTML = this.materials.map(material => `
                <div class="material-card" onclick="materialsModule.viewMaterial(${material.id})">
                    <div class="material-header">
                        <div class="material-category">${material.category}</div>
                        <div class="material-status">
                            <span class="badge badge-${this.getStatusBadgeClass(material.status)}">
                                ${this.getStatusText(material.status)}
                            </span>
                        </div>
                    </div>
                    <div class="material-info">
                        <h4 class="material-name">${material.name}</h4>
                        <p class="material-article">Артикул: ${material.article || 'Не указан'}</p>
                        <div class="material-price">
                            ${material.price ? NumberUtils.formatCurrency(material.price) + ' / ' + material.unit : 'Цена не указана'}
                        </div>
                        <div class="material-stock">
                            <span class="stock-label">Остаток:</span>
                            <span class="stock-value ${material.current_stock <= material.min_stock ? 'low-stock' : ''}">
                                ${material.current_stock || 0} ${material.unit}
                            </span>
                        </div>
                    </div>
                    <div class="material-actions">
                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); materialsModule.viewMaterial(${material.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); materialsModule.editMaterial(${material.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); materialsModule.deleteMaterial(${material.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Артикул</th>
                                <th>Категория</th>
                                <th>Цена</th>
                                <th>Остаток</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.materials.map(material => `
                                <tr>
                                    <td>
                                        <div class="item-info">
                                            <div class="item-title">${material.name}</div>
                                            <div class="item-subtitle">${material.supplier || 'Поставщик не указан'}</div>
                                        </div>
                                    </td>
                                    <td>${material.article || '-'}</td>
                                    <td><span class="category-badge">${material.category}</span></td>
                                    <td>
                                        ${material.price ? NumberUtils.formatCurrency(material.price) + ' / ' + material.unit : '-'}
                                    </td>
                                    <td>
                                        <span class="stock-value ${material.current_stock <= material.min_stock ? 'low-stock' : ''}">
                                            ${material.current_stock || 0} ${material.unit}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="badge badge-${this.getStatusBadgeClass(material.status)}">
                                            ${this.getStatusText(material.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn btn-sm btn-primary" onclick="materialsModule.viewMaterial(${material.id})" title="Просмотр">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-secondary" onclick="materialsModule.editMaterial(${material.id})" title="Редактировать">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="materialsModule.deleteMaterial(${material.id})" title="Удалить">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    // Initialize event listeners
    initEventListeners() {
        // Search
        const searchInput = document.getElementById('materials-search');
        searchInput?.addEventListener('input', debounce((e) => {
            this.filters.search = e.target.value;
            this.pagination.page = 1;
            this.loadMaterials();
        }, 300));

        // Category filter
        const categoryFilter = document.getElementById('materials-category-filter');
        categoryFilter?.addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.pagination.page = 1;
            this.loadMaterials();
        });

        // Status filter
        const statusFilter = document.getElementById('materials-status-filter');
        statusFilter?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.pagination.page = 1;
            this.loadMaterials();
        });

        // Create form
        const createForm = document.getElementById('create-material-form');
        createForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateMaterial();
        });
    }

    // Set view mode
    setViewMode(mode) {
        const container = document.getElementById('materials-content');
        const toggleButtons = document.querySelectorAll('.view-toggle button');
        
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${mode}"]`).classList.add('active');
        
        if (mode === 'grid') {
            container.className = 'materials-grid';
        } else {
            container.className = 'materials-list';
        }
        
        this.renderMaterials();
    }

    // Update results info
    updateResultsInfo() {
        const countElement = document.getElementById('materials-count');
        if (countElement) {
            countElement.textContent = `Найдено материалов: ${this.materials.length}`;
        }
    }

    // Show create material modal
    showCreateMaterialModal() {
        document.getElementById('create-material-modal').classList.add('show');
    }

    // Close create modal
    closeCreateModal() {
        document.getElementById('create-material-modal').classList.remove('show');
        document.getElementById('create-material-form').reset();
    }

    // Handle create material
    async handleCreateMaterial() {
        try {
            const formData = new FormData(document.getElementById('create-material-form'));
            const materialData = Object.fromEntries(formData.entries());

            // Mock creation
            const newMaterial = {
                id: Date.now(),
                name: materialData.name,
                article: materialData.article,
                category: materialData.category,
                unit: materialData.unit,
                price: parseFloat(materialData.price) || 0,
                supplier: materialData.supplier,
                status: materialData.status,
                min_stock: parseInt(materialData.minStock) || 0,
                current_stock: 0,
                specifications: materialData.specifications,
                description: materialData.description,
                created_at: new Date().toISOString().split('T')[0]
            };

            this.materials.unshift(newMaterial);
            this.renderMaterials();
            this.updateResultsInfo();

            showNotification('Материал добавлен успешно', 'success');
            this.closeCreateModal();

        } catch (error) {
            console.error('Error creating material:', error);
            showNotification('Ошибка добавления материала', 'error');
        }
    }

    // View material
    viewMaterial(id) {
        const material = this.materials.find(m => m.id === id);
        if (!material) return;

        this.currentMaterial = material;
        document.getElementById('view-material-title').textContent = material.name;
        
        const detailsContainer = document.getElementById('material-details');
        detailsContainer.innerHTML = `
            <div class="material-info-detailed">
                <div class="info-grid">
                    <div class="info-item">
                        <label>Артикул</label>
                        <span>${material.article || 'Не указан'}</span>
                    </div>
                    <div class="info-item">
                        <label>Категория</label>
                        <span class="category-badge">${material.category}</span>
                    </div>
                    <div class="info-item">
                        <label>Единица измерения</label>
                        <span>${material.unit}</span>
                    </div>
                    <div class="info-item">
                        <label>Цена</label>
                        <span class="price-value">
                            ${material.price ? NumberUtils.formatCurrency(material.price) + ' / ' + material.unit : 'Не указана'}
                        </span>
                    </div>
                    <div class="info-item">
                        <label>Поставщик</label>
                        <span>${material.supplier || 'Не указан'}</span>
                    </div>
                    <div class="info-item">
                        <label>Статус</label>
                        <span class="badge badge-${this.getStatusBadgeClass(material.status)}">
                            ${this.getStatusText(material.status)}
                        </span>
                    </div>
                    <div class="info-item">
                        <label>Текущий остаток</label>
                        <span class="stock-value ${material.current_stock <= material.min_stock ? 'low-stock' : ''}">
                            ${material.current_stock || 0} ${material.unit}
                        </span>
                    </div>
                    <div class="info-item">
                        <label>Минимальный остаток</label>
                        <span>${material.min_stock || 0} ${material.unit}</span>
                    </div>
                </div>
                ${material.specifications ? `
                    <div class="specifications">
                        <h4>Технические характеристики</h4>
                        <p>${material.specifications}</p>
                    </div>
                ` : ''}
                ${material.description ? `
                    <div class="description">
                        <h4>Описание</h4>
                        <p>${material.description}</p>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('view-material-modal').classList.add('show');
    }

    // Close view modal
    closeViewModal() {
        document.getElementById('view-material-modal').classList.remove('show');
        this.currentMaterial = null;
    }

    // Edit material
    editMaterial(id) {
        showNotification('Функционал редактирования будет добавлен в следующей версии', 'info');
    }

    // Delete material
    async deleteMaterial(id) {
        if (!confirm('Вы уверены, что хотите удалить этот материал?')) return;

        try {
            this.materials = this.materials.filter(m => m.id !== id);
            this.renderMaterials();
            this.updateResultsInfo();
            showNotification('Материал удален успешно', 'success');
        } catch (error) {
            console.error('Error deleting material:', error);
            showNotification('Ошибка удаления материала', 'error');
        }
    }

    // Export materials
    exportMaterials() {
        showNotification('Экспорт материалов будет реализован в следующей версии', 'info');
    }

    // Import materials
    importMaterials() {
        showNotification('Импорт материалов будет реализован в следующей версии', 'info');
    }

    // Reset filters
    resetFilters() {
        this.filters = {
            category: '',
            status: '',
            search: ''
        };
        
        document.getElementById('materials-search').value = '';
        document.getElementById('materials-category-filter').value = '';
        document.getElementById('materials-status-filter').value = '';
        
        this.pagination.page = 1;
        this.loadMaterials();
    }

    // Render pagination
    renderPagination() {
        const container = document.getElementById('materials-pagination');
        const totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination">';
        
        if (this.pagination.page > 1) {
            paginationHTML += `<button class="btn btn-sm btn-outline" onclick="materialsModule.goToPage(${this.pagination.page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === this.pagination.page ? 'active' : '';
            paginationHTML += `<button class="btn btn-sm btn-outline ${isActive}" onclick="materialsModule.goToPage(${i})">${i}</button>`;
        }

        if (this.pagination.page < totalPages) {
            paginationHTML += `<button class="btn btn-sm btn-outline" onclick="materialsModule.goToPage(${this.pagination.page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>`;
        }

        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }

    // Go to page
    goToPage(page) {
        this.pagination.page = page;
        this.loadMaterials();
    }

    // Helper methods
    getStatusText(status) {
        const statusMap = {
            active: 'Активный',
            discontinued: 'Снят с производства',
            out_of_stock: 'Нет в наличии'
        };
        return statusMap[status] || status;
    }

    getStatusBadgeClass(status) {
        const classMap = {
            active: 'success',
            discontinued: 'warning',
            out_of_stock: 'danger'
        };
        return classMap[status] || 'secondary';
    }

    // Show/hide module
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.loadMaterials();
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}

// Create global instance
const materialsModule = new MaterialsModule();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaterialsModule;
}