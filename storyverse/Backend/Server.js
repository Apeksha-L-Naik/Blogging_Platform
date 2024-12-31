const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise'); // Use promise-based mysql2
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors());

// MySQL Connection
let db;

(async () => {
    try {
        db = await mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'Apeksha@9483', // Add your MySQL password
            database: 'storyverse',
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));


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


// Fetch author name
app.get('/author-name', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Get token from the header
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Decode the token to extract user info
        const decoded = jwt.verify(token, SECRET_KEY); // Use your secret key here
        const authorId = decoded.id; // Use decoded.id as user_id

        // Query the database for author's details (name, bio, profile_picture) and article count
        const [author] = await db.query(
            'SELECT author_name, bio, profile_picture FROM author WHERE user_id = ?',
            [authorId]
        );

        if (author.length === 0) {
            return res.status(404).json({ error: 'Author not found' });
        }

        // Query to get the article count
        const [articleCountResult] = await db.query(
            'SELECT COUNT(*) AS article_count FROM articles WHERE author_id = ?',
            [authorId]
        );

        const articleCount = articleCountResult[0].article_count;


        res.json({
            name: author[0].author_name,
            bio: author[0].bio || '',
            profilePicture: author[0].profile_picture || '', 
            articleCount, 
        });
    } catch (err) {
        console.error('Error fetching author details:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


app.post('/update-profile', upload.single('profilePicture'), async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }


        const decoded = jwt.verify(token, SECRET_KEY);
        const authorId = decoded.id; 


        const { bio } = req.body;
        const profilePicture = req.file?.path;


        const updateQuery = `
            UPDATE author
            SET bio = ?, profile_picture = ?
            WHERE user_id = ?
        `;
        await db.query(updateQuery, [bio, profilePicture, authorId]);

        res.json({ success: true, message: 'Profile updated successfully!' });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/upload-article', upload.single('coverImage'), (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        if (decoded.role !== 'author') {
            return res.status(403).send('Access denied');
        }

        const { title, content, categories } = req.body;
        const coverImagePath = req.file?.path; 

        if (!title || !content || !categories) {
            return res.status(400).send('Title, content, and categories are required');
        }

        const parsedCategories = JSON.parse(categories);

        db.execute('INSERT INTO articles (title, content, author_id, cover_image_url) VALUES (?, ?, ?, ?)', [
            title,
            content,
            decoded.id,
            coverImagePath,
        ])
            .then(async ([articleResult]) => {
                const categoryInsertQueries = parsedCategories.map((category) =>
                    db.execute('INSERT INTO categories (name, article_id) VALUES (?, ?)', [category, articleResult.insertId])
                );

                await Promise.all(categoryInsertQueries);
                res.status(200).send({ message: 'Article and cover image uploaded successfully' });
            })
            .catch((err) => {
                console.error('Database error:', err);
                res.status(500).send('Error uploading article');
            });
    } catch (err) {
        console.error('JWT Error:', err);
        res.status(401).send('Invalid or expired token');
    }
});



app.get('/articles', (req, res) => {
    const query = `
        SELECT articles.article_id, articles.title,articles.cover_image_url,author.author_name AS author_name
        FROM articles
        JOIN author ON articles.author_id = author.user_id
    `;

    db.execute(query)
        .then(([rows]) => {
            res.status(200).send(rows);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send('Error fetching articles');
        });
});


app.get('/article/:id', (req, res) => {
    const articleId = req.params.id;
    const query = `
        SELECT articles.article_id, articles.title, articles.content, articles.cover_image_url, author.author_name AS author_name
        FROM articles
        JOIN author 
        ON articles.author_id = author.user_id 
        WHERE articles.article_id = ?

    `;

    db.execute(query, [articleId])
        .then(([rows]) => {
            if (rows.length === 0) {
                return res.status(404).send('Article not found');
            }
            res.status(200).send(rows[0]);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send('Error fetching article');
        });
});


app.post('/article/:id/likes',async (req, res)  => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // Decode the token
        const userId = decoded.id; // Extract user ID from token
        const articleId = req.params.id; // Extract article ID from route parameter

        if (!userId || !articleId) {
            return res.status(400).json({ error: 'Invalid user or article ID.' });
        }

        // Insert view record only if it does not already exist
        const [result] = await db.query(
            'INSERT IGNORE INTO likes (user_id, article_id) VALUES (?, ?)',
            [userId, articleId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Like added successfully' });
        } else {
            res.status(400).json({ message: 'User has already Liked this article' });
        }
    } catch (error) {
        console.error('Error incrementing like count:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/article/:id/likes',async (req, res) => {
    const articleId = req.params.id;

    try {
        const [result] = await db.query(
            'SELECT COUNT(*) AS like_count FROM likes WHERE article_id = ?',
            [articleId]
        );

        res.status(200).json({ view_count: result[0].view_count });
    } catch (error) {
        console.error('Error fetching like count:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});
// app.get('/article/:id/likes/user/:userId', (req, res) => {
//     const { id, userId } = req.params;

//     // Check if the user has already liked the article
//     const checkLikeQuery = `SELECT * FROM likes WHERE article_id = ? AND user_id = ?`;
//     db.query(checkLikeQuery, [id, userId], (err, existingLike) => {
//         if (err) {
//             return res.status(500).json({ error: 'Database error' });
//         }
//         return res.json({ hasLiked: existingLike.length > 0 });
//     });
// });

app.get('/article/:id/likes/status',  (req, res) => {
    const { id, userId } = req.params;

    // Check if the user has already liked the article
    const checkLikeQuery = `SELECT * FROM likes WHERE article_id = ? AND user_id = ?`;
    db.query(checkLikeQuery, [id, userId], (err, existingLike) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        return res.json({ hasLiked: existingLike.length > 0 });
    });
});

app.post('/article/:id/views', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // Decode the token
        const userId = decoded.id; // Extract user ID from token
        const articleId = req.params.id; // Extract article ID from route parameter

        if (!userId || !articleId) {
            return res.status(400).json({ error: 'Invalid user or article ID.' });
        }

        // Insert view record only if it does not already exist
        const [result] = await db.query(
            'INSERT IGNORE INTO views (user_id, article_id) VALUES (?, ?)',
            [userId, articleId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'View added successfully' });
        } else {
            res.status(400).json({ message: 'User has already viewed this article' });
        }
    } catch (error) {
        console.error('Error incrementing view count:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to fetch view count for an article
app.get('/article/:id/views', async (req, res) => {
    const articleId = req.params.id;

    try {
        const [result] = await db.query(
            'SELECT COUNT(*) AS view_count FROM views WHERE article_id = ?',
            [articleId]
        );

        res.status(200).json({ view_count: result[0].view_count });
    } catch (error) {
        console.error('Error fetching view count:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});
// Route to get comments of an article
app.get('/article/:id/comments', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT comments.comment_id, comments.user_id, users.username, comments.text FROM comments JOIN users ON comments.user_id = users.id WHERE comments.article_id = ?';
        const [comments] = await db.execute(query, [id]);
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// Route to post a comment on an article
app.post('/article/:id/comment', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];  // Bearer <token>
    
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);  // Verify the token

        const userId = decoded.id;  // Extract user ID from the token
        const { text } = req.body;  // Comment text from the request body
        const articleId = req.params.id;  // Article ID from route parameter

        if (!text) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        // Insert the new comment into the database
        const insertQuery = 'INSERT INTO comments (article_id, user_id, text) VALUES (?, ?, ?)';
        await db.execute(insertQuery, [articleId, userId, text]);

        res.status(200).json({ message: 'Comment posted successfully' });
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
