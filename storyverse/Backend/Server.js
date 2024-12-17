const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise'); // Use promise-based mysql2
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
let db;

(async () => {
    try {
        db = await mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'Apeksha@9483', // Add your MySQL password
            database: 'blogging',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
        console.log('Connected to MySQL Database');
    } catch (err) {
        console.error('Failed to connect to MySQL:', err);
        process.exit(1);
    }
})();

// Secret Key for JWT
const SECRET_KEY = 'your_secret_key';

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).send('All fields are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        await db.execute(query, [username, email, hashedPassword, role]);
        res.status(201).send('User registered successfully');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).send('Email already exists');
        }
        res.status(500).send('Server error');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [results] = await db.execute(query, [email]);

        if (results.length === 0) {
            return res.status(401).send('Invalid email or password');
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send('Invalid email or password');
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Get User Info (Role and Details)
app.get('/user-info', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ role: decoded.role });
});

// Fetch Author Stats
app.get('/author-stats', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'author') {
        return res.status(403).send('Access denied');
    }

    const query = `
        SELECT 
            COUNT(*) AS totalArticles,
            SUM(views) AS totalViews,
            SUM(comments) AS totalComments
        FROM articles WHERE author_id = ?
    `;
    db.execute(query, [decoded.id])
        .then(([results]) => res.json(results[0]))
        .catch(() => res.status(500).send('Error fetching stats'));
});

// Upload Article
app.post('/upload-article', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.role !== 'author') {
        return res.status(403).send('Access denied');
    }

    const { title, content } = req.body;
    const query = 'INSERT INTO articles (title, content, author_id) VALUES (?, ?, ?)';
    db.execute(query, [title, content, decoded.id])
        .then(() => res.status(201).send('Article uploaded successfully'))
        .catch(() => res.status(500).send('Error uploading article'));
});

app.get('/articles', async (req, res) => {
    try {
        const [articles] = await db.query('SELECT * FROM articles');
        res.json(articles);
    } catch (err) {
        console.error('Error fetching articles:', err);
        res.status(500).json({ error: 'Error fetching articles' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
