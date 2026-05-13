-- Admin Table
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- User Inputs Table
CREATE TABLE IF NOT EXISTS user_inputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT,
    user_email TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Admin (Password: adnan1281)
-- Note: In a real app, use bcrypt to hash the password.
-- For this setup, we'll store it and the server will handle hashing/comparison.
INSERT OR IGNORE INTO admin (email, password) VALUES ('adnan@adscaleengine.com', 'adnan1281');
