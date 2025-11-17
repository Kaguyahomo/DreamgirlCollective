const express = require("express");
const router = express.Router();
const db = require("../db");

// Add word to backup
router.post("/add", (req, res) => {
  const { word, definition } = req.body;
  db.run(
    \INSERT INTO words_backup (word, definition) VALUES (?, ?)\,
    [word, definition],
    err => {
      if (err) return res.status(400).send({ error: "Word exists or DB error" });
      res.send({ success: true });
    }
  );
});

// List backup words
router.get("/all", (req, res) => {
  db.all(\SELECT * FROM words_backup\, (err, rows) => {
    if (err) return res.status(500).send({ error: "DB error" });
    res.send({ words: rows });
  });
});

// Delete from backup
router.delete("/delete/:word", (req, res) => {
  db.run(\DELETE FROM words_backup WHERE word = ?\, [req.params.word], err => {
    if (err) return res.status(500).send({ error: "DB error" });
    res.send({ success: true });
  });
});

// Sync backup ? active list
router.post("/sync", (req, res) => {
  db.run(\DELETE FROM words\, err => {
    if (err) return res.status(500).send({ error: "DB error clearing active list" });

    db.run(
      \INSERT INTO words (word, definition)
       SELECT word, definition FROM words_backup\,
      err2 => {
        if (err2) return res.status(500).send({ error: "DB error syncing lists" });
        res.send({ success: true });
      }
    );
  });
});

module.exports = router;
