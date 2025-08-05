// Settings module for Construction CRM
// Модуль настроек

class SettingsModule {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('Settings module initialized');
    }
}

const settingsModule = new SettingsModule();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsModule;
}