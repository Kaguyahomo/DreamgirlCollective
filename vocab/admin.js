// Admin credentials (client-side only - NOT secure for production)
const ADMIN_USERNAME = "Rene";
const ADMIN_PASSWORD = "MischiefSisters2!";

// Dictionary API
const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en";

// LocalStorage keys
const STORAGE_KEYS = {
    unusedWords: "vocab_unused_words",
    sentWords: "vocab_sent_words",
    isLoggedIn: "vocab_admin_logged_in"
};

// Current preview word data
let currentPreviewWord = null;

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    // Check if already logged in
    if (sessionStorage.getItem(STORAGE_KEYS.isLoggedIn) === "true") {
        showAdminPanel();
    }
    
    // Add enter key support for login
    const passwordInput = document.getElementById("password");
    if (passwordInput) {
        passwordInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                adminLogin();
            }
        });
    }
    
    // Add enter key support for word lookup
    const lookupInput = document.getElementById("lookup-word");
    if (lookupInput) {
        lookupInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                lookupWord();
            }
        });
    }
});

// Login function
function adminLogin() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("login-error");
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem(STORAGE_KEYS.isLoggedIn, "true");
        showAdminPanel();
    } else {
        errorEl.textContent = "Invalid username or password.";
        errorEl.classList.remove("hidden");
    }
}

// Logout function
function adminLogout() {
    sessionStorage.removeItem(STORAGE_KEYS.isLoggedIn);
    document.getElementById("login-section").classList.remove("hidden");
    document.getElementById("admin-panel").classList.add("hidden");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("login-error").classList.add("hidden");
}

// Show admin panel after successful login
function showAdminPanel() {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("admin-panel").classList.remove("hidden");
    loadWordLists();
}

