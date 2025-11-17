import React, { useState, useEffect } from "react";
import api from "../api";

export default function AdminWordBank() {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [words, setWords] = useState([]);

  const fetchWords = async () => {
    const res = await api.get("/words/all");
    setWords(res.data.words);
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const addWord = async () => {
    await api.post("/words/add", { word, definition });
    setWord("");
    setDefinition("");
    fetchWords();
  };

  const delWord = async (w) => {
    await api.delete(`/words/delete/${w}`);
    fetchWords();
  };

  const editWord = async (w) => {
    const newDef = prompt("New definition", w.definition);
    if (newDef) {
      await api.post("/words/edit", { word: w.word, definition: newDef });
      fetchWords();
    }
  };

  return (
    <div>
      <h2>Admin Word Bank</h2>
      <input placeholder="Word" value={word} onChange={e => setWord(e.target.value)} />
      <input placeholder="Definition" value={definition} onChange={e => setDefinition(e.target.value)} />
      <button onClick={addWord}>Add</button>
      <ul>
        {words.map(w => (
          <li key={w.word}>
            <b>{w.word}</b>: {w.definition}
            <button onClick={() => editWord(w)}>Edit</button>
            <button onClick={() => delWord(w.word)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}