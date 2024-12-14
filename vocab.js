let vocabWords = []; // Holds the selected words for the week

// Fetch current week's words
async function fetchCurrentWeekWords() {
    try {
        const response = await fetch('current-week.json'); // Fetch current week's words
        if (response.ok) {
            vocabWords = await response.json();
            console.log('Current Week Words:', vocabWords); // Debug log
        } else {
            console.log('current-week.json not found. Selecting new words...');
            await selectNewWords();
        }
        loadContent(); // Load content after fetching or selecting words
    } catch (error) {
        console.error('Error fetching current-week.json:', error);
    }
}

// Select 10 random words and update current-week.json
async function selectNewWords() {
    try {
        const response = await fetch('vocab.json'); // Fetch all vocab words
        const allWords = await response.json();
        console.log('All Words:', allWords); // Debug log

        if (allWords.length === 0) {
            alert('No more words available in the database!');
            return;
        }

        // Shuffle and select 10 words
        vocabWords = allWords.sort(() => 0.5 - Math.random()).slice(0, 10);
        console.log('Selected Words:', vocabWords); // Debug log

        // Save selected words to current-week.json
        await saveJSON('current-week.json', vocabWords);

        // Remove selected words from vocab.json
        const remainingWords = allWords.filter(word => 
            !vocabWords.find(selected => selected.word === word.word)
        );
        console.log('Remaining Words:', remainingWords); // Debug log
        await saveJSON('vocab.json', remainingWords);

    } catch (error) {
        console.error('Error selecting new words:', error);
    }
}

// Save JSON data to the server
async function saveJSON(filename, data) {
    try {
        const response = await fetch(`save-json.php?filename=${filename}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error(`Error saving ${filename}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
    }
}

// Load Content: Display words or quiz
function loadContent() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const contentDiv = document.getElementById('content');

    if (day === 0 && hour === 12) {
        // Quiz live on Sunday at noon
        showQuiz(contentDiv);
    } else {
        // Show study words
        showWords(contentDiv);
    }
}

// Display vocabulary words for study
function showWords(contentDiv) {
    if (!vocabWords || vocabWords.length === 0) {
        console.error('No vocabulary words available to display.');
        contentDiv.innerHTML = '<p>No vocabulary words available. Please try again later.</p>';
        return;
    }

    contentDiv.innerHTML = '<h2>Study This Week\'s Words</h2>';
    vocabWords.forEach(({ word, definition }) => {
        const entry = document.createElement('p');
        entry.textContent = `${word} - ${definition}`;
        contentDiv.appendChild(entry);
    });
}

// Display quiz
function showQuiz(contentDiv) {
    if (!vocabWords || vocabWords.length === 0) {
        console.error('No vocabulary words available for the quiz.');
        contentDiv.innerHTML = '<p>No quiz available at this time. Please try again later.</p>';
        return;
    }

    contentDiv.innerHTML = `
        <h2>Weekly Quiz</h2>
        <label for="name">Enter Your Name:</label>
        <input type="text" id="name" placeholder="Your Name" required>
    `;

    vocabWords.forEach(({ word }) => {
        const quizEntry = document.createElement('div');
        quizEntry.innerHTML = `
            <p>${word}</p>
            <input type="text" placeholder="Enter your definition" required>
        `;
        contentDiv.appendChild(quizEntry);
    });

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Quiz';
    contentDiv.appendChild(submitButton);

    submitButton.addEventListener('click', handleSubmitQuiz);
}

// Handle quiz submission
async function handleSubmitQuiz() {
    const name = document.getElementById('name').value;
    const answers = Array.from(document.querySelectorAll('.middle input[type="text"]')).map(input => input.value);

    // Grade the quiz
    let score = 0;
    answers.forEach((answer, index) => {
        if (answer.toLowerCase() === vocabWords[index].definition.toLowerCase()) {
            score++;
        }
    });

    // Update leaderboard dynamically
    const leaderboardList = document.getElementById('leaderboard');
    const listItem = document.createElement('li');
    listItem.textContent = `${name} - ${score}/${vocabWords.length}`;
    leaderboardList.appendChild(listItem);

    alert(`You scored ${score}/${vocabWords.length}`);

    // Display next week's words
    await selectNewWords();
    showWords(document.getElementById('content'));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchCurrentWeekWords();
});