// Lookup word from dictionary API
async function lookupWord() {
    const word = document.getElementById("lookup-word").value.trim().toLowerCase();
    
    if (!word) {
        showLookupError("Please enter a word to look up.");
        return;
    }
    
    // Show loading, hide previous results
    document.getElementById("lookup-loading").classList.remove("hidden");
    document.getElementById("lookup-error").classList.add("hidden");
    document.getElementById("preview-box").classList.add("hidden");
    currentPreviewWord = null;
    
    try {
        const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(word)}`);
        
        if (!response.ok) {
            throw new Error("Word not found in dictionary.");
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            throw new Error("No definitions found.");
        }
        
        const entry = data[0];
        const wordText = entry.word || word;
        const phonetic = entry.phonetic || (entry.phonetics && entry.phonetics[0]?.text) || "";
        
        // Get the first definition
        let definition = "No definition available.";
        if (entry.meanings && entry.meanings.length > 0) {
            const firstMeaning = entry.meanings[0];
            if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
                definition = firstMeaning.definitions[0].definition;
            }
        }
        
        // Store current preview
        currentPreviewWord = {
            word: wordText,
            definition: definition,
            phonetic: phonetic
        };
        
        // Display preview
        document.getElementById("preview-word").textContent = wordText;
        document.getElementById("preview-phonetic").textContent = phonetic;
        document.getElementById("preview-definition").textContent = definition;
        document.getElementById("preview-box").classList.remove("hidden");
        
    } catch (error) {
        showLookupError(error.message || "Failed to look up word.");
    } finally {
        document.getElementById("lookup-loading").classList.add("hidden");
    }
}

// Show lookup error
function showLookupError(message) {
    const errorEl = document.getElementById("lookup-error");
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
}

// Add current preview word to unused list
function addToUnused() {
    if (!currentPreviewWord) return;
    
    const unusedWords = getUnusedWords();
    
    // Check if word already exists
    const exists = unusedWords.some(w => w.word.toLowerCase() === currentPreviewWord.word.toLowerCase());
    if (exists) {
        showLookupError("This word is already in the Unused Words list.");
        return;
    }
    
    // Also check sent words
    const sentWords = getSentWords();
    const existsInSent = sentWords.some(w => w.word.toLowerCase() === currentPreviewWord.word.toLowerCase());
    if (existsInSent) {
        showLookupError("This word is already in the Sent Words list.");
        return;
    }
    
    // Add to unused words
    unusedWords.push({
        word: currentPreviewWord.word,
        definition: currentPreviewWord.definition,
        addedAt: new Date().toISOString()
    });
    
    saveUnusedWords(unusedWords);
    loadWordLists();
    
    // Clear preview
    currentPreviewWord = null;
    document.getElementById("preview-box").classList.add("hidden");
    document.getElementById("lookup-word").value = "";
}

// Get unused words from localStorage
function getUnusedWords() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.unusedWords);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error reading unused words:", e);
        return [];
    }
}

// Save unused words to localStorage
function saveUnusedWords(words) {
    localStorage.setItem(STORAGE_KEYS.unusedWords, JSON.stringify(words));
}

// Get sent words from localStorage
function getSentWords() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.sentWords);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error reading sent words:", e);
        return [];
    }
}

// Save sent words to localStorage
function saveSentWords(words) {
    localStorage.setItem(STORAGE_KEYS.sentWords, JSON.stringify(words));
}

// Load and render word lists
function loadWordLists() {
    renderUnusedWords();
    renderSentWords();
}

// Render unused words list
function renderUnusedWords() {
    const words = getUnusedWords();
    const listEl = document.getElementById("unused-list");
    const countEl = document.getElementById("unused-count");
    
    countEl.textContent = words.length;
    
    if (words.length === 0) {
        listEl.innerHTML = '<li class="empty-list">No unused words yet.</li>';
        return;
    }
    
    listEl.innerHTML = words.map((w, index) => `
        <li class="word-item">
            <div class="word-name">${escapeHtml(w.word)}</div>
            <div class="word-def">${escapeHtml(w.definition)}</div>
            <div class="word-item-actions">
                <button class="btn-send" onclick="sendWord(${index})">Send</button>
                <button class="btn-delete" onclick="deleteUnusedWord(${index})">Delete</button>
            </div>
        </li>
    `).join("");
}

// Render sent words list
function renderSentWords() {
    const words = getSentWords();
    const listEl = document.getElementById("sent-list");
    const countEl = document.getElementById("sent-count");
    
    countEl.textContent = words.length;
    
    if (words.length === 0) {
        listEl.innerHTML = '<li class="empty-list">No sent words yet.</li>';
        return;
    }
    
    listEl.innerHTML = words.map((w, index) => `
        <li class="word-item">
            <div class="word-name">${escapeHtml(w.word)}</div>
            <div class="word-def">${escapeHtml(w.definition)}</div>
            <div class="word-item-actions">
                <button class="btn-undo" onclick="undoSendWord(${index})">Undo</button>
                <button class="btn-delete" onclick="deleteSentWord(${index})">Delete</button>
            </div>
        </li>
    `).join("");
}

// Send word from unused to sent
function sendWord(index) {
    const unusedWords = getUnusedWords();
    const sentWords = getSentWords();
    
    if (index < 0 || index >= unusedWords.length) return;
    
    const word = unusedWords.splice(index, 1)[0];
    word.sentAt = new Date().toISOString();
    sentWords.push(word);
    
    saveUnusedWords(unusedWords);
    saveSentWords(sentWords);
    loadWordLists();
}

// Undo send - move word from sent back to unused
function undoSendWord(index) {
    const unusedWords = getUnusedWords();
    const sentWords = getSentWords();
    
    if (index < 0 || index >= sentWords.length) return;
    
    const word = sentWords.splice(index, 1)[0];
    delete word.sentAt;
    unusedWords.push(word);
    
    saveUnusedWords(unusedWords);
    saveSentWords(sentWords);
    loadWordLists();
}

// Delete word from unused list
function deleteUnusedWord(index) {
    const words = getUnusedWords();
    
    if (index < 0 || index >= words.length) return;
    
    if (confirm(`Delete "${words[index].word}" from unused words?`)) {
        words.splice(index, 1);
        saveUnusedWords(words);
        loadWordLists();
    }
}

// Delete word from sent list
function deleteSentWord(index) {
    const words = getSentWords();
    
    if (index < 0 || index >= words.length) return;
    
    if (confirm(`Delete "${words[index].word}" from sent words?`)) {
        words.splice(index, 1);
        saveSentWords(words);
        loadWordLists();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
