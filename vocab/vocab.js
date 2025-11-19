let words = [];
let current = 0;
let score = 0;

async function loadWords() {
  const res = await fetch("/api/quizzes");
  words = await res.json();
}

function startQuiz() {
  document.getElementById("results").classList.add("hidden");
  document.getElementById("quiz-container").classList.remove("hidden");

  current = 0;
  score = 0;

  showQuestion();
}

function showQuestion() {
  const q = words[current];
  document.getElementById("question").textContent = q.word;

  const choicesBox = document.getElementById("choices");
  choicesBox.innerHTML = "";

  const correct = q.definition;

  const wrongChoices = words
    .filter(w => w.word !== q.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(w => w.definition);

  const choices = [...wrongChoices, correct].sort(() => Math.random() - 0.5);

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;

    btn.onclick = () => {
      if (choice === correct) score++;
      nextQuestion();
    };

    choicesBox.appendChild(btn);
  });
}

function nextQuestion() {
  current++;
  if (current >= words.length) return endQuiz();
  showQuestion();
}

function endQuiz() {
  document.getElementById("quiz-container").classList.add("hidden");

  document.getElementById("score").textContent =
    `${score} / ${words.length}`;

  document.getElementById("results").classList.remove("hidden");
}

window.onload = async () => {
  await loadWords();
  startQuiz();
};
