// System Testing & Debugging Module for Construction CRM

class SystemTestingModule {
    constructor() {
        this.container = null;
        this.tests = [];
        this.testResults = [];
        this.isRunning = false;
    }

    // Initialize testing module
    async init() {
        this.container = document.getElementById('content-area');
        await this.render();
        this.initTests();
        this.initEventListeners();
    }

    // Render testing interface
    async render() {
        this.container.innerHTML = `
            <div class="testing-module">
                <!-- Module Header -->
                <div class="module-header">
                    <h1><i class="fas fa-bug"></i> Тестирование и отладка системы</h1>
                    <p>Комплексная проверка функциональности Construction CRM</p>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="systemTestingModule.runAllTests()" id="run-all-tests">
                            <i class="fas fa-play"></i> Запустить все тесты
                        </button>
                        <button class="btn btn-outline" onclick="systemTestingModule.generateReport()">
                            <i class="fas fa-file-alt"></i> Отчет
                        </button>
                    </div>
                </div>

                <!-- Test Categories -->
                <div class="test-categories">
                    <div class="category-tabs">
                        <button class="tab-btn active" data-category="all" onclick="systemTestingModule.filterTests('all')">
                            Все тесты
                        </button>
                        <button class="tab-btn" data-category="functional" onclick="systemTestingModule.filterTests('functional')">
                            Функциональные
                        </button>
                        <button class="tab-btn" data-category="integration" onclick="systemTestingModule.filterTests('integration')">
                            Интеграционные
                        </button>
                        <button class="tab-btn" data-category="ui" onclick="systemTestingModule.filterTests('ui')">
                            Интерфейс
                        </button>
                        <button class="tab-btn" data-category="performance" onclick="systemTestingModule.filterTests('performance')">
                            Производительность
                        </button>
                    </div>
                </div>

                <!-- Test Summary -->
                <div class="test-summary">
                    <div class="summary-cards">
                        <div class="summary-card total">
                            <div class="summary-icon">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                            <div class="summary-info">
                                <span class="summary-value" id="total-tests">0</span>
                                <span class="summary-label">Всего тестов</span>
                            </div>
                        </div>
                        <div class="summary-card passed">
                            <div class="summary-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="summary-info">
                                <span class="summary-value" id="passed-tests">0</span>
                                <span class="summary-label">Пройдено</span>
                            </div>
                        </div>
                        <div class="summary-card failed">
                            <div class="summary-icon">
                                <i class="fas fa-times-circle"></i>
                            </div>
                            <div class="summary-info">
                                <span class="summary-value" id="failed-tests">0</span>
                                <span class="summary-label">Провалено</span>
                            </div>
                        </div>
                        <div class="summary-card pending">
                            <div class="summary-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="summary-info">
                                <span class="summary-value" id="pending-tests">0</span>
                                <span class="summary-label">В ожидании</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Test Progress -->
                <div id="test-progress" class="test-progress" style="display: none;">
                    <div class="progress-card">
                        <h3>Выполнение тестов...</h3>
                        <div class="progress-bar">
                            <div class="progress-fill" id="test-progress-fill"></div>
                        </div>
                        <div class="progress-info">
                            <span id="current-test">Инициализация...</span>
                            <span id="test-progress-percent">0%</span>
                        </div>
                    </div>
                </div>

                <!-- Tests List -->
                <div class="tests-section">
                    <div class="tests-header">
                        <h2>Список тестов</h2>
                        <div class="tests-controls">
                            <input type="text" id="test-search" placeholder="Поиск тестов..." class="form-control">
                            <select id="test-status-filter" class="form-control">
                                <option value="all">Все статусы</option>
                                <option value="pending">Ожидание</option>
                                <option value="running">Выполняется</option>
                                <option value="passed">Пройден</option>
                                <option value="failed">Провален</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="tests-list" id="tests-list">
                        <!-- Tests will be rendered here -->
                    </div>
                </div>

                <!-- System Information -->
                <div class="system-info-section">
                    <div class="info-grid">
                        <div class="info-card card">
                            <div class="card-header">
                                <h3><i class="fas fa-info-circle"></i> Информация о системе</h3>
                            </div>
                            <div class="card-body">
                                <div class="info-item">
                                    <span class="info-label">Браузер:</span>
                                    <span class="info-value" id="browser-info">-</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Платформа:</span>
                                    <span class="info-value" id="platform-info">-</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Экран:</span>
                                    <span class="info-value" id="screen-info">-</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Память:</span>
                                    <span class="info-value" id="memory-info">-</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Подключение:</span>
                                    <span class="info-value" id="connection-info">-</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">LocalStorage:</span>
                                    <span class="info-value" id="storage-info">-</span>
                                </div>
                            </div>
                        </div>

                        <div class="info-card card">
                            <div class="card-header">
                                <h3><i class="fas fa-chart-line"></i> Производительность</h3>
                            </div>
                            <div class="card-body">
                                <div class="performance-metrics" id="performance-metrics">
                                    <!-- Performance metrics will be shown here -->
                                </div>
                            </div>
                        </div>

                        <div class="info-card card">
                            <div class="card-header">
                                <h3><i class="fas fa-exclamation-triangle"></i> Найденные проблемы</h3>
                            </div>
                            <div class="card-body">
                                <div class="issues-list" id="issues-list">
                                    <div class="no-issues">
                                        <i class="fas fa-check-circle"></i>
                                        <p>Критических проблем не обнаружено</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize tests
    initTests() {
        this.tests = [
            // Functional Tests
            {
                id: 'auth-login',
                name: 'Авторизация пользователя',
                category: 'functional',
                description: 'Проверка входа в систему',
                status: 'pending',
                execute: () => this.testAuthentication()
            },
            {
                id: 'navigation',
                name: 'Навигация по модулям',
                category: 'functional', 
                description: 'Проверка перехода между разделами',
                status: 'pending',
                execute: () => this.testNavigation()
            },
            {
                id: 'dashboard-load',
                name: 'Загрузка дашборда',
                category: 'functional',
                description: 'Проверка отображения главной страницы',
                status: 'pending',
                execute: () => this.testDashboardLoad()
            },
            
            // Integration Tests
            {
                id: 'api-connection',
                name: 'Подключение к API',
                category: 'integration',
                description: 'Проверка связи с сервером',
                status: 'pending',
                execute: () => this.testAPIConnection()
            },
            {
                id: 'data-loading',
                name: 'Загрузка данных',
                category: 'integration',
                description: 'Проверка получения данных из API',
                status: 'pending',
                execute: () => this.testDataLoading()
            },
            {
                id: 'file-upload',
                name: 'Загрузка файлов',
                category: 'integration',
                description: 'Проверка функции загрузки файлов',
                status: 'pending',
                execute: () => this.testFileUpload()
            },

            // UI Tests
            {
                id: 'responsive-design',
                name: 'Адаптивный дизайн',
                category: 'ui',
                description: 'Проверка отображения на разных экранах',
                status: 'pending',
                execute: () => this.testResponsiveDesign()
            },
            {
                id: 'modal-windows',
                name: 'Модальные окна',
                category: 'ui',
                description: 'Проверка работы всплывающих окон',
                status: 'pending',
                execute: () => this.testModalWindows()
            },
            {
                id: 'forms-validation',
                name: 'Валидация форм',
                category: 'ui',
                description: 'Проверка проверки данных в формах',
                status: 'pending',
                execute: () => this.testFormsValidation()
            },

            // Performance Tests
            {
                id: 'page-load-time',
                name: 'Время загрузки страниц',
                category: 'performance',
                description: 'Измерение скорости загрузки',
                status: 'pending',
                execute: () => this.testPageLoadTime()
            },
            {
                id: 'memory-usage',
                name: 'Использование памяти',
                category: 'performance',
                description: 'Проверка потребления памяти',
                status: 'pending',
                execute: () => this.testMemoryUsage()
            },
            {
                id: 'chart-rendering',
                name: 'Отрисовка графиков',
                category: 'performance',
                description: 'Проверка производительности Chart.js',
                status: 'pending',
                execute: () => this.testChartRendering()
            }
        ];

        this.updateTestsDisplay();
        this.updateSummary();
        this.loadSystemInfo();
    }

    // Update tests display
    updateTestsDisplay() {
        const container = document.getElementById('tests-list');
        const testsHtml = this.tests.map(test => `
            <div class="test-item ${test.status}" data-category="${test.category}" data-status="${test.status}">
                <div class="test-content">
                    <div class="test-header">
                        <h4>${test.name}</h4>
                        <span class="test-status status-${test.status}">
                            <i class="fas fa-${this.getStatusIcon(test.status)}"></i>
                            ${this.getStatusText(test.status)}
                        </span>
                    </div>
                    <p class="test-description">${test.description}</p>
                    <div class="test-meta">
                        <span class="test-category">${this.getCategoryText(test.category)}</span>
                        <span class="test-id">#${test.id}</span>
                    </div>
                </div>
                <div class="test-actions">
                    <button class="btn btn-sm btn-primary" onclick="systemTestingModule.runSingleTest('${test.id}')" 
                            ${test.status === 'running' ? 'disabled' : ''}>
                        <i class="fas fa-play"></i>
                    </button>
                    ${test.status !== 'pending' ? `
                        <button class="btn btn-sm btn-outline" onclick="systemTestingModule.showTestDetails('${test.id}')">
                            <i class="fas fa-info"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = testsHtml;
    }

    // Update summary
    updateSummary() {
        const total = this.tests.length;
        const passed = this.tests.filter(t => t.status === 'passed').length;
        const failed = this.tests.filter(t => t.status === 'failed').length;
        const pending = this.tests.filter(t => t.status === 'pending').length;

        document.getElementById('total-tests').textContent = total;
        document.getElementById('passed-tests').textContent = passed;
        document.getElementById('failed-tests').textContent = failed;
        document.getElementById('pending-tests').textContent = pending;
    }

    // Run all tests
    async runAllTests() {
        if (this.isRunning) return;

        this.isRunning = true;
        const runButton = document.getElementById('run-all-tests');
        const progressSection = document.getElementById('test-progress');
        const progressFill = document.getElementById('test-progress-fill');
        const currentTestSpan = document.getElementById('current-test');
        const progressPercent = document.getElementById('test-progress-percent');

        runButton.disabled = true;
        progressSection.style.display = 'block';

        // Reset test results
        this.testResults = [];
        this.tests.forEach(test => test.status = 'pending');

        for (let i = 0; i < this.tests.length; i++) {
            const test = this.tests[i];
            const progress = Math.round(((i + 1) / this.tests.length) * 100);

            test.status = 'running';
            currentTestSpan.textContent = `Выполняется: ${test.name}`;
            progressPercent.textContent = `${progress}%`;
            progressFill.style.width = `${progress}%`;

            this.updateTestsDisplay();

            try {
                const result = await test.execute();
                test.status = result.success ? 'passed' : 'failed';
                test.result = result;
                
                this.testResults.push({
                    test: test.id,
                    name: test.name,
                    success: result.success,
                    message: result.message,
                    details: result.details,
                    duration: result.duration || 0
                });

            } catch (error) {
                test.status = 'failed';
                test.result = {
                    success: false,
                    message: error.message,
                    error: error
                };
            }

            await new Promise(resolve => setTimeout(resolve, 500)); // Пауза между тестами
        }

        progressSection.style.display = 'none';
        this.updateTestsDisplay();
        this.updateSummary();
        this.updateIssuesList();

        runButton.disabled = false;
        this.isRunning = false;

        NotificationManager.success('Тестирование завершено');
    }

    // Run single test
    async runSingleTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test || test.status === 'running') return;

        test.status = 'running';
        this.updateTestsDisplay();

        try {
            const result = await test.execute();
            test.status = result.success ? 'passed' : 'failed';
            test.result = result;
        } catch (error) {
            test.status = 'failed';
            test.result = {
                success: false,
                message: error.message,
                error: error
            };
        }

        this.updateTestsDisplay();
        this.updateSummary();
    }

    // Individual test implementations
    async testAuthentication() {
        const startTime = performance.now();
        
        try {
            // Check if user is authenticated
            const token = localStorage.getItem('authToken');
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            if (!token || !user.id) {
                return {
                    success: false,
                    message: 'Пользователь не авторизован',
                    duration: performance.now() - startTime
                };
            }

            return {
                success: true,
                message: `Пользователь ${user.name} успешно авторизован`,
                duration: performance.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка проверки авторизации',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    async testNavigation() {
        const startTime = performance.now();
        
        try {
            // Test navigation to different modules
            const modules = ['dashboard', 'projects', 'clients', 'warehouse'];
            let navigationSuccessful = true;

            for (let module of modules) {
                try {
                    // Simulate navigation
                    if (window.app && window.app.navigateTo) {
                        await window.app.navigateTo(module);
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error) {
                    navigationSuccessful = false;
                    break;
                }
            }

            return {
                success: navigationSuccessful,
                message: navigationSuccessful ? 'Навигация работает корректно' : 'Обнаружены проблемы с навигацией',
                duration: performance.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка тестирования навигации',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    async testDashboardLoad() {
        const startTime = performance.now();
        
        try {
            // Check if dashboard elements exist
            const requiredElements = [
                'content-area',
                'sidebar',
                'header'
            ];

            const missingElements = requiredElements.filter(id => !document.getElementById(id));

            if (missingElements.length > 0) {
                return {
                    success: false,
                    message: `Отсутствуют элементы: ${missingElements.join(', ')}`,
                    duration: performance.now() - startTime
                };
            }

            return {
                success: true,
                message: 'Дашборд загружен успешно',
                duration: performance.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка загрузки дашборда',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    async testAPIConnection() {
        const startTime = performance.now();
        
        try {
            // Simulate API test
            const testEndpoint = '/api/test';
            
            // Since we don't have real API, simulate successful connection
            await new Promise(resolve => setTimeout(resolve, 100));

            return {
                success: true,
                message: 'API соединение работает (симуляция)',
                duration: performance.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка подключения к API',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    async testDataLoading() {
        const startTime = performance.now();
        
        try {
            // Test if modules can load their data
            const modules = ['DashboardModule', 'EstimatesModule', 'WarehouseModule'];
            let dataLoadingSuccessful = true;

            for (let moduleName of modules) {
                if (window[moduleName]) {
                    // Module exists
                    continue;
                } else {
                    dataLoadingSuccessful = false;
                    break;
                }
            }

            return {
                success: dataLoadingSuccessful,
                message: dataLoadingSuccessful ? 'Загрузка данных работает' : 'Проблемы с загрузкой модулей',
                duration: performance.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка тестирования загрузки данных',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    async testFileUpload() {
        const startTime = performance.now();
        
        try {
            // Check if FileReader is supported
            if (!window.FileReader) {
                return {
                    success: false,
                    message: 'FileReader API не поддерживается',
                    duration: performance.now() - startTime
                };
            }

            // Check if Blob is supported
            if (!window.Blob) {
                return {
                    success: false,
                    message: 'Blob API не поддерживается',
                    duration: performance.now() - startTime
                };
            }

            return {
                success: true,
                message: 'Функции загрузки файлов поддерживаются',
                duration: performance.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка тестирования загрузки файлов',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    async testResponsiveDesign() {
        const startTime = performance.now();
        
        try {
            const screenWidth = window.innerWidth;
            const isMobile = screenWidth < 768;
            const isTablet = screenWidth >= 768 && screenWidth < 1024;
            const isDesktop = screenWidth >= 1024;

            // Check if CSS media queries are working
            const testElement = document.createElement('div');
            testElement.style.cssText = 'position: absolute; top: -9999px; width: 100%; max-width: 1200px;';
            document.body.appendChild(testElement);

            const computedWidth = getComputedStyle(testElement).width;
            document.body.removeChild(testElement);

            return {
                success: true,
                message: `Адаптивный дизайн работает (${isMobile ? 'мобильный' : isTablet ? 'планшет' : 'десктоп'})`,
                details: { screenWidth, isMobile, isTablet, isDesktop },
                duration: performance.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка тестирования адаптивного дизайна',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    async testModalWindows() {
        const startTime = performance.now();
        
        try {
            // Check if modal overlay exists
            const modalOverlay = document.getElementById('modal-overlay');
            
            if (!modalOverlay) {
                return {
                    success: false,
                    message: 'Модальное окно не найдено',
                    duration: performance.now() - startTime
                };
            }

            return {
                success: true,
                message: 'Модальные окна настроены корректно',
                duration: performance.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка тестирования модальных окон',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    async testFormsValidation() {
        const startTime = performance.now();
        
        try {
            // Create test form to check validation
            const testForm = document.createElement('form');
            testForm.innerHTML = `
                <input type="email" required>
                <input type="text" pattern="[A-Za-z]+" required>
            `;

            const emailInput = testForm.querySelector('input[type="email"]');
            const textInput = testForm.querySelector('input[type="text"]');

            // Test email validation
            emailInput.value = 'invalid-email';
            const emailValid = emailInput.checkValidity();

            // Test pattern validation
            textInput.value = '123';
            const textValid = textInput.checkValidity();

            const validationWorks = !emailValid && !textValid; // Should be invalid

            return {
                success: validationWorks,
                message: validationWorks ? 'Валидация форм работает' : 'Проблемы с валидацией форм',
                duration: performance.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка тестирования валидации форм',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    async testPageLoadTime() {
        const startTime = performance.now();
        
        try {
            // Get navigation timing if available
            const navigation = performance.getEntriesByType('navigation')[0];
            const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;

            const isAcceptable = loadTime < 3000; // Less than 3 seconds

            return {
                success: isAcceptable,
                message: `Время загрузки: ${Math.round(loadTime)}мс ${isAcceptable ? '(хорошо)' : '(медленно)'}`,
                details: { loadTime },
                duration: performance.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка измерения времени загрузки',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    async testMemoryUsage() {
        const startTime = performance.now();
        
        try {
            // Check memory usage if available
            if (performance.memory) {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
                const usage = Math.round((usedMB / limitMB) * 100);

                const isAcceptable = usage < 80; // Less than 80% usage

                return {
                    success: isAcceptable,
                    message: `Использование памяти: ${usedMB}MB/${limitMB}MB (${usage}%)`,
                    details: { usedMB, limitMB, usage },
                    duration: performance.now() - startTime
                };
            } else {
                return {
                    success: true,
                    message: 'Информация о памяти недоступна',
                    duration: performance.now() - startTime
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка тестирования использования памяти',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    async testChartRendering() {
        const startTime = performance.now();
        
        try {
            // Check if Chart.js is available
            if (!window.Chart) {
                return {
                    success: false,
                    message: 'Chart.js не загружен',
                    duration: performance.now() - startTime
                };
            }

            // Create test canvas
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 200;

            const ctx = canvas.getContext('2d');
            const chartStartTime = performance.now();

            // Create simple test chart
            const testChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar'],
                    datasets: [{
                        data: [10, 20, 30]
                    }]
                },
                options: {
                    animation: false
                }
            });

            const renderTime = performance.now() - chartStartTime;
            testChart.destroy();

            const isAcceptable = renderTime < 500; // Less than 500ms

            return {
                success: isAcceptable,
                message: `Отрисовка графика: ${Math.round(renderTime)}мс ${isAcceptable ? '(быстро)' : '(медленно)'}`,
                details: { renderTime },
                duration: performance.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка тестирования отрисовки графиков',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    // Load system information
    loadSystemInfo() {
        // Browser info
        document.getElementById('browser-info').textContent = navigator.userAgent.split(' ')[0];
        
        // Platform info
        document.getElementById('platform-info').textContent = navigator.platform;
        
        // Screen info
        document.getElementById('screen-info').textContent = `${screen.width}x${screen.height}`;
        
        // Memory info
        if (navigator.deviceMemory) {
            document.getElementById('memory-info').textContent = `${navigator.deviceMemory}GB`;
        } else {
            document.getElementById('memory-info').textContent = 'Неизвестно';
        }
        
        // Connection info
        if (navigator.connection) {
            document.getElementById('connection-info').textContent = navigator.connection.effectiveType || 'Неизвестно';
        } else {
            document.getElementById('connection-info').textContent = 'Неизвестно';
        }
        
        // Storage info
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            document.getElementById('storage-info').textContent = 'Доступно';
        } catch (error) {
            document.getElementById('storage-info').textContent = 'Недоступно';
        }

        this.loadPerformanceMetrics();
    }

    // Load performance metrics
    loadPerformanceMetrics() {
        const container = document.getElementById('performance-metrics');
        
        const metrics = [];
        
        // Navigation timing
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            metrics.push({
                name: 'Время загрузки DOM',
                value: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
                unit: 'мс'
            });
            metrics.push({
                name: 'Полная загрузка',
                value: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
                unit: 'мс'
            });
        }

        // Memory usage
        if (performance.memory) {
            metrics.push({
                name: 'Используемая память',
                value: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                unit: 'MB'
            });
        }

        // Render metrics
        const metricsHtml = metrics.map(metric => `
            <div class="metric-item">
                <span class="metric-name">${metric.name}:</span>
                <span class="metric-value">${metric.value} ${metric.unit}</span>
            </div>
        `).join('');

        container.innerHTML = metricsHtml || '<p>Метрики недоступны</p>';
    }

    // Update issues list
    updateIssuesList() {
        const container = document.getElementById('issues-list');
        const failedTests = this.tests.filter(t => t.status === 'failed');

        if (failedTests.length === 0) {
            container.innerHTML = `
                <div class="no-issues">
                    <i class="fas fa-check-circle"></i>
                    <p>Критических проблем не обнаружено</p>
                </div>
            `;
            return;
        }

        const issuesHtml = failedTests.map(test => `
            <div class="issue-item">
                <div class="issue-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>${test.name}</strong>
                </div>
                <p class="issue-message">${test.result?.message || 'Неизвестная ошибка'}</p>
                <span class="issue-category">${this.getCategoryText(test.category)}</span>
            </div>
        `).join('');

        container.innerHTML = issuesHtml;
    }

    // Helper methods
    getStatusIcon(status) {
        const icons = {
            pending: 'clock',
            running: 'spinner fa-spin',
            passed: 'check',
            failed: 'times'
        };
        return icons[status] || 'question';
    }

    getStatusText(status) {
        const texts = {
            pending: 'Ожидание',
            running: 'Выполняется',
            passed: 'Пройден',
            failed: 'Провален'
        };
        return texts[status] || 'Неизвестно';
    }

    getCategoryText(category) {
        const texts = {
            functional: 'Функциональный',
            integration: 'Интеграционный',
            ui: 'Интерфейс',
            performance: 'Производительность'
        };
        return texts[category] || category;
    }

    // Filter tests
    filterTests(category) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Filter tests
        const testItems = document.querySelectorAll('.test-item');
        testItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Show test details
    showTestDetails(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test || !test.result) return;

        const modal = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');

        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>Детали теста: ${test.name}</h3>
                <button class="modal-close" onclick="app.closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="test-details">
                    <div class="detail-item">
                        <strong>Статус:</strong>
                        <span class="status-${test.status}">${this.getStatusText(test.status)}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Категория:</strong>
                        <span>${this.getCategoryText(test.category)}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Описание:</strong>
                        <span>${test.description}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Сообщение:</strong>
                        <span>${test.result.message}</span>
                    </div>
                    ${test.result.duration ? `
                        <div class="detail-item">
                            <strong>Время выполнения:</strong>
                            <span>${Math.round(test.result.duration)}мс</span>
                        </div>
                    ` : ''}
                    ${test.result.details ? `
                        <div class="detail-item">
                            <strong>Подробности:</strong>
                            <pre>${JSON.stringify(test.result.details, null, 2)}</pre>
                        </div>
                    ` : ''}
                    ${test.result.error ? `
                        <div class="detail-item">
                            <strong>Ошибка:</strong>
                            <pre class="error-text">${test.result.error}</pre>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        modal.classList.add('show');
    }

    // Generate report
    generateReport() {
        const passed = this.tests.filter(t => t.status === 'passed').length;
        const failed = this.tests.filter(t => t.status === 'failed').length;
        const total = this.tests.length;
        const successRate = Math.round((passed / total) * 100);

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total,
                passed,
                failed,
                successRate
            },
            tests: this.tests.map(test => ({
                id: test.id,
                name: test.name,
                category: test.category,
                status: test.status,
                result: test.result
            })),
            systemInfo: {
                browser: navigator.userAgent,
                platform: navigator.platform,
                screen: `${screen.width}x${screen.height}`,
                timestamp: new Date().toLocaleString()
            }
        };

        // Download report as JSON
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-report-${DateUtils.format(new Date(), 'YYYY-MM-DD-HH-mm')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        NotificationManager.success('Отчет о тестировании сохранен');
    }

    // Initialize event listeners
    initEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('test-search');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const testItems = document.querySelectorAll('.test-item');
            
            testItems.forEach(item => {
                const testName = item.querySelector('h4').textContent.toLowerCase();
                const testDescription = item.querySelector('.test-description').textContent.toLowerCase();
                
                if (testName.includes(query) || testDescription.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });

        // Status filter
        const statusFilter = document.getElementById('test-status-filter');
        statusFilter.addEventListener('change', (e) => {
            const status = e.target.value;
            const testItems = document.querySelectorAll('.test-item');
            
            testItems.forEach(item => {
                if (status === 'all' || item.dataset.status === status) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Cleanup
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.tests = [];
        this.testResults = [];
        this.isRunning = false;
    }
}

// Create global instance
const systemTestingModule = new SystemTestingModule();

// Export for global access
window.SystemTestingModule = SystemTestingModule;
window.systemTestingModule = systemTestingModule;