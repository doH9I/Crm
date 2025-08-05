// Materials module for Construction CRM
// Модуль материалов

class MaterialsModule {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('Materials module initialized');
    }
}

const materialsModule = new MaterialsModule();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaterialsModule;
}