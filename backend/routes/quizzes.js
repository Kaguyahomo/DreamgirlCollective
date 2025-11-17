const express = require('express');
const router = express.Router();
const db = require('../db');
const similarity = require('string-similarity');

// Get today's quiz or create if missing
router.get('/daily', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  db.get(`SELECT * FROM quizzes WHERE date = ?`, [today], (err, quiz) => {
    if (err) return res.status(500).send({ error: 'DB Error' });

    if (quiz) {
      res.send({ words: JSON.parse(quiz.words) });
    } else {
      // Pick 5 unused words randomly
      db.all(`SELECT * FROM words WHERE used = 0 ORDER BY RANDOM() LIMIT 5`, [], (err, words) => {
        if (err || words.length < 5) return res.status(400).send({ error: 'Not enough words' });
        const wordList = words.map(w => ({ word: w.word, definition: w.definition }));
        db.run(`INSERT INTO quizzes (date, words) VALUES (?, ?)`, [today, JSON.stringify(wordList)]);
        // Mark as used
        wordList.forEach(w => {
          db.run(`UPDATE words SET used = 1 WHERE word = ?`, [w.word]);
        });
        res.send({ words: wordList });
      });
    }
  });
});

// Submit quiz answers (AI grading)
router.post('/grade', async (req, res) => {
  // req.body: { username, answers: [{word, userAnswer}] }
  const { username, answers } = req.body;
  // Get today's correct definitions
  const today = new Date().toISOString().split('T')[0];

  db.get(`SELECT words FROM quizzes WHERE date = ?`, [today], (err, row) => {
    if (err || !row) return res.status(404).send({ error: "Today's quiz not found." });
    const wordObjs = JSON.parse(row.words);
    let score = 0;
    let results = [];
    answers.forEach(ans => {
      const correctDef = wordObjs.find(w => w.word === ans.word)?.definition || "";
      const sim = similarity.compareTwoStrings(ans.userAnswer.trim().toLowerCase(), correctDef.trim().toLowerCase());
      const correct = sim > 0.65;
      results.push({ word: ans.word, correct, similarity: sim });
      if (correct) score++;
    });
    // Save score
    db.run(`INSERT INTO scores (username, date, score) VALUES (?, ?, ?)`, [username, today, score]);
    res.send({ results, score });
  });
});

module.exports = router;