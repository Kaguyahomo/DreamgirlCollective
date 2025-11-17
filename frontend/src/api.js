const API_URL = "http://localhost:3001/api";

export async function addWord(word, definition) {
  await fetch(${API_URL}/words/add, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, definition })
  });
}

export async function getWords() {
  const res = await fetch(${API_URL}/words/all);
  return await res.json();
}

export async function deleteWord(word) {
  await fetch(${API_URL}/words/delete/, {
    method: "DELETE"
  });
}

export async function submitScore(name, score) {
  await fetch(${API_URL}/leaderboard/submit, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score })
  });
}
