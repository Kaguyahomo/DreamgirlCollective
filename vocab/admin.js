const ADMIN_PASSWORD = "MischiefSisters2";

function adminLogin() {
  const pass = document.getElementById("password").value;
  if (pass !== ADMIN_PASSWORD) return alert("Wrong password!");

  document.getElementById("login-box").classList.add("hidden");
  document.getElementById("admin-panel").classList.remove("hidden");

  loadWordList();
}

async function addWord() {
  const word = document.getElementById("word").value;
  const definition = document.getElementById("definition").value;

  await fetch("/api/words", {
    method: "POST",
    body: JSON.stringify({ word, definition })
  });

  loadWordList();
}

async function deleteWord() {
  const word = document.getElementById("delete-word").value;

  await fetch(`/api/words/${word}`, { method: "DELETE" });

  loadWordList();
}

async function loadWordList() {
  const res = await fetch("/api/words");
  const words = await res.json();

  const list = document.getElementById("word-list");
  list.innerHTML = "";

  words.forEach(w => {
    const li = document.createElement("li");
    li.textContent = `${w.word}: ${w.definition}`;
    list.appendChild(li);
  });
}
