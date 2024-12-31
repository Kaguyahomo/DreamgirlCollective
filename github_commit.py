import requests
import base64

# Personal Access Token
GITHUB_TOKEN = "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"

# Repository details
GITHUB_USER = "Kaguyahomo"
REPO_NAME = "DreamgirlCollective"
BRANCH = "main"

# API base URL
API_URL = f"https://api.github.com/repos/{GITHUB_USER}/{REPO_NAME}/contents"

# Files to commit
FILES = {
    "app.py": """from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello, Flask!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
""",
    "scheduler.py": """# Scheduler script
import time

print('Scheduler running...')
time.sleep(60)
""",
    "templates/index.html": """<html>
<head><title>Weekly Vocab Quiz</title></head>
<body>
<h1>Weekly Vocab Quiz</h1>
<p>Welcome to the quiz page!</p>
</body>
</html>
""",
    "static/styles.css": """body {
    background-color: lavender;
}
""",
    "static/script.js": """console.log('Hello, JS!');
""",
    "wordbank.json": """[
    {"word": "Example", "part_of_speech": "noun", "definition": "A sample."}
]
""",
    "selected_words.json": "[]",
    "leaderboard.json": "[]",
}

def commit_file(file_path, content):
    # Encode file content to Base64
    encoded_content = base64.b64encode(content.encode("utf-8")).decode("utf-8")
    file_url = f"{API_URL}/{file_path}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Content-Type": "application/json",
    }

    # Check if file exists
    response = requests.get(file_url, headers=headers)
    if response.status_code == 200:
        sha = response.json()["sha"]
    else:
        sha = None

    # Create or update file
    payload = {
        "message": f"Add or update {file_path}",
        "content": encoded_content,
        "branch": BRANCH,
    }
    if sha:
        payload["sha"] = sha

    commit_response = requests.put(file_url, json=payload, headers=headers)

    if commit_response.status_code in [200, 201]:
        print(f"Successfully committed {file_path}.")
    else:
        print(f"Failed to commit {file_path}: {commit_response.json()}")

# Commit each file
for file_path, content in FILES.items():
    commit_file(file_path, content)
