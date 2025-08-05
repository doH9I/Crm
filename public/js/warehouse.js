// Warehouse module for Construction CRM
// Модуль управления складом

class WarehouseModule {
    constructor() {
        this.initialized = false;
        this.materials = [];
        this.currentMaterial = null;
    }

    // Initialize warehouse module
    async init() {
        if (this.initialized) return;

        try {
            await this.loadMaterials();
            this.initUI();
            this.bindEvents();
            this.initialized = true;
        } catch (error) {
            console.error('Warehouse module initialization error:', error);
            showNotification('Ошибка инициализации модуля склада', 'error');
        }
    }

    // Load materials from server
    async loadMaterials() {
        try {
            const response = await api.get('/warehouse/materials');
            this.materials = response.data || [];
            this.renderMaterials();
        } catch (error) {
            console.error('Error loading materials:', error);
            showNotification('Ошибка загрузки материалов', 'error');
        }
    }

    // Initialize UI elements
    initUI() {
        this.createWarehouseHTML();
    }

    // Create warehouse HTML structure
    createWarehouseHTML() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="warehouse-container">
                <div class="warehouse-header">
                    <h2>Управление складом</h2>
                    <button id="add-material-btn" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Добавить материал
                    </button>
                </div>
                
                <div class="warehouse-filters">
                    <div class="filter-group">
                        <input type="text" id="material-search" placeholder="Поиск материалов...">
                        <select id="category-filter">
                            <option value="">Все категории</option>
                            <option value="concrete">Бетон</option>
                            <option value="steel">Металл</option>
                            <option value="wood">Дерево</option>
                            <option value="tools">Инструменты</option>
                        </select>
                    </div>
                </div>
                
                <div class="warehouse-content">
                    <div id="materials-grid" class="materials-grid">
                        <!-- Materials will be rendered here -->
                    </div>
                </div>
            </div>
            
            <!-- Material Modal -->
            <div id="material-modal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h3 id="modal-title">Добавить материал</h3>
                    <form id="material-form">
                        <div class="form-group">
                            <label for="material-name">Название</label>
                            <input type="text" id="material-name" required>
                        </div>
                        <div class="form-group">
                            <label for="material-category">Категория</label>
                            <select id="material-category" required>
                                <option value="">Выберите категорию</option>
                                <option value="concrete">Бетон</option>
                                <option value="steel">Металл</option>
                                <option value="wood">Дерево</option>
                                <option value="tools">Инструменты</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="material-unit">Единица измерения</label>
                            <select id="material-unit" required>
                                <option value="">Выберите единицу</option>
                                <option value="pcs">шт</option>
                                <option value="m">м</option>
                                <option value="m2">м²</option>
                                <option value="m3">м³</option>
                                <option value="kg">кг</option>
                                <option value="t">т</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="material-quantity">Количество</label>
                            <input type="number" id="material-quantity" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="material-price">Цена за единицу</label>
                            <input type="number" id="material-price" min="0" step="0.01" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Сохранить</button>
                            <button type="button" class="btn btn-secondary" id="cancel-material">Отмена</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    // Bind event listeners
    bindEvents() {
        // Add material button
        document.getElementById('add-material-btn')?.addEventListener('click', () => {
            this.showMaterialModal();
        });

        // Material form submission
        document.getElementById('material-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMaterial();
        });

        // Cancel button
        document.getElementById('cancel-material')?.addEventListener('click', () => {
            this.hideMaterialModal();
        });

        // Search
        document.getElementById('material-search')?.addEventListener('input', (e) => {
            this.filterMaterials(e.target.value);
        });

        // Category filter
        document.getElementById('category-filter')?.addEventListener('change', (e) => {
            this.filterByCategory(e.target.value);
        });

