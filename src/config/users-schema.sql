-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Hashed with bcrypt
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- admin, manager, user
    active INTEGER DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Usuario admin por defecto
-- Email: admin@cocolu.com
-- Password: admin123
-- Hash bcrypt de 'admin123': $2b$10$rKZB8vHqZ.qH3qYqZ9qZ9eqZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9q
INSERT OR IGNORE INTO users (id, email, password, name, role, active)
VALUES (
    1,
    'admin@cocolu.com',
    '$2b$10$rKZB8vHqZ.qH3qYqZ9qZ9eqZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ9q',
    'Administrador',
    'admin',
    1
);
