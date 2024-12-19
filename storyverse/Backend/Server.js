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

// Fetch Author Stats
// app.get('/author-stats', (req, res) => {
//     const token = req.headers.authorization.split(' ')[1];
//     const decoded = jwt.verify(token, SECRET_KEY); // Replace with your actual secret key

//     if (decoded.role !== 'author') {
//         return res.status(403).send('Access denied');
//     }

//  // SELECT 
//         //     a.author_name AS authorName,
//         //     a.profile_picture AS profilePicture,
//         //     a.bio AS authorBio,
//         //     COUNT(ar.id) AS totalArticles,
//         //     SUM(ar.views) AS totalViews,
//         //     SUM(ar.comments) AS totalComments
//         // FROM authors AS a
//         // LEFT JOIN articles AS ar ON a.id = ar.author_id
//         // WHERE a.id = ?   
//     const query = `
//         SELECT  author_name,profile_picture,bio from author where user_id=?
//     `;

//     db.execute(query, [decoded.id])
//         .then(([results]) => {
//             if (results.length === 0) {
//                 return res.status(404).send('Author not found');
//             }
//             res.json(results[0]);
//         })
//         .catch((error) => {
//             console.error('Error fetching stats:', error);
//             res.status(500).send('Error fetching stats');
//         });
// });



// Fetch author name
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

        // Query the database for author's name based on authorId
        const [author] = await db.query('SELECT author_name FROM author WHERE user_id = ?', [authorId]);

        if (author.length === 0) {
            return res.status(404).json({ error: 'Author not found' });
        }

        // Ensure the property is returned as 'name' for consistency with frontend
        res.json({ name: author[0].author_name });
    } catch (err) {
        console.error('Error fetching author name:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// app.get('/author-stats', (req, res) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         return res.status(401).send('Authorization header is missing');
//     }

//     const tokenParts = authHeader.split(' ');

//     if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
//         return res.status(400).send('Invalid authorization format');
//     }

//     const token = tokenParts[1];

//     try {
//         const decoded = jwt.verify(token, SECRET_KEY);

//         console.log("Decoded Token:", decoded);

//         const query = `
//             SELECT author_name 
//             FROM author 
//             WHERE user_id = ?
//         `;

//         db.execute(query, [decoded.id])
//             .then(([results]) => {
//                 console.log("Query Results:", results);
//                 if (results.length === 0) {
//                     return res.status(404).send('Author not found');
//                 }
//                 res.json(results[0]);
//             })
//             .catch((error) => {
//                 console.error('Error fetching stats:', error);
//                 res.status(500).send('Error fetching stats');
//             });
//     } catch (error) {
//         console.error('Token verification failed:', error);
//         return res.status(403).send('Invalid or expired token');
//     }
// });



app.post('/upload-article', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log('Decoded JWT:', decoded);

        if (decoded.role !== 'author') {
            return res.status(403).send('Access denied');
        }

        // Check if author exists in the database
        const checkAuthorQuery = 'SELECT * FROM author WHERE author_id = ?';
        db.execute(checkAuthorQuery, [decoded.id])
            .then(([rows]) => {
                if (rows.length === 0) {
                    return res.status(404).send('Author not found');
                }

                const { title, content } = req.body;
                const query = 'INSERT INTO articles (title, content, author_id) VALUES (?, ?, ?)';
                db.execute(query, [title, content, decoded.id])
                    .then(() => res.status(201).send('Article uploaded successfully'))
                    .catch((err) => {
                        console.error('Database error:', err);
                        res.status(500).send('Error uploading article');
                    });
            })
            .catch((err) => {
                console.error('Error checking author:', err);
                res.status(500).send('Error checking author');
            });
    } catch (err) {
        console.error('JWT Error:', err);
        return res.status(401).send('Invalid or expired token');
    }
});


app.get('/articles', (req, res) => {
    const query = `
        SELECT articles.article_id, articles.title, articles.content, author.author_name AS author_name
        FROM articles
        JOIN author ON articles.author_id = author.author_id
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
        SELECT articles.article_id, articles.title, articles.content, author.author_name AS author_name
        FROM articles
        JOIN author ON articles.author_id = author.author_id
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

app.post('/article/:id/like', (req, res) => {
    const articleId = req.params.id;
    const userId = req.body.user_id;  // This would come from the logged-in user

    const checkIfLikedQuery = 'SELECT * FROM likes WHERE article_id = ? AND user_id = ?';
    db.execute(checkIfLikedQuery, [articleId, userId])
        .then(([rows]) => {
            if (rows.length > 0) {
                return res.status(400).json({ success: false, message: 'You already liked this article' });
            }

            const insertLikeQuery = 'INSERT INTO likes (article_id, user_id) VALUES (?, ?)';
            db.execute(insertLikeQuery, [articleId, userId])
                .then(() => {
                    res.status(201).json({ success: true, message: 'Like added' });
                })
                .catch((err) => {
                    console.error('Error adding like:', err);
                    res.status(500).json({ success: false, message: 'Error adding like' });
                });
        })
        .catch((err) => {
            console.error('Error checking like:', err);
            res.status(500).json({ success: false, message: 'Error checking like' });
        });
});

app.get('/article/:id/likes', (req, res) => {
    const articleId = req.params.id;
    const query = 'SELECT COUNT(*) AS like_count FROM likes WHERE article_id = ?';
    
    db.execute(query, [articleId])
        .then(([rows]) => {
            res.status(200).send({ like_count: rows[0].like_count });
        })
        .catch((err) => {
            console.error('Error fetching like count:', err);
            res.status(500).send('Error fetching like count');
        });
});

app.post('/article/:id/comment', (req, res) => {
    const { id } = req.params;
    const { user_id, text } = req.body;

    const query = 'INSERT INTO comments (article_id, user_id, text) VALUES (?, ?, ?)';
    db.execute(query, [id, user_id, text])
        .then(() => {
            res.status(201).send('Comment added successfully');
        })
        .catch((err) => {
            console.error('Error posting comment:', err);
            res.status(500).send('Error posting comment');
        });
});




// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
