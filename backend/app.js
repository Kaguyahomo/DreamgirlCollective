const express = require('express');
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const wordsRouter = require('./routes/words');
const quizzesRouter = require('./routes/quizzes');
const usersRouter = require('./routes/users');
const scoresRouter = require('./routes/scores');

const app = express();
const PORT = 3001;
const SECRET = 'your-secret-key'; // Change in .env for prod

app.use(cors());
app.use(express.json());

app.use('/api/words', wordsRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/users', usersRouter);
app.use('/api/scores', scoresRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
const cron = require("node-cron");
const db = require("./db");

cron.schedule("0 3 * * 0", () => {
  console.log("Weekly vocab reset running…");

  // Clear active list
  db.run("DELETE FROM words");

  // Restore from backup
  db.run(\
    INSERT INTO words (word, definition)
    SELECT word, definition FROM words_backup
  \);
});
