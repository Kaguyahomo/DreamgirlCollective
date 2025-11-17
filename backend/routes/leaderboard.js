const express = require("express");
const router = express.Router();
const db = require("../db");
const cron = require("node-cron");

// Submit score
router.post("/submit", (req, res) => {
  const { name, score } = req.body;
  db.run(
    INSERT INTO leaderboard (name, score) VALUES (?, ?),
    [name, score],
    err => {
      if (err) return res.status(500).send({ error: "DB Error" });
      res.send({ success: true });
    }
  );
});

// Weekly leaderboard
router.get("/week", (req, res) => {
  db.all(
    SELECT name, score FROM leaderboard
     WHERE created_at >= datetime('now', '-7 days')
     ORDER BY score DESC,
    (err, rows) => {
      if (err) return res.status(500).send({ error: "DB Error" });
      res.send({ leaderboard: rows });
    }
  );
});

// Weekly purge
cron.schedule("0 3 * * 0", () => {
  db.run("DELETE FROM leaderboard");
});

module.exports = router;
