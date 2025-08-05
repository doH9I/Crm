-- Создание базы данных
CREATE DATABASE IF NOT EXISTS construction_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE construction_crm;

-- Таблица пользователей
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    phone VARCHAR(20),
    role ENUM('admin', 'general_director', 'construction_director', 'site_manager', 'foreman', 'estimator', 'pto_employee', 'procurement') NOT NULL,
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица клиентов
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('individual', 'legal') NOT NULL,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    inn VARCHAR(12),
    kpp VARCHAR(9),
    ogrn VARCHAR(15),
    address TEXT,
    legal_address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    bank_name VARCHAR(255),
    bank_account VARCHAR(20),
    bank_bik VARCHAR(9),
    status ENUM('active', 'inactive', 'potential') DEFAULT 'potential',
    source VARCHAR(100),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица подрядчиков
CREATE TABLE contractors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    inn VARCHAR(12),
    kpp VARCHAR(9),
    ogrn VARCHAR(15),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    bank_name VARCHAR(255),
    bank_account VARCHAR(20),
    bank_bik VARCHAR(9),
    specialization TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    status ENUM('active', 'inactive', 'blacklist') DEFAULT 'active',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица проектов
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id INT NOT NULL,
    type ENUM('residential', 'commercial', 'industrial', 'renovation') NOT NULL,
    status ENUM('planning', 'design', 'approval', 'construction', 'completion', 'warranty', 'closed') DEFAULT 'planning',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0.00,
    address TEXT,
    total_area DECIMAL(10,2),
    building_floors INT,
    project_manager_id INT,
    site_manager_id INT,
    foreman_id INT,
    progress DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (project_manager_id) REFERENCES users(id),
    FOREIGN KEY (site_manager_id) REFERENCES users(id),
    FOREIGN KEY (foreman_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица задач проекта
CREATE TABLE project_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('design', 'preparation', 'foundation', 'walls', 'roof', 'utilities', 'finishing', 'other') NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    assigned_to INT,
    contractor_id INT,
    start_date DATE,
    end_date DATE,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2) DEFAULT 0.00,
    progress DECIMAL(5,2) DEFAULT 0.00,
    dependencies TEXT,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (contractor_id) REFERENCES contractors(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица сотрудников
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    employee_number VARCHAR(20) UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2),
    hourly_rate DECIMAL(8,2),
    status ENUM('active', 'vacation', 'sick', 'terminated') DEFAULT 'active',
    passport_series VARCHAR(10),
    passport_number VARCHAR(10),
    passport_issued_by TEXT,
    passport_issued_date DATE,
    inn VARCHAR(12),
    snils VARCHAR(14),
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица табеля рабочего времени
CREATE TABLE timesheet (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    project_id INT,
    work_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    break_time DECIMAL(4,2) DEFAULT 0.00,
    worked_hours DECIMAL(6,2) NOT NULL,
    overtime_hours DECIMAL(6,2) DEFAULT 0.00,
    work_type ENUM('normal', 'overtime', 'weekend', 'holiday', 'sick', 'vacation') DEFAULT 'normal',
    description TEXT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY unique_employee_date (employee_id, work_date)
);

-- Таблица складских позиций
CREATE TABLE warehouse_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(20) NOT NULL,
    article VARCHAR(50),
    barcode VARCHAR(50),
    min_quantity DECIMAL(10,3) DEFAULT 0.000,
    current_quantity DECIMAL(10,3) DEFAULT 0.000,
    reserved_quantity DECIMAL(10,3) DEFAULT 0.000,
    cost_price DECIMAL(12,2),
    selling_price DECIMAL(12,2),
    supplier VARCHAR(255),
    storage_location VARCHAR(100),
    status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица движения склада
