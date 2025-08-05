// Export/Import Module for Construction CRM

class ExportImportModule {
    constructor() {
        this.container = null;
        this.currentFormat = 'excel';
        this.currentEntity = 'projects';
        this.exportData = null;
        this.importProgress = 0;
    }

    // Initialize export/import module
    async init() {
        this.container = document.getElementById('content-area');
        await this.render();
        this.initEventListeners();
        this.loadExportData();
    }

    // Render export/import interface
    async render() {
        this.container.innerHTML = `
            <div class="export-import-module">
                <!-- Module Header -->
                <div class="module-header">
                    <h1><i class="fas fa-exchange-alt"></i> Экспорт и импорт данных</h1>
                    <p>Управление импортом и экспортом данных в различных форматах</p>
                </div>

                <!-- Export/Import Tabs -->
                <div class="export-import-tabs">
                    <button class="tab-btn active" data-tab="export" onclick="exportImportModule.switchTab('export')">
                        <i class="fas fa-download"></i> Экспорт
                    </button>
                    <button class="tab-btn" data-tab="import" onclick="exportImportModule.switchTab('import')">
                        <i class="fas fa-upload"></i> Импорт
                    </button>
                    <button class="tab-btn" data-tab="templates" onclick="exportImportModule.switchTab('templates')">
                        <i class="fas fa-file-download"></i> Шаблоны
                    </button>
                    <button class="tab-btn" data-tab="history" onclick="exportImportModule.switchTab('history')">
                        <i class="fas fa-history"></i> История
                    </button>
                </div>

                <!-- Export Tab -->
                <div id="export-tab" class="tab-content active">
                    <div class="export-section">
                        <div class="section-grid">
                            <!-- Export Configuration -->
                            <div class="config-card card">
                                <div class="card-header">
                                    <h3><i class="fas fa-cog"></i> Настройки экспорта</h3>
                                </div>
                                <div class="card-body">
                                    <div class="form-group">
                                        <label>Тип данных:</label>
                                        <select id="export-entity" onchange="exportImportModule.changeEntity(this.value)">
                                            <option value="projects">Проекты</option>
                                            <option value="clients">Клиенты</option>
                                            <option value="contractors">Подрядчики</option>
                                            <option value="employees">Сотрудники</option>
                                            <option value="warehouse">Складские позиции</option>
                                            <option value="estimates">Сметы</option>
                                            <option value="offers">Коммерческие предложения</option>
                                            <option value="all">Все данные</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Формат экспорта:</label>
                                        <div class="format-options">
                                            <label class="format-option">
                                                <input type="radio" name="export-format" value="excel" checked onchange="exportImportModule.changeFormat('excel')">
                                                <span class="format-card">
                                                    <i class="fas fa-file-excel"></i>
                                                    <span>Excel (.xlsx)</span>
                                                </span>
                                            </label>
                                            <label class="format-option">
                                                <input type="radio" name="export-format" value="csv" onchange="exportImportModule.changeFormat('csv')">
                                                <span class="format-card">
                                                    <i class="fas fa-file-csv"></i>
                                                    <span>CSV (.csv)</span>
                                                </span>
                                            </label>
                                            <label class="format-option">
                                                <input type="radio" name="export-format" value="pdf" onchange="exportImportModule.changeFormat('pdf')">
                                                <span class="format-card">
                                                    <i class="fas fa-file-pdf"></i>
                                                    <span>PDF (.pdf)</span>
                                                </span>
                                            </label>
                                            <label class="format-option">
                                                <input type="radio" name="export-format" value="json" onchange="exportImportModule.changeFormat('json')">
                                                <span class="format-card">
                                                    <i class="fas fa-file-code"></i>
                                                    <span>JSON (.json)</span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label>Дополнительные опции:</label>
                                        <div class="checkbox-group">
                                            <label class="checkbox-item">
                                                <input type="checkbox" id="include-relations" checked>
                                                <span>Включить связанные данные</span>
                                            </label>
                                            <label class="checkbox-item">
                                                <input type="checkbox" id="include-files">
                                                <span>Включить файлы и вложения</span>
                                            </label>
                                            <label class="checkbox-item">
                                                <input type="checkbox" id="include-archived">
                                                <span>Включить архивные записи</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label>Период данных:</label>
                                        <div class="date-range">
                                            <input type="date" id="export-date-from" class="form-control">
                                            <span>по</span>
                                            <input type="date" id="export-date-to" class="form-control">
                                        </div>
                                    </div>

                                    <div class="export-actions">
                                        <button class="btn btn-primary" onclick="exportImportModule.startExport()">
                                            <i class="fas fa-download"></i> Экспортировать
                                        </button>
                                        <button class="btn btn-outline" onclick="exportImportModule.previewExport()">
                                            <i class="fas fa-eye"></i> Предварительный просмотр
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Export Preview -->
                            <div class="preview-card card">
                                <div class="card-header">
                                    <h3><i class="fas fa-eye"></i> Предварительный просмотр</h3>
                                    <span class="record-count" id="export-record-count">0 записей</span>
                                </div>
                                <div class="card-body">
                                    <div id="export-preview" class="export-preview">
                                        <div class="preview-placeholder">
                                            <i class="fas fa-table"></i>
                                            <p>Выберите настройки экспорта для предварительного просмотра</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Export Progress -->
                        <div id="export-progress" class="progress-section" style="display: none;">
                            <div class="progress-card card">
                                <div class="card-body">
                                    <h4>Экспорт данных...</h4>
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="export-progress-fill"></div>
                                    </div>
                                    <div class="progress-text">
                                        <span id="export-progress-text">Подготовка данных...</span>
                                        <span id="export-progress-percent">0%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Import Tab -->
                <div id="import-tab" class="tab-content">
                    <div class="import-section">
                        <div class="section-grid">
                            <!-- File Upload -->
                            <div class="upload-card card">
                                <div class="card-header">
                                    <h3><i class="fas fa-cloud-upload-alt"></i> Загрузка файла</h3>
                                </div>
                                <div class="card-body">
                                    <div class="upload-area" id="upload-area" onclick="exportImportModule.triggerFileInput()">
                                        <div class="upload-content">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <h4>Перетащите файл сюда или нажмите для выбора</h4>
                                            <p>Поддерживаемые форматы: Excel (.xlsx), CSV (.csv), JSON (.json)</p>
                                            <button class="btn btn-primary">Выбрать файл</button>
                                        </div>
                                        <input type="file" id="import-file" accept=".xlsx,.csv,.json" style="display: none;">
                                    </div>
                                    
                                    <div id="file-info" class="file-info" style="display: none;">
                                        <div class="file-details">
                                            <i class="fas fa-file"></i>
                                            <div class="file-meta">
                                                <span class="file-name" id="file-name"></span>
                                                <span class="file-size" id="file-size"></span>
                                            </div>
                                            <button class="btn btn-sm btn-danger" onclick="exportImportModule.removeFile()">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Import Configuration -->
                            <div class="import-config-card card">
                                <div class="card-header">
                                    <h3><i class="fas fa-cog"></i> Настройки импорта</h3>
                                </div>
                                <div class="card-body">
                                    <div class="form-group">
                                        <label>Тип данных:</label>
                                        <select id="import-entity">
                                            <option value="auto">Автоопределение</option>
                                            <option value="projects">Проекты</option>
                                            <option value="clients">Клиенты</option>
                                            <option value="contractors">Подрядчики</option>
                                            <option value="employees">Сотрудники</option>
                                            <option value="warehouse">Складские позиции</option>
                                            <option value="estimates">Сметы</option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label>Действие при дублировании:</label>
                                        <select id="duplicate-action">
                                            <option value="skip">Пропустить</option>
                                            <option value="update">Обновить существующие</option>
                                            <option value="create">Создать новые</option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label>Дополнительные опции:</label>
                                        <div class="checkbox-group">
                                            <label class="checkbox-item">
                                                <input type="checkbox" id="validate-data" checked>
                                                <span>Валидация данных</span>
                                            </label>
                                            <label class="checkbox-item">
                                                <input type="checkbox" id="create-backup" checked>
                                                <span>Создать резервную копию</span>
                                            </label>
                                            <label class="checkbox-item">
                                                <input type="checkbox" id="send-notifications">
                                                <span>Отправить уведомления</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="import-actions">
                                        <button class="btn btn-primary" onclick="exportImportModule.startImport()" disabled id="start-import-btn">
                                            <i class="fas fa-upload"></i> Импортировать
                                        </button>
                                        <button class="btn btn-outline" onclick="exportImportModule.validateImport()" disabled id="validate-import-btn">
                                            <i class="fas fa-check"></i> Проверить данные
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Import Preview -->
                        <div id="import-preview-section" class="preview-section" style="display: none;">
                            <div class="preview-card card">
                                <div class="card-header">
                                    <h3><i class="fas fa-table"></i> Предварительный просмотр импорта</h3>
                                    <div class="preview-stats">
                                        <span class="stat"><span id="import-total-records">0</span> записей</span>
                                        <span class="stat success"><span id="import-valid-records">0</span> валидных</span>
                                        <span class="stat danger"><span id="import-error-records">0</span> ошибок</span>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div id="import-preview-table" class="import-preview-table">
                                        <!-- Preview table will be rendered here -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Import Progress -->
                        <div id="import-progress" class="progress-section" style="display: none;">
                            <div class="progress-card card">
                                <div class="card-body">
                                    <h4>Импорт данных...</h4>
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="import-progress-fill"></div>
                                    </div>
                                    <div class="progress-text">
                                        <span id="import-progress-text">Обработка файла...</span>
                                        <span id="import-progress-percent">0%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Templates Tab -->
                <div id="templates-tab" class="tab-content">
                    <div class="templates-section">
                        <div class="section-header">
                            <h2>Шаблоны для импорта</h2>
                            <p>Скачайте готовые шаблоны для корректного импорта данных</p>
                        </div>

                        <div class="templates-grid">
                            <div class="template-card card">
                                <div class="card-body">
                                    <div class="template-icon">
                                        <i class="fas fa-project-diagram"></i>
                                    </div>
                                    <h3>Проекты</h3>
                                    <p>Шаблон для импорта проектов с полной информацией</p>
                                    <div class="template-actions">
                                        <button class="btn btn-primary" onclick="exportImportModule.downloadTemplate('projects')">
                                            <i class="fas fa-download"></i> Excel
                                        </button>
                                        <button class="btn btn-outline" onclick="exportImportModule.downloadTemplate('projects', 'csv')">
                                            <i class="fas fa-file-csv"></i> CSV
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="template-card card">
                                <div class="card-body">
                                    <div class="template-icon">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <h3>Клиенты</h3>
                                    <p>Шаблон для массового импорта клиентской базы</p>
                                    <div class="template-actions">
                                        <button class="btn btn-primary" onclick="exportImportModule.downloadTemplate('clients')">
                                            <i class="fas fa-download"></i> Excel
                                        </button>
                                        <button class="btn btn-outline" onclick="exportImportModule.downloadTemplate('clients', 'csv')">
                                            <i class="fas fa-file-csv"></i> CSV
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="template-card card">
                                <div class="card-body">
                                    <div class="template-icon">
                                        <i class="fas fa-user-tie"></i>
                                    </div>
                                    <h3>Сотрудники</h3>
                                    <p>Шаблон для импорта данных о персонале</p>
                                    <div class="template-actions">
                                        <button class="btn btn-primary" onclick="exportImportModule.downloadTemplate('employees')">
                                            <i class="fas fa-download"></i> Excel
                                        </button>
                                        <button class="btn btn-outline" onclick="exportImportModule.downloadTemplate('employees', 'csv')">
                                            <i class="fas fa-file-csv"></i> CSV
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="template-card card">
                                <div class="card-body">
                                    <div class="template-icon">
                                        <i class="fas fa-boxes"></i>
                                    </div>
                                    <h3>Складские позиции</h3>
                                    <p>Шаблон для импорта товаров и материалов</p>
                                    <div class="template-actions">
                                        <button class="btn btn-primary" onclick="exportImportModule.downloadTemplate('warehouse')">
                                            <i class="fas fa-download"></i> Excel
                                        </button>
                                        <button class="btn btn-outline" onclick="exportImportModule.downloadTemplate('warehouse', 'csv')">
                                            <i class="fas fa-file-csv"></i> CSV
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- History Tab -->
                <div id="history-tab" class="tab-content">
                    <div class="history-section">
                        <div class="section-header">
                            <h2>История операций</h2>
                            <div class="history-filters">
                                <select id="history-filter">
                                    <option value="all">Все операции</option>
                                    <option value="export">Только экспорт</option>
                                    <option value="import">Только импорт</option>
                                </select>
                                <input type="date" id="history-date" class="form-control">
                            </div>
                        </div>

                        <div class="history-list" id="history-list">
                            <!-- History items will be rendered here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Switch between tabs
    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Load tab-specific data
        if (tabName === 'history') {
            this.loadHistory();
        }
    }

    // Change export entity
    changeEntity(entity) {
        this.currentEntity = entity;
        this.loadExportData();
    }

    // Change export format
    changeFormat(format) {
        this.currentFormat = format;
        this.updateFormatPreview();
    }

    // Load export data for preview
    async loadExportData() {
        try {
            // Simulate loading data based on selected entity
            const data = await this.getEntityData(this.currentEntity);
            this.exportData = data;
            this.updateExportPreview();
        } catch (error) {
            console.error('Error loading export data:', error);
            NotificationManager.error('Ошибка загрузки данных для экспорта');
        }
    }

    // Get entity data (simulated)
    async getEntityData(entity) {
        const mockData = {
            projects: [
                { id: 1, name: 'Дом на Пушкина, 15', client: 'ООО "Стройинвест"', status: 'В работе', budget: 5000000 },
                { id: 2, name: 'Офис на Ленина, 82', client: 'ИП Петров А.В.', status: 'Планирование', budget: 2500000 },
                { id: 3, name: 'Коттедж в Сосновке', client: 'Иванов И.И.', status: 'Завершен', budget: 3200000 }
            ],
            clients: [
                { id: 1, name: 'ООО "Стройинвест"', type: 'Юридическое лицо', phone: '+7 123 456-78-90', email: 'info@stroyinvest.ru' },
                { id: 2, name: 'ИП Петров А.В.', type: 'ИП', phone: '+7 987 654-32-10', email: 'petrov@example.com' },
                { id: 3, name: 'Иванов И.И.', type: 'Физическое лицо', phone: '+7 555 123-45-67', email: 'ivanov@example.com' }
            ],
            employees: [
                { id: 1, name: 'Сидоров А.А.', position: 'Прораб', department: 'Строительство', salary: 80000 },
                { id: 2, name: 'Петрова О.В.', position: 'Сметчик', department: 'ПТО', salary: 70000 },
                { id: 3, name: 'Иванов С.С.', position: 'Снабженец', department: 'Снабжение', salary: 60000 }
            ],
            warehouse: [
                { id: 1, name: 'Арматура d12', category: 'Стройматериалы', quantity: 250, unit: 'м', price: 85.50 },
                { id: 2, name: 'Цемент М400', category: 'Стройматериалы', quantity: 15, unit: 'т', price: 4500.00 },
                { id: 3, name: 'Кирпич красный', category: 'Стройматериалы', quantity: 5000, unit: 'шт', price: 12.50 }
            ]
        };

        if (entity === 'all') {
            return Object.values(mockData).flat();
        }

        return mockData[entity] || [];
    }

    // Update export preview
    updateExportPreview() {
        const previewContainer = document.getElementById('export-preview');
        const recordCount = document.getElementById('export-record-count');
        
        if (!this.exportData || this.exportData.length === 0) {
            previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-table"></i>
                    <p>Нет данных для экспорта</p>
                </div>
            `;
            recordCount.textContent = '0 записей';
            return;
        }

