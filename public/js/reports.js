// Reports module for Construction CRM
// Модуль отчетов

class ReportsModule {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('Reports module initialized');
    }
}

const reportsModule = new ReportsModule();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportsModule;
}