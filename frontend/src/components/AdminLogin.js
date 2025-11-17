import React, { useState } from "react";

export default function AdminLogin({ onLogin }) {
  const [input, setInput] = useState("");
  const ADMIN_PASSWORD = "DreamgirlAdmin";

  function tryLogin(e) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      localStorage.setItem("admin", "true");
      onLogin(true);
    } else {
      alert("Incorrect password");
    }
  }

  return (
    <div className="pink-card">
      <h2>Admin Login</h2>
      <form onSubmit={tryLogin}>
        <input
          type="password"
          placeholder="Enter admin password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
