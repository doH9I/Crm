// Mock database для тестирования без реальной MySQL
const bcrypt = require('bcryptjs');

class MockDatabase {
    constructor() {
        this.users = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@construction-crm.com',
                password_hash: bcrypt.hashSync('admin123', 10),
                first_name: 'Администратор',
                last_name: 'Системы',
                role: 'admin',
                is_active: true,
                created_at: new Date()
            }
        ];
        
        this.projects = [];
        this.clients = [];
        this.contractors = [];
        this.employees = [];
        this.warehouse_items = [];
        this.system_logs = [];
    }

    async execute(query, params = []) {
        console.log('Mock DB Query:', query, params);
        
        // Простая обработка основных запросов
        if (query.includes('SELECT * FROM users WHERE')) {
            if (query.includes('username = ?') || query.includes('email = ?')) {
                const user = this.users.find(u => 
                    u.username === params[0] || u.email === params[0] ||
                    u.username === params[1] || u.email === params[1]
                );
                return [user ? [user] : []];
            }
            if (query.includes('id = ?')) {
                const user = this.users.find(u => u.id === params[0]);
                return [user ? [user] : []];
            }
        }
        
        if (query.includes('UPDATE users SET last_login')) {
            return [{ affectedRows: 1 }];
        }
        
        if (query.includes('SELECT * FROM projects')) {
            return [this.projects];
        }
        
        if (query.includes('SELECT * FROM clients')) {
            return [this.clients];
        }
        
        if (query.includes('SELECT * FROM contractors')) {
            return [this.contractors];
        }
        
        if (query.includes('SELECT * FROM employees')) {
            return [this.employees];
        }
        
        if (query.includes('SELECT * FROM warehouse_items')) {
            return [this.warehouse_items];
        }
        
        // Dashboard queries
        if (query.includes('COUNT(*) as total_projects')) {
            return [{
                total_projects: this.projects.length,
                planning_projects: this.projects.filter(p => p.status === 'planning').length,
                active_projects: this.projects.filter(p => p.status === 'construction').length,
                completed_projects: this.projects.filter(p => p.status === 'completed').length,
                total_budget: this.projects.reduce((sum, p) => sum + (p.budget || 0), 0),
                total_spent: this.projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0),
                avg_progress: this.projects.reduce((sum, p) => sum + (p.progress || 0), 0) / Math.max(this.projects.length, 1)
            }];
        }
        
        if (query.includes('COUNT(*) as total_clients')) {
            return [{
                total_clients: this.clients.length,
                active_clients: this.clients.filter(c => c.status === 'active').length,
                potential_clients: this.clients.filter(c => c.status === 'potential').length
            }];
        }
        
        if (query.includes('COUNT(*) as total_employees')) {
            return [{
                total_employees: this.employees.length,
                active_employees: this.employees.filter(e => e.status === 'active').length,
                on_vacation: this.employees.filter(e => e.status === 'vacation').length
            }];
        }
        
        // Recent projects
        if (query.includes('SELECT p.id, p.name, p.status, p.progress, c.name as client_name')) {
            return [[]]; // Пустой массив последних проектов
        }
        
        // Urgent tasks
        if (query.includes('SELECT pt.id, pt.name, pt.status, pt.end_date, p.name as project_name')) {
            return [[]]; // Пустой массив срочных задач
        }
        
        // Low stock
        if (query.includes('SELECT name, current_quantity, min_quantity, unit')) {
            return [[]]; // Пустой массив товаров с низким остатком
        }
        
        // Financial stats
        if (query.includes('SUM(CASE WHEN type = \'receipt\'')) {
            return [{
                income: 0,
                expenses: 0
            }];
        }
        
        // COUNT queries
        if (query.includes('COUNT(*) as total')) {
            return [{
                total: 0
            }];
        }
        
        // INSERT queries
        if (query.includes('INSERT INTO system_logs')) {
            return [{ insertId: Date.now() }];
        }
        
        // Default response
        return [[]];
    }
}

module.exports = MockDatabase;