        recordCount.textContent = `${this.exportData.length} записей`;

        // Create table preview
        const headers = Object.keys(this.exportData[0]);
        const tableHtml = `
            <div class="preview-table">
                <table>
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.exportData.slice(0, 5).map(row => `
                            <tr>
                                ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                        ${this.exportData.length > 5 ? `
                            <tr class="more-rows">
                                <td colspan="${headers.length}">... и еще ${this.exportData.length - 5} записей</td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
        `;

        previewContainer.innerHTML = tableHtml;
    }

    // Start export process
    async startExport() {
        try {
            const progressSection = document.getElementById('export-progress');
            const progressFill = document.getElementById('export-progress-fill');
            const progressText = document.getElementById('export-progress-text');
            const progressPercent = document.getElementById('export-progress-percent');

            progressSection.style.display = 'block';

            // Simulate export process
            const steps = [
                { text: 'Подготовка данных...', progress: 20 },
                { text: 'Обработка записей...', progress: 50 },
                { text: 'Формирование файла...', progress: 80 },
                { text: 'Завершение экспорта...', progress: 100 }
            ];

            for (let step of steps) {
                progressText.textContent = step.text;
                progressPercent.textContent = `${step.progress}%`;
                progressFill.style.width = `${step.progress}%`;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Generate download
            this.generateExportFile();
            
            progressSection.style.display = 'none';
            NotificationManager.success('Экспорт завершен успешно');

        } catch (error) {
            console.error('Export error:', error);
            NotificationManager.error('Ошибка экспорта данных');
        }
    }

    // Generate export file
    generateExportFile() {
        const filename = `${this.currentEntity}_${DateUtils.format(new Date(), 'YYYY-MM-DD')}.${this.currentFormat}`;
        
        let content = '';
        let mimeType = '';

        switch (this.currentFormat) {
            case 'excel':
                // Simulate Excel file generation
                content = this.generateExcelContent();
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'csv':
                content = this.generateCSVContent();
                mimeType = 'text/csv';
                break;
            case 'pdf':
                content = this.generatePDFContent();
                mimeType = 'application/pdf';
                break;
            case 'json':
                content = JSON.stringify(this.exportData, null, 2);
                mimeType = 'application/json';
                break;
        }

        // Create download link
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Generate CSV content
    generateCSVContent() {
        if (!this.exportData || this.exportData.length === 0) return '';
        
        const headers = Object.keys(this.exportData[0]);
        const csvRows = [headers.join(',')];
        
        for (let row of this.exportData) {
            const values = headers.map(header => {
                const value = row[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }

    // Generate Excel content (simplified)
    generateExcelContent() {
        return this.generateCSVContent(); // Simplified for demo
    }

    // Generate PDF content (simplified)
    generatePDFContent() {
        return this.generateCSVContent(); // Simplified for demo
    }

    // Preview export
    previewExport() {
        this.updateExportPreview();
        NotificationManager.info('Предварительный просмотр обновлен');
    }

    // Initialize event listeners
    initEventListeners() {
        // File upload handling
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('import-file');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });
    }

    // Trigger file input
    triggerFileInput() {
        document.getElementById('import-file').click();
    }

    // Handle file selection
    handleFileSelect(file) {
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const startImportBtn = document.getElementById('start-import-btn');
        const validateImportBtn = document.getElementById('validate-import-btn');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        fileInfo.style.display = 'block';
        
        startImportBtn.disabled = false;
        validateImportBtn.disabled = false;

        this.selectedFile = file;
        NotificationManager.success(`Файл ${file.name} выбран для импорта`);
    }

    // Remove selected file
    removeFile() {
        const fileInfo = document.getElementById('file-info');
        const startImportBtn = document.getElementById('start-import-btn');
        const validateImportBtn = document.getElementById('validate-import-btn');

        fileInfo.style.display = 'none';
        startImportBtn.disabled = true;
        validateImportBtn.disabled = true;
        
        this.selectedFile = null;
        document.getElementById('import-file').value = '';
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Validate import data
    async validateImport() {
        if (!this.selectedFile) {
            NotificationManager.error('Выберите файл для проверки');
            return;
        }

        try {
            const data = await this.parseFile(this.selectedFile);
            const validation = this.validateData(data);
            
            this.showImportPreview(data, validation);
            NotificationManager.success('Проверка данных завершена');
        } catch (error) {
            console.error('Validation error:', error);
            NotificationManager.error('Ошибка проверки файла');
        }
    }

    // Parse uploaded file
    async parseFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    let data = [];

                    if (file.name.endsWith('.json')) {
                        data = JSON.parse(content);
                    } else if (file.name.endsWith('.csv')) {
                        data = this.parseCSV(content);
                    } else {
                        // Simplified Excel parsing for demo
                        data = this.parseCSV(content);
                    }

                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    // Parse CSV content
    parseCSV(content) {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }

        return data;
    }

    // Validate import data
    validateData(data) {
        const validation = {
            total: data.length,
            valid: 0,
            errors: [],
            warnings: []
        };

        data.forEach((row, index) => {
            let isValid = true;

            // Basic validation rules
            if (!row.name || row.name.trim() === '') {
                validation.errors.push(`Строка ${index + 1}: отсутствует имя`);
                isValid = false;
            }

            if (row.email && !this.isValidEmail(row.email)) {
                validation.warnings.push(`Строка ${index + 1}: некорректный email`);
            }

            if (isValid) {
                validation.valid++;
            }
        });

        return validation;
    }

    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show import preview
    showImportPreview(data, validation) {
        const previewSection = document.getElementById('import-preview-section');
        const previewTable = document.getElementById('import-preview-table');
        
        // Update stats
        document.getElementById('import-total-records').textContent = validation.total;
        document.getElementById('import-valid-records').textContent = validation.valid;
        document.getElementById('import-error-records').textContent = validation.errors.length;

        // Create preview table
        if (data.length > 0) {
            const headers = Object.keys(data[0]);
            const tableHtml = `
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            ${headers.map(header => `<th>${header}</th>`).join('')}
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.slice(0, 10).map((row, index) => {
                            const hasError = validation.errors.some(error => error.includes(`Строка ${index + 1}`));
                            return `
                                <tr class="${hasError ? 'error' : 'valid'}">
                                    <td>${index + 1}</td>
                                    ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                                    <td>
                                        <span class="status-badge ${hasError ? 'error' : 'success'}">
                                            ${hasError ? 'Ошибка' : 'OK'}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
            previewTable.innerHTML = tableHtml;
        }

        previewSection.style.display = 'block';
    }

    // Start import process
    async startImport() {
        if (!this.selectedFile) {
            NotificationManager.error('Выберите файл для импорта');
            return;
        }

        try {
            const progressSection = document.getElementById('import-progress');
            const progressFill = document.getElementById('import-progress-fill');
            const progressText = document.getElementById('import-progress-text');
            const progressPercent = document.getElementById('import-progress-percent');

            progressSection.style.display = 'block';

            const data = await this.parseFile(this.selectedFile);
            const validation = this.validateData(data);

            if (validation.errors.length > 0) {
                NotificationManager.error('Найдены ошибки в данных. Исправьте их перед импортом.');
                progressSection.style.display = 'none';
                return;
            }

            // Simulate import process
            const steps = [
                { text: 'Подготовка к импорту...', progress: 20 },
                { text: 'Проверка данных...', progress: 40 },
                { text: 'Импорт записей...', progress: 70 },
                { text: 'Завершение импорта...', progress: 100 }
            ];

            for (let step of steps) {
                progressText.textContent = step.text;
                progressPercent.textContent = `${step.progress}%`;
                progressFill.style.width = `${step.progress}%`;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            progressSection.style.display = 'none';
            NotificationManager.success(`Импорт завершен: ${validation.valid} записей добавлено`);

            // Add to history
            this.addToHistory('import', this.selectedFile.name, validation.valid);

        } catch (error) {
            console.error('Import error:', error);
            NotificationManager.error('Ошибка импорта данных');
        }
    }

    // Download template
    downloadTemplate(entity, format = 'excel') {
        const templates = {
            projects: {
                headers: ['name', 'client', 'status', 'budget', 'start_date', 'end_date'],
                data: [['Пример проекта', 'ООО "Клиент"', 'Планирование', '1000000', '2024-01-01', '2024-12-31']]
            },
            clients: {
                headers: ['name', 'type', 'phone', 'email', 'address'],
                data: [['ООО "Пример"', 'Юридическое лицо', '+7 123 456-78-90', 'example@company.ru', 'г. Москва']]
            },
            employees: {
                headers: ['name', 'position', 'department', 'phone', 'email'],
                data: [['Иванов И.И.', 'Прораб', 'Строительство', '+7 987 654-32-10', 'ivanov@company.ru']]
            },
            warehouse: {
                headers: ['name', 'category', 'unit', 'price', 'min_quantity'],
                data: [['Цемент М400', 'Стройматериалы', 'т', '4500', '5']]
            }
        };

        const template = templates[entity];
        if (!template) return;

        const csvContent = [
            template.headers.join(','),
            ...template.data.map(row => row.join(','))
        ].join('\n');

        const filename = `template_${entity}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        const mimeType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';

        const blob = new Blob([csvContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        NotificationManager.success(`Шаблон ${entity} скачан`);
    }

    // Load history
    loadHistory() {
        const historyList = document.getElementById('history-list');
        
        const history = this.getHistory();
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>История операций пуста</p>
                </div>
            `;
            return;
        }

        const historyHtml = history.map(item => `
            <div class="history-item card">
                <div class="history-content">
                    <div class="history-icon ${item.type}">
                        <i class="fas fa-${item.type === 'export' ? 'download' : 'upload'}"></i>
                    </div>
                    <div class="history-details">
                        <h4>${item.type === 'export' ? 'Экспорт' : 'Импорт'}: ${item.entity}</h4>
                        <p>${item.records} записей • ${item.filename}</p>
                        <small>${DateUtils.formatDateTime(item.date)}</small>
                    </div>
                </div>
                <div class="history-status">
                    <span class="status-badge success">Завершено</span>
                </div>
            </div>
        `).join('');

        historyList.innerHTML = historyHtml;
    }

    // Get history (mock data)
    getHistory() {
        return [
            {
                type: 'export',
                entity: 'Проекты',
                filename: 'projects_2024-01-15.xlsx',
                records: 25,
                date: new Date(2024, 0, 15, 14, 30)
            },
            {
                type: 'import',
                entity: 'Клиенты',
                filename: 'clients_import.csv',
                records: 150,
                date: new Date(2024, 0, 14, 10, 15)
            },
            {
                type: 'export',
                entity: 'Сотрудники',
                filename: 'employees_2024-01-10.pdf',
                records: 67,
                date: new Date(2024, 0, 10, 16, 45)
            }
        ];
    }

    // Add to history
    addToHistory(type, filename, records) {
        const historyItem = {
            type,
            entity: this.currentEntity,
            filename,
            records,
            date: new Date()
        };

        // In real app, this would be saved to database
        console.log('Added to history:', historyItem);
    }

    // Cleanup
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Create global instance
const exportImportModule = new ExportImportModule();

// Export for global access
window.ExportImportModule = ExportImportModule;
window.exportImportModule = exportImportModule;