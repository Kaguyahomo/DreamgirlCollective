import React, { useState, useEffect } from "react";

export default function AdminBackupWords() {
  const [words, setWords] = useState([]);
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    const res = await fetch("http://localhost:3001/api/backup/all");
    const data = await res.json();
    setWords(data.words);
  }

  async function addWord(e) {
    e.preventDefault();

    await fetch("http://localhost:3001/api/backup/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, definition })
    });

    setWord("");
    setDefinition("");
    loadWords();
  }

  async function deleteBackup(w) {
    await fetch(\http://localhost:3001/api/backup/delete/\\, {
      method: "DELETE"
    });
    loadWords();
  }

  async function syncToActive() {
    await fetch("http://localhost:3001/api/backup/sync", {
      method: "POST"
    });
    alert("Active vocab list reset and synced!");
  }

  return (
    <div className="pink-card">
      <h2>Backup Word List (Master Vocabulary)</h2>

      <form onSubmit={addWord}>
        <input
          type="text"
          placeholder="Word"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Definition"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          required
        />
        <button type="submit">Add to Backup</button>
      </form>

      <h3>Current Backup Words</h3>
      <ul style={{ textAlign: "left" }}>
        {words.map((w) => (
          <li key={w.word} style={{ margin: "6px 0" }}>
            <strong>{w.word}</strong>: {w.definition}
            <button
              onClick={() => deleteBackup(w.word)}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button onClick={syncToActive} style={{ marginTop: "25px" }}>
        Sync Backup ? Active List
      </button>
    </div>
  );
}
