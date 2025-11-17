import React, { useEffect, useState } from "react";
import { getWords, deleteWord } from "../api";

export default function VocabQuiz() {
  const [words, setWords] = useState([]);
  const [current, setCurrent] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    const data = await getWords();
    const list = data.words;

    if (list.length === 0) {
      setCurrent(null);
      return;
    }

    setWords(list);
    setCurrent(list[0]);
  }

  async function playAudio() {
    const res = await fetch(
      https://api.dictionaryapi.dev/api/v2/entries/en/
    );
    const data = await res.json();

    try {
      const audioUrl = data[0].phonetics.find(p => p.audio)?.audio;
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        setFeedback("No audio available for this word.");
      }
    } catch {
      setFeedback("Audio lookup failed.");
    }
  }

  async function submitAnswer(e) {
    e.preventDefault();

    if (!current) return;

    if (answer.toLowerCase().trim() === current.definition.toLowerCase().trim()) {
      setFeedback("Correct! Removed from list.");
      await deleteWord(current.word);
      setAnswer("");
      loadWords();
    } else {
      setFeedback("Incorrect. Try again!");
    }
  }

  return (
    <div className="pink-card">
      <h2>Vocabulary Quiz</h2>

      {current ? (
        <>
          <p className="quiz-word">{current.word}</p>
          <button type="button" onClick={playAudio}>?? Pronounce</button>

          <form onSubmit={submitAnswer}>
            <input
              type="text"
              placeholder="Enter definition"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>

          <p className="feedback">{feedback}</p>
        </>
      ) : (
        <p className="center">All caught up! No words left ??</p>
      )}
    </div>
  );
}
