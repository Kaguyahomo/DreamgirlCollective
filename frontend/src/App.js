import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import VocabHome from "./components/VocabHome";
import VocabQuiz from "./components/VocabQuiz";
import Leaderboard from "./components/Leaderboard";
import AdminLogin from "./components/AdminLogin";
import AdminWordBank from "./components/AdminWordBank";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Vocab hub */}
        <Route path="/vocab" element={<VocabHome />} />

        {/* Quiz */}
        <Route path="/quiz" element={<VocabQuiz />} />

        {/* Leaderboard */}
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Admin access */}
        <Route
          path="/admin/words"
          element={
            localStorage.getItem("admin") ? (
              <AdminWordBank />
            ) : (
              <AdminLogin onLogin={() => window.location.reload()} />
            )
          }
        />

      </Routes>
    </Router>
  );
}
<Route
  path="/admin/backup"
  element={
    localStorage.getItem("admin") ? (
      <AdminBackupWords />
    ) : (
      <AdminLogin onLogin={() => window.location.reload()} />
    )
  }
/>
