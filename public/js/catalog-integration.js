// Модуль интеграции с каталогами поставщиков для Construction CRM

class CatalogIntegration {
    constructor() {
        this.providers = {
            'leroy_merlin': {
                name: 'ЛеруаМерлен',
                baseUrl: 'https://api.leroymerlin.ru',
                enabled: true,
                apiKey: null
            },
            'petrovich': {
                name: 'Петрович',
                baseUrl: 'https://api.petrovich.ru',
                enabled: true,
                apiKey: null
            }
        };
        this.searchResults = [];
        this.selectedItems = [];
        this.isSearching = false;
    }

    // Инициализация модуля
    init() {
        this.loadSettings();
        this.bindEvents();
    }

    // Загрузка настроек интеграции
    async loadSettings() {
        try {
            const settings = await api.get('/settings/catalog-integration');
            if (settings) {
                Object.keys(this.providers).forEach(key => {
                    if (settings[key]) {
                        this.providers[key] = { ...this.providers[key], ...settings[key] };
                    }
                });
            }
        } catch (error) {
            console.error('Error loading catalog settings:', error);
        }
    }

    // Поиск товаров в каталогах
    async searchProducts(query, options = {}) {
        if (!query || query.length < 3) {
            NotificationManager.warning('Введите минимум 3 символа для поиска');
            return [];
        }

        this.isSearching = true;
        this.searchResults = [];

        const searchPromises = [];

        // Поиск в ЛеруаМерлен
        if (this.providers.leroy_merlin.enabled) {
            searchPromises.push(this.searchLeroyMerlin(query, options));
        }

        // Поиск в Петрович
        if (this.providers.petrovich.enabled) {
            searchPromises.push(this.searchPetrovich(query, options));
        }

        try {
            const results = await Promise.allSettled(searchPromises);
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    this.searchResults = this.searchResults.concat(result.value);
                } else {
                    console.error(`Search failed for provider ${index}:`, result.reason);
                }
            });

            // Сортировка результатов по релевантности
            this.searchResults.sort((a, b) => b.relevance - a.relevance);

            this.isSearching = false;
            return this.searchResults;

        } catch (error) {
            console.error('Error searching catalogs:', error);
            this.isSearching = false;
            NotificationManager.error('Ошибка поиска в каталогах');
            return [];
        }
    }

    // Поиск в каталоге ЛеруаМерлен
    async searchLeroyMerlin(query, options = {}) {
        try {
            // Имитация API запроса к ЛеруаМерлен
            // В реальном проекте здесь будет настоящий API
            const mockResults = [
                {
                    id: 'lm_001',
                    provider: 'leroy_merlin',
                    providerName: 'ЛеруаМерлен',
                    name: 'Кирпич керамический полнотелый одинарный М150',
                    code: '82127340',
                    price: 24.90,
                    unit: 'шт',
                    availability: 'В наличии',
                    description: 'Кирпич керамический полнотелый одинарный М150, размер 250x120x65 мм',
                    category: 'Кирпич',
                    image: '/images/catalog/brick_lm.jpg',
                    url: 'https://leroymerlin.ru/product/kirpich-keramicheskiy-82127340/',
                    specifications: {
                        'Марка прочности': 'М150',
                        'Размер': '250x120x65 мм',
                        'Морозостойкость': 'F50',
                        'Водопоглощение': '8-10%'
                    },
                    relevance: 0.95
                },
                {
                    id: 'lm_002',
                    provider: 'leroy_merlin',
                    providerName: 'ЛеруаМерлен',
                    name: 'Цемент Portland М400 50 кг',
                    code: '12345678',
                    price: 285.00,
                    unit: 'мешок',
                    availability: 'В наличии',
                    description: 'Цемент портландцемент М400 Д0, мешок 50 кг',
                    category: 'Цемент',
                    image: '/images/catalog/cement_lm.jpg',
                    url: 'https://leroymerlin.ru/product/cement-portland-12345678/',
                    specifications: {
                        'Марка': 'М400',
                        'Вес': '50 кг',
                        'Добавки': 'Д0'
                    },
                    relevance: 0.90
                }
            ];

            // Фильтрация по запросу
            const filtered = mockResults.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.code.includes(query) ||
                item.category.toLowerCase().includes(query.toLowerCase())
            );

            return filtered;

        } catch (error) {
            console.error('Error searching Leroy Merlin:', error);
            return [];
        }
    }

    // Поиск в каталоге Петрович
    async searchPetrovich(query, options = {}) {
        try {
            // Имитация API запроса к Петрович
            const mockResults = [
                {
                    id: 'pet_001',
                    provider: 'petrovich',
                    providerName: 'Петрович',
                    name: 'Кирпич лицевой керамический М175',
                    code: 'PET-KIR-001',
                    price: 28.50,
                    unit: 'шт',
                    availability: 'В наличии',
                    description: 'Кирпич лицевой керамический полнотелый М175',
                    category: 'Кирпич',
                    image: '/images/catalog/brick_pet.jpg',
                    url: 'https://petrovich.ru/catalog/kirpich/PET-KIR-001/',
                    specifications: {
                        'Марка прочности': 'М175',
                        'Тип': 'Лицевой',
                        'Размер': '250x120x65 мм',
                        'Цвет': 'Красный'
                    },
                    relevance: 0.88
                },
                {
                    id: 'pet_002',
                    provider: 'petrovich',
                    providerName: 'Петрович',
                    name: 'Арматура А500С d12 мм',
                    code: 'PET-ARM-012',
                    price: 89.90,
                    unit: 'м',
                    availability: 'В наличии',
                    description: 'Арматура стальная рифленая А500С диаметр 12 мм',
                    category: 'Арматура',
                    image: '/images/catalog/rebar_pet.jpg',
                    url: 'https://petrovich.ru/catalog/armatura/PET-ARM-012/',
                    specifications: {
                        'Класс': 'А500С',
                        'Диаметр': '12 мм',
                        'Длина': '11,7 м',
                        'ГОСТ': '34028-2016'
                    },
                    relevance: 0.85
                }
            ];

            const filtered = mockResults.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.code.includes(query) ||
                item.category.toLowerCase().includes(query.toLowerCase())
            );

            return filtered;

        } catch (error) {
            console.error('Error searching Petrovich:', error);
            return [];
        }
    }

    // Получение детальной информации о товаре
    async getProductDetails(provider, productId) {
        try {
            switch (provider) {
                case 'leroy_merlin':
                    return await this.getLeroyMerlinProductDetails(productId);
                case 'petrovich':
                    return await this.getPetrovichProductDetails(productId);
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
        } catch (error) {
            console.error('Error getting product details:', error);
            NotificationManager.error('Ошибка получения данных о товаре');
            return null;
        }
    }

    // Детали товара из ЛеруаМерлен
    async getLeroyMerlinProductDetails(productId) {
        // Имитация API запроса
        return {
            id: productId,
            provider: 'leroy_merlin',
            availability: {
                inStock: true,
                quantity: 'Более 100 шт',
                delivery: '1-2 дня',
                pickup: 'Сегодня'
            },
            pricing: {
                price: 24.90,
                oldPrice: 27.50,
                discount: 9,
                minOrder: 1,
                bulkDiscounts: [
                    { from: 100, discount: 5 },
                    { from: 500, discount: 10 },
                    { from: 1000, discount: 15 }
                ]
            },
            reviews: {
                rating: 4.5,
                count: 127,
                recommended: 89
            }
        };
    }

    // Детали товара из Петрович
    async getPetrovichProductDetails(productId) {
        return {
            id: productId,
            provider: 'petrovich',
            availability: {
                inStock: true,
                quantity: 'В наличии',
                delivery: '1-3 дня',
                pickup: 'Завтра'
            },
            pricing: {
                price: 28.50,
                discount: 0,
                minOrder: 1,
                bulkDiscounts: [
                    { from: 200, discount: 3 },
                    { from: 1000, discount: 7 }
                ]
            }
        };
    }

    // Сравнение цен у разных поставщиков
    async comparePrices(productName) {
        const results = await this.searchProducts(productName);
        
        // Группировка по похожим товарам
        const grouped = this.groupSimilarProducts(results);
        
        return grouped.map(group => ({
            productName: group.name,
            offers: group.items.map(item => ({
                provider: item.providerName,
                price: item.price,
                unit: item.unit,
                availability: item.availability,
                url: item.url,
                specifications: item.specifications
            })).sort((a, b) => a.price - b.price)
        }));
    }

    // Группировка похожих товаров
    groupSimilarProducts(products) {
        const groups = [];
        
        products.forEach(product => {
            // Простая группировка по названию (можно улучшить с помощью ML)
            const existingGroup = groups.find(group => 
                this.calculateSimilarity(group.name, product.name) > 0.7
            );
            
            if (existingGroup) {
                existingGroup.items.push(product);
            } else {
                groups.push({
                    name: product.name,
                    items: [product]
                });
            }
        });
        
        return groups;
    }

    // Расчет схожести названий товаров
    calculateSimilarity(str1, str2) {
        const words1 = str1.toLowerCase().split(' ');
        const words2 = str2.toLowerCase().split(' ');
        
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        
        return intersection.length / union.length;
    }

    // Добавление товара из каталога в склад
    async addToWarehouse(catalogItem, warehouseData) {
        try {
            const itemData = {
                name: catalogItem.name,
                code: catalogItem.code,
                unit: catalogItem.unit,
                unit_price: catalogItem.price,
                category_name: catalogItem.category,
                description: catalogItem.description,
                supplier_info: {
                    provider: catalogItem.provider,
                    provider_name: catalogItem.providerName,
                    provider_code: catalogItem.code,
                    provider_url: catalogItem.url
                },
                specifications: catalogItem.specifications,
                ...warehouseData
            };

            const result = await api.post('/warehouse/items', itemData);
            
            NotificationManager.success(`Товар "${catalogItem.name}" добавлен на склад`);
            return result;

        } catch (error) {
            console.error('Error adding item to warehouse:', error);
            NotificationManager.error('Ошибка добавления товара на склад');
            throw error;
        }
    }

    // Обновление цен из каталогов
    async updatePricesFromCatalogs(warehouseItems) {
        const updatePromises = warehouseItems.map(async (item) => {
            if (item.supplier_info && item.supplier_info.provider) {
                try {
                    const details = await this.getProductDetails(
                        item.supplier_info.provider,
                        item.supplier_info.provider_code
                    );
                    
                    if (details && details.pricing.price !== item.unit_price) {
                        return {
                            id: item.id,
                            oldPrice: item.unit_price,
                            newPrice: details.pricing.price,
                            priceChange: details.pricing.price - item.unit_price
                        };
                    }
                } catch (error) {
                    console.error(`Error updating price for item ${item.id}:`, error);
                }
            }
            return null;
        });

        const results = await Promise.allSettled(updatePromises);
        const priceUpdates = results
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);

        return priceUpdates;
    }

    // Отслеживание изменений цен
    async trackPriceChanges(items) {
        const changes = [];
        
        for (const item of items) {
            if (item.supplier_info) {
                try {
                    const currentDetails = await this.getProductDetails(
                        item.supplier_info.provider,
                        item.supplier_info.provider_code
                    );
                    
                    if (currentDetails) {
                        const oldPrice = item.price_history?.length > 0 
                            ? item.price_history[item.price_history.length - 1].price 
                            : item.unit_price;
                        
                        const newPrice = currentDetails.pricing.price;
                        
                        if (Math.abs(newPrice - oldPrice) > 0.01) {
                            changes.push({
                                itemId: item.id,
                                itemName: item.name,
                                provider: item.supplier_info.provider_name,
                                oldPrice: oldPrice,
                                newPrice: newPrice,
                                changePercent: ((newPrice - oldPrice) / oldPrice) * 100,
                                changeType: newPrice > oldPrice ? 'increase' : 'decrease',
                                date: new Date().toISOString()
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error tracking price for item ${item.id}:`, error);
                }
            }
        }
        
        return changes;
    }

    // Рендеринг результатов поиска в каталогах
    renderSearchResults(container, results) {
        if (!results || results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h4>Товары не найдены</h4>
                    <p>Попробуйте изменить поисковый запрос</p>
                </div>
            `;
            return;
        }

        const resultsHtml = results.map(item => `
            <div class="catalog-item" data-provider="${item.provider}" data-id="${item.id}">
                <div class="item-header">
                    <div class="provider-badge">${item.providerName}</div>
                    <div class="availability ${item.availability === 'В наличии' ? 'in-stock' : 'out-of-stock'}">
                        ${item.availability}
                    </div>
                </div>
                
                <div class="item-content">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-image">` : ''}
                    <div class="item-info">
                        <h4 class="item-name">${item.name}</h4>
                        <div class="item-code">Артикул: ${item.code}</div>
                        <div class="item-description">${item.description}</div>
                        
                        ${item.specifications ? `
                            <div class="item-specs">
                                ${Object.entries(item.specifications).map(([key, value]) => 
                                    `<span class="spec">${key}: ${value}</span>`
                                ).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="item-footer">
                    <div class="item-price">
                        <span class="price">${NumberUtils.formatCurrency(item.price)}</span>
                        <span class="unit">за ${item.unit}</span>
                    </div>
                    
                    <div class="item-actions">
                        <button class="btn btn-sm btn-outline" onclick="catalogIntegration.viewProduct('${item.provider}', '${item.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="catalogIntegration.showAddToWarehouseForm('${item.provider}', '${item.id}')">
                            <i class="fas fa-plus"></i> Добавить
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = resultsHtml;
    }

    // Показать форму добавления товара на склад
    showAddToWarehouseForm(provider, productId) {
        const product = this.searchResults.find(item => 
            item.provider === provider && item.id === productId
        );
        
        if (!product) {
            NotificationManager.error('Товар не найден');
            return;
        }

        // Создание модального окна
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Добавить товар на склад</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="product-preview">
                        <h4>${product.name}</h4>
                        <p>Поставщик: ${product.providerName}</p>
                        <p>Цена: ${NumberUtils.formatCurrency(product.price)} за ${product.unit}</p>
                    </div>
                    
                    <form id="add-to-warehouse-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Количество для заказа</label>
                                <input type="number" name="initial_quantity" min="0" step="0.01" value="0">
                            </div>
                            <div class="form-group">
                                <label>Минимальный остаток</label>
                                <input type="number" name="min_stock_level" min="0" value="10">
                            </div>
                            <div class="form-group">
                                <label>Склад</label>
                                <select name="warehouse_id" required>
                                    <option value="">Выберите склад</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Место хранения</label>
                                <input type="text" name="location" placeholder="Стеллаж, полка">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Примечание</label>
                            <textarea name="notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline modal-close">Отмена</button>
                    <button type="button" class="btn btn-primary" onclick="catalogIntegration.confirmAddToWarehouse('${provider}', '${productId}')">
                        Добавить товар
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // Загрузка списка складов
        this.loadWarehousesForForm(modal.querySelector('[name="warehouse_id"]'));

        // Обработка закрытия
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
    }

    // Загрузка складов для формы
    async loadWarehousesForForm(selectElement) {
        try {
            const warehouses = await api.get('/warehouses');
            const options = warehouses.map(warehouse => 
                `<option value="${warehouse.id}">${warehouse.name}</option>`
            ).join('');
            selectElement.innerHTML = '<option value="">Выберите склад</option>' + options;
        } catch (error) {
            console.error('Error loading warehouses:', error);
        }
    }

    // Подтверждение добавления товара
    async confirmAddToWarehouse(provider, productId) {
        const product = this.searchResults.find(item => 
            item.provider === provider && item.id === productId
        );
        
        const form = document.getElementById('add-to-warehouse-form');
        const formData = new FormData(form);
        
        const warehouseData = {
            initial_quantity: parseFloat(formData.get('initial_quantity')) || 0,
            min_stock_level: parseInt(formData.get('min_stock_level')) || 0,
            warehouse_id: parseInt(formData.get('warehouse_id')),
            location: formData.get('location'),
            notes: formData.get('notes')
        };

        try {
            await this.addToWarehouse(product, warehouseData);
            
            // Закрытие модального окна
            const modal = form.closest('.modal');
            if (modal) {
                document.body.removeChild(modal);
            }
            
        } catch (error) {
            // Ошибка уже обработана в addToWarehouse
        }
    }

    // Просмотр товара на сайте поставщика
    viewProduct(provider, productId) {
        const product = this.searchResults.find(item => 
            item.provider === provider && item.id === productId
        );
        
        if (product && product.url) {
            window.open(product.url, '_blank');
        }
    }

    // Настройка интеграции
    showSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Настройки интеграции каталогов</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="catalog-settings-form">
                        <h4>ЛеруаМерлен</h4>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="leroy_merlin_enabled" ${this.providers.leroy_merlin.enabled ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                Включить интеграцию
                            </label>
                        </div>
                        <div class="form-group">
                            <label>API ключ (опционально)</label>
                            <input type="text" name="leroy_merlin_api_key" value="${this.providers.leroy_merlin.apiKey || ''}">
                        </div>
                        
                        <h4>Петрович</h4>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="petrovich_enabled" ${this.providers.petrovich.enabled ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                Включить интеграцию
                            </label>
                        </div>
                        <div class="form-group">
                            <label>API ключ (опционально)</label>
                            <input type="text" name="petrovich_api_key" value="${this.providers.petrovich.apiKey || ''}">
                        </div>
                        
                        <h4>Настройки обновления цен</h4>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="auto_price_update" checked>
                                <span class="checkmark"></span>
                                Автоматическое обновление цен
                            </label>
                        </div>
                        <div class="form-group">
                            <label>Частота обновления</label>
                            <select name="update_frequency">
                                <option value="daily">Ежедневно</option>
                                <option value="weekly">Еженедельно</option>
                                <option value="monthly">Ежемесячно</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline modal-close">Отмена</button>
                    <button type="button" class="btn btn-primary" onclick="catalogIntegration.saveSettings()">
                        Сохранить
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
    }

    // Сохранение настроек
    async saveSettings() {
        const form = document.getElementById('catalog-settings-form');
        const formData = new FormData(form);
        
        const settings = {
            leroy_merlin: {
                enabled: formData.get('leroy_merlin_enabled') === 'on',
                apiKey: formData.get('leroy_merlin_api_key')
            },
            petrovich: {
                enabled: formData.get('petrovich_enabled') === 'on',
                apiKey: formData.get('petrovich_api_key')
            },
            auto_price_update: formData.get('auto_price_update') === 'on',
            update_frequency: formData.get('update_frequency')
        };

        try {
            await api.post('/settings/catalog-integration', settings);
            
            // Обновление локальных настроек
            Object.keys(this.providers).forEach(key => {
                if (settings[key]) {
                    this.providers[key] = { ...this.providers[key], ...settings[key] };
                }
            });
            
            NotificationManager.success('Настройки сохранены');
            
            // Закрытие модального окна
            const modal = form.closest('.modal');
            if (modal) {
                document.body.removeChild(modal);
            }
            
        } catch (error) {
            console.error('Error saving settings:', error);
            NotificationManager.error('Ошибка сохранения настроек');
        }
    }

    // Привязка событий
    bindEvents() {
        // Обработчики можно добавить здесь
    }

    // Получение статистики использования каталогов
    async getUsageStats() {
        try {
            const stats = await api.get('/catalog-integration/stats');
            return stats || {
                totalSearches: 0,
                itemsAdded: 0,
                priceUpdates: 0,
                providers: {
                    leroy_merlin: { searches: 0, items: 0 },
                    petrovich: { searches: 0, items: 0 }
                }
            };
        } catch (error) {
            console.error('Error getting usage stats:', error);
            return null;
        }
    }
}

// Создание глобального экземпляра
const catalogIntegration = new CatalogIntegration();

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    catalogIntegration.init();
});

// Экспорт для использования в других модулях
window.CatalogIntegration = CatalogIntegration;
window.catalogIntegration = catalogIntegration;