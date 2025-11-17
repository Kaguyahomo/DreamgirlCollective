import React, { useEffect, useState } from "react";

export default function Leaderboard() {
  const [list, setList] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("http://localhost:3001/api/leaderboard/week");
    const data = await res.json();
    setList(data.leaderboard);
  }

  return (
    <div className="pink-card" style={{ maxWidth: "500px" }}>
      <h2>Weekly Leaderboard ??</h2>

      <ul style={{ textAlign: "left" }}>
        {list.map((row, i) => (
          <li key={i} style={{ margin: "6px 0" }}>
            <strong>{i + 1}.</strong> {row.name} — {row.score}
          </li>
        ))}
      </ul>

      {list.length === 0 && <p>No scores yet ??</p>}
    </div>
  );
}
