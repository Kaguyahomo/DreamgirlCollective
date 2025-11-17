const express = require('express');
const router = express.Router();
const db = require('../db');

// Add new word
router.post('/add', (req, res) => {
  const { word, definition } = req.body;
  db.run(
    `INSERT INTO words (word, definition) VALUES (?, ?)`,
    [word, definition],
    err => {
      if (err) return res.status(400).send({ error: 'Word exists or DB Error' });
      res.send({ success: true });
    }
  );
});

// List all words
router.get('/all', (req, res) => {
  db.all(`SELECT * FROM words`, (err, rows) => {
    if (err) return res.status(500).send({ error: 'DB Error' });
    res.send({ words: rows });
  });
});

// Delete word
router.delete('/delete/:word', (req, res) => {
  db.run(`DELETE FROM words WHERE word = ?`, [req.params.word], err => {
    if (err) return res.status(500).send({ error: 'DB Error' });
    res.send({ success: true });
  });
});

// Edit word
router.post('/edit', (req, res) => {
  const { word, definition } = req.body;
  db.run(
    `UPDATE words SET definition = ? WHERE word = ?`,
    [definition, word],
    err => {
      if (err) return res.status(400).send({ error: 'DB Error' });
      res.send({ success: true });
    }
  );
});

module.exports = router;