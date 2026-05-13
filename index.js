import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve the HTML form at root "/"
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'hoe.html'));
});

// Database Setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        db.exec(schema, (err) => {
            if (err) console.error('Schema initialization error:', err.message);
        });
    }
});

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

// 1. Submit User Input
app.post('/api/submit', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await run(
            'INSERT INTO user_inputs (user_name, user_email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );
        res.status(201).json({ success: true, message: 'Input saved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Admin Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await query('SELECT * FROM admin WHERE email = ? AND password = ?', [email, password]);
        if (users.length > 0) {
            res.json({ success: true, token: 'mock-jwt-token' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get All Inputs (Admin Only)
app.get('/api/inputs', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM user_inputs ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/inputs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await run('DELETE FROM user_inputs WHERE id = ?', [id]);
        res.json({ success: true, message: 'Submission deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
