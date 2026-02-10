const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DATABASE CONNECTION
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'study_tracker',
  password: 'Kavi@2002', // <--- CHANGE THIS!
  port: 5432,
});

// ROUTE 1: LOGIN
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (user.password === password) {
        res.json({ success: true, user: user.username });
      } else {
        res.json({ success: false, message: "Wrong password" });
      }
    } else {
      res.json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ROUTE 2: GET SESSIONS
app.get('/my-sessions/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query('SELECT * FROM study_sessions WHERE username = $1', [username]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ROUTE 3: ADD SESSION
app.post('/add-session', async (req, res) => {
  const { username, subject, hours } = req.body;
  try {
    await pool.query(
      'INSERT INTO study_sessions (username, subject, hours) VALUES ($1, $2, $3)',
      [username, subject, hours]
    );
    res.json({ success: true, message: "Saved!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Rule 4: Delete a Session
app.delete('/delete-session/:id', async (req, res) => {
  const { id } = req.params; // Get the ID number of the session
  try {
    await pool.query('DELETE FROM study_sessions WHERE id = $1', [id]);
    res.json({ success: true, message: "Deleted!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Rule 5: Sign Up (Create New User)
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    // 1. Check if user already exists
    const check = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (check.rows.length > 0) {
      return res.json({ success: false, message: "Username already taken!" });
    }

    // 2. Insert new user
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, password]
    );
    res.json({ success: true, message: "Account created! Please log in." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// START SERVER
app.listen(5000, () => {
  console.log("🤖 Robot is running on port 5000 with 3 tricks learned!");
});