        // Modal close
        document.querySelector('#material-modal .close')?.addEventListener('click', () => {
            this.hideMaterialModal();
        });
    }

    // Render materials
    renderMaterials() {
        const grid = document.getElementById('materials-grid');
        if (!grid) return;

        if (this.materials.length === 0) {
            grid.innerHTML = '<div class="empty-state">Материалы не найдены</div>';
            return;
        }

        grid.innerHTML = this.materials.map(material => `
            <div class="material-card" data-id="${material.id}">
                <div class="material-header">
                    <h4>${material.name}</h4>
                    <span class="material-category">${this.getCategoryName(material.category)}</span>
                </div>
                <div class="material-info">
                    <div class="quantity">
                        <span class="label">Количество:</span>
                        <span class="value">${material.quantity} ${material.unit}</span>
                    </div>
                    <div class="price">
                        <span class="label">Цена:</span>
                        <span class="value">${material.price} ₽/${material.unit}</span>
                    </div>
                    <div class="total">
                        <span class="label">Общая стоимость:</span>
                        <span class="value">${(material.quantity * material.price).toLocaleString()} ₽</span>
                    </div>
                </div>
                <div class="material-actions">
                    <button class="btn btn-sm btn-primary" onclick="warehouseModule.editMaterial(${material.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="warehouseModule.deleteMaterial(${material.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Get category display name
    getCategoryName(category) {
        const categories = {
            'concrete': 'Бетон',
            'steel': 'Металл',
            'wood': 'Дерево',
            'tools': 'Инструменты'
        };
        return categories[category] || category;
    }

    // Show material modal
    showMaterialModal(material = null) {
        this.currentMaterial = material;
        const modal = document.getElementById('material-modal');
        const title = document.getElementById('modal-title');
        
        if (material) {
            title.textContent = 'Редактировать материал';
            this.fillMaterialForm(material);
        } else {
            title.textContent = 'Добавить материал';
            this.clearMaterialForm();
        }
        
        modal.style.display = 'block';
    }

    // Hide material modal
    hideMaterialModal() {
        document.getElementById('material-modal').style.display = 'none';
        this.currentMaterial = null;
    }

    // Fill material form
    fillMaterialForm(material) {
        document.getElementById('material-name').value = material.name || '';
        document.getElementById('material-category').value = material.category || '';
        document.getElementById('material-unit').value = material.unit || '';
        document.getElementById('material-quantity').value = material.quantity || '';
        document.getElementById('material-price').value = material.price || '';
    }

    // Clear material form
    clearMaterialForm() {
        document.getElementById('material-form').reset();
    }

    // Save material
    async saveMaterial() {
        try {
            const formData = {
                name: document.getElementById('material-name').value,
                category: document.getElementById('material-category').value,
                unit: document.getElementById('material-unit').value,
                quantity: parseFloat(document.getElementById('material-quantity').value),
                price: parseFloat(document.getElementById('material-price').value)
            };

            let response;
            if (this.currentMaterial) {
                response = await api.put(`/warehouse/materials/${this.currentMaterial.id}`, formData);
            } else {
                response = await api.post('/warehouse/materials', formData);
            }

            showNotification('Материал сохранен', 'success');
            this.hideMaterialModal();
            await this.loadMaterials();
        } catch (error) {
            console.error('Error saving material:', error);
            showNotification('Ошибка сохранения материала', 'error');
        }
    }

    // Edit material
    editMaterial(id) {
        const material = this.materials.find(m => m.id === id);
        if (material) {
            this.showMaterialModal(material);
        }
    }

    // Delete material
    async deleteMaterial(id) {
        if (!confirm('Вы уверены, что хотите удалить этот материал?')) {
            return;
        }

        try {
            await api.delete(`/warehouse/materials/${id}`);
            showNotification('Материал удален', 'success');
            await this.loadMaterials();
        } catch (error) {
            console.error('Error deleting material:', error);
            showNotification('Ошибка удаления материала', 'error');
        }
    }

    // Filter materials by search query
    filterMaterials(query) {
        // Implementation for filtering materials
        // This is a placeholder - implement actual filtering logic
    }

    // Filter materials by category
    filterByCategory(category) {
        // Implementation for category filtering
        // This is a placeholder - implement actual filtering logic
    }
}

// Create global instance
const warehouseModule = new WarehouseModule();

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WarehouseModule;
}