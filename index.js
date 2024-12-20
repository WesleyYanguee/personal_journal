const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to the database
const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// API Endpoints

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to Your Personal Journal API!');
});

// CRUD for Users

// Get all users
app.get('/users', (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            res.status(500).send('Error fetching users.');
        } else {
            res.send(results);
        }
    });
});

// Get user by ID
app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching user.');
        } else {
            res.send(results[0] || {});
        }
    });
});

// Create a new user
app.post('/users', (req, res) => {
    const { fname, lname, username, password } = req.body;
    connection.query(
        'INSERT INTO users (fname, lname, username, password) VALUES (?, ?, ?, ?)',
        [fname, lname, username, password],
        (err, results) => {
            if (err) {
                res.status(500).send('Error creating user.');
            } else {
                res.status(201).send({ id: results.insertId });
            }
        }
    );
});

// Update a user
app.put('/users', (req, res) => {
    const { id, fname, lname, username, password } = req.body;
    console.log('Update data:', req.body); // Log incoming data
    connection.query(
        'UPDATE users SET fname = ?, lname = ?, username = ?, password = ? WHERE id = ?',
        [fname, lname, username, password, id],
        (err) => {
            if (err) {
                console.error('Error updating user:', err); // Log error
                res.status(500).send('Error updating user.');
            } else {
                res.send('User updated successfully.');
            }
        }
    );
});

// Delete a user
app.delete('/users', (req, res) => {
    const { id } = req.body;
    console.log('Delete user ID:', id); // Log the ID being deleted
    connection.query('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting user:', err); // Log error
            res.status(500).send('Error deleting user.');
        } else {
            res.send('User deleted successfully.');
        }
    });
});

// CRUD for Journals

// Get all journals
app.get('/journals', (req, res) => {
    connection.query('SELECT * FROM journals', (err, results) => {
        if (err) {
            res.status(500).send('Error fetching journals.');
        } else {
            res.send(results);
        }
    });
});

// Get journal by ID
app.get('/journals/:id', (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM journals WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching journal.');
        } else {
            res.send(results[0] || {});
        }
    });
});

// Create a new journal
app.post('/journals', (req, res) => {
    console.log('Incoming data:', req.body); // Log incoming request data
    const { userId, title, content, created_at } = req.body;
    connection.query(
        'INSERT INTO journals (userId, title, content, created_at) VALUES (?, ?, ?, ?)',
        [userId, title, content, created_at],
        (err, results) => {
            if (err) {
                console.error('Error creating journal:', err); // Log error
                res.status(500).send('Error creating journal.');
            } else {
                console.log('Journal created successfully:', results.insertId); // Log success
                res.status(201).send({ id: results.insertId });
            }
        }
    );
});

// Update a journal
app.put('/journals', (req, res) => {
    const { id, userId, title, content, created_at } = req.body;
    console.log('Update journal data:', req.body); // Log incoming data
    connection.query(
        'UPDATE journals SET userId = ?, title = ?, content = ?, created_at = ? WHERE id = ?',
        [userId, title, content, created_at, id],
        (err) => {
            if (err) {
                console.error('Error updating journal:', err); // Log error
                res.status(500).send('Error updating journal.');
            } else {
                res.send('Journal updated successfully.');
            }
        }
    );
});

// Delete a journal
app.delete('/journals', (req, res) => {
    const { id } = req.body;
    console.log('Delete journal ID:', id); // Log the ID being deleted
    connection.query('DELETE FROM journals WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting journal:', err); // Log error
            res.status(500).send('Error deleting journal.');
        } else {
            res.send('Journal deleted successfully.');
        }
    });
});

// Login Endpoint
app.post('/login', (req, res) => {
    console.log('Login payload:', req.body); // Debugging log

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send({ message: 'Invalid payload' });
    }

    connection.query(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, results) => {
            if (err) {
                console.error('Error during login:', err);
                res.status(500).send({ message: 'Server error' });
            } else if (results.length > 0) {
                res.status(200).send({
                    id: results[0].id,
                    username: results[0].username,
                    message: 'Login successful',
                });
            } else {
                console.log('Login failed: No matching user found'); // Debug log
                res.status(401).send({ message: 'Invalid credentials' });
            }
        }
    );
});

// Start server
app.listen(process.env.PORT || 3000, () => {
    console.log('API running on port 3000.');
});

module.exports = app;
