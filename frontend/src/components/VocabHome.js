# --- Dreamgirl Vocab Build Script ---

cd "C:\Users\kaguy\DreamgirlCollective"

# ========== FRONTEND COMPONENTS ==========

@"
import React from "react";
import { Link } from "react-router-dom";

export default function VocabHome() {
  return (
    <div className="pink-card" style={{ maxWidth: "440px" }}>
      <h2>Dreamgirl Vocabulary Hub ??</h2>

      <p style={{ color: "#ff66aa" }}>Sharpen your mind, one pink word at a time.</p>

      <Link to="/quiz">
        <button style={{ width: "100%", marginTop: "14px" }}>Start Quiz</button>
      </Link>

      <Link to="/leaderboard">
        <button style={{ width: "100%", marginTop: "14px" }}>Weekly Leaderboard</button>
      </Link>

      <Link to="/admin/words">
        <button style={{ width: "100%", marginTop: "14px" }}>Admin Console</button>
      </Link>
    </div>
  );
}
