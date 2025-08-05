// Estimates module for Construction CRM
// Модуль смет

class EstimatesModule {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('Estimates module initialized');
    }
}

const estimatesModule = new EstimatesModule();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EstimatesModule;
}