CREATE TABLE warehouse_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    project_id INT,
    type ENUM('receipt', 'issue', 'return', 'write_off', 'transfer') NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    cost_price DECIMAL(12,2),
    total_cost DECIMAL(15,2),
    document_number VARCHAR(50),
    document_date DATE,
    reason TEXT,
    from_location VARCHAR(100),
    to_location VARCHAR(100),
    responsible_person INT,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES warehouse_items(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (responsible_person) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица смет
CREATE TABLE estimates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('preliminary', 'detailed', 'final') DEFAULT 'preliminary',
    status ENUM('draft', 'review', 'approved', 'rejected') DEFAULT 'draft',
    version INT DEFAULT 1,
    total_cost DECIMAL(15,2) DEFAULT 0.00,
    profit_margin DECIMAL(5,2) DEFAULT 20.00,
    overhead_costs DECIMAL(5,2) DEFAULT 15.00,
    vat_rate DECIMAL(5,2) DEFAULT 20.00,
    final_amount DECIMAL(15,2) DEFAULT 0.00,
    valid_until DATE,
    notes TEXT,
    created_by INT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Таблица позиций смет
CREATE TABLE estimate_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    estimate_id INT NOT NULL,
    category VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(20) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    labor_cost DECIMAL(12,2),
    material_cost DECIMAL(12,2),
    equipment_cost DECIMAL(12,2),
    gost_code VARCHAR(50),
    sort_order INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
);

-- Таблица прайс-листа компании
CREATE TABLE company_price_list (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(20) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    labor_cost DECIMAL(12,2),
    material_cost DECIMAL(12,2),
    equipment_cost DECIMAL(12,2),
    complexity_factor DECIMAL(4,2) DEFAULT 1.00,
    gost_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE NOT NULL,
    valid_to DATE,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица коммерческих предложений
CREATE TABLE commercial_offers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    project_id INT,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
    total_amount DECIMAL(15,2) NOT NULL,
    validity_period INT DEFAULT 30,
    valid_until DATE,
    discount DECIMAL(5,2) DEFAULT 0.00,
    payment_terms TEXT,
    delivery_terms TEXT,
    template_used VARCHAR(100),
    sent_at TIMESTAMP NULL,
    viewed_at TIMESTAMP NULL,
    responded_at TIMESTAMP NULL,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица позиций коммерческих предложений
CREATE TABLE commercial_offer_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    offer_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(20) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES commercial_offers(id) ON DELETE CASCADE
);

-- Таблица документов
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    related_type ENUM('project', 'client', 'contractor', 'employee', 'estimate', 'offer') NOT NULL,
    related_id INT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Таблица заявок на материалы
CREATE TABLE material_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('draft', 'submitted', 'approved', 'ordered', 'delivered', 'cancelled') DEFAULT 'draft',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    requested_date DATE NOT NULL,
    required_date DATE NOT NULL,
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    requested_by INT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Таблица позиций заявок на материалы
CREATE TABLE material_request_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(20) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    estimated_price DECIMAL(12,2),
    supplier VARCHAR(255),
    catalog_source VARCHAR(50),
    catalog_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES material_requests(id) ON DELETE CASCADE
);

-- Таблица сообщений/уведомлений
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_user_id INT,
    to_user_id INT,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    type ENUM('message', 'notification', 'system') DEFAULT 'message',
    priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    related_type VARCHAR(50),
    related_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
);

-- Таблица логов системы
CREATE TABLE system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Создание индексов для оптимизации
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_timesheet_employee_date ON timesheet(employee_id, work_date);
CREATE INDEX idx_warehouse_items_category ON warehouse_items(category);
CREATE INDEX idx_warehouse_movements_item ON warehouse_movements(item_id);
CREATE INDEX idx_estimates_project ON estimates(project_id);
CREATE INDEX idx_commercial_offers_client ON commercial_offers(client_id);
CREATE INDEX idx_documents_related ON documents(related_type, related_id);
CREATE INDEX idx_messages_to_user ON messages(to_user_id, is_read);

-- Вставка начальных данных
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@construction-crm.com', '$2a$10$example_hash', 'Администратор', 'Системы', 'admin');

INSERT INTO company_price_list (category, name, unit, price, labor_cost, material_cost, equipment_cost, gost_code, valid_from, created_by) VALUES
('Земляные работы', 'Разработка грунта экскаватором', 'м³', 450.00, 150.00, 50.00, 250.00, 'ГЭСН 01-01-001-01', CURDATE(), 1),
('Бетонные работы', 'Устройство монолитных фундаментов', 'м³', 8500.00, 3500.00, 4500.00, 500.00, 'ГЭСН 06-01-001-02', CURDATE(), 1),
('Кирпичная кладка', 'Кладка стен из кирпича керамического', 'м³', 12000.00, 8000.00, 3800.00, 200.00, 'ГЭСН 08-02-001-01', CURDATE(), 1);