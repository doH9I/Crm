// Offers module for Construction CRM
// Модуль коммерческих предложений

class OffersModule {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('Offers module initialized');
    }
}

const offersModule = new OffersModule();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = OffersModule;
}