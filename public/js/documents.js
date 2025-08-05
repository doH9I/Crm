// Documents module for Construction CRM
// Модуль документов

class DocumentsModule {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('Documents module initialized');
    }
}

const documentsModule = new DocumentsModule();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentsModule;
}