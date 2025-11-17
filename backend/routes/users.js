const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET = 'your-secret-key';

// Signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (username, password, is_admin) VALUES (?, ?, 0)`,
    [username, hashedPassword],
    err => {
      if (err) return res.status(400).send({ error: 'User exists or DB error' });
      res.send({ success: true });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) return res.status(404).send({ error: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send({ error: 'Invalid password' });
    const token = jwt.sign({ username: user.username, is_admin: !!user.is_admin }, SECRET, { expiresIn: "2d" });
    res.send({ token, user: { username: user.username, is_admin: !!user.is_admin } });
  });
});

module.exports = router;
