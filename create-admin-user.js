const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdminUser() {
    try {
        // Создаем хеш пароля
        const password = 'admin123';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        console.log('Generated password hash:', hashedPassword);
        
        // Подключение к базе данных
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'construction_crm',
            charset: 'utf8mb4'
        });
        
        console.log('Connected to database');
        
        // Проверяем, существует ли пользователь admin
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            ['admin', 'admin@construction-crm.com']
        );
        
        if (existingUsers.length > 0) {
            // Обновляем существующего пользователя
            await connection.execute(
                'UPDATE users SET password_hash = ?, is_active = TRUE WHERE username = ? OR email = ?',
                [hashedPassword, 'admin', 'admin@construction-crm.com']
            );
            console.log('Admin user updated successfully');
        } else {
            // Создаем нового пользователя
            await connection.execute(
                'INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
                ['admin', 'admin@construction-crm.com', hashedPassword, 'Администратор', 'Системы', 'admin', true]
            );
            console.log('Admin user created successfully');
        }
        
        // Проверяем созданного пользователя
        const [users] = await connection.execute(
            'SELECT id, username, email, first_name, last_name, role, is_active FROM users WHERE username = ?',
            ['admin']
        );
        
        console.log('Admin user details:', users[0]);
        
        await connection.end();
        console.log('Database connection closed');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

// Запускаем создание пользователя
createAdminUser();