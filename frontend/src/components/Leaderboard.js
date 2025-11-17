import React, { useState, useEffect } from "react";
import api from "../api";

export default function Leaderboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/scores/leaderboard").then(res => setData(res.data.leaderboard));
  }, []);

  return (
    <div>
      <h2>Leaderboard (today)</h2>
      <ul>
        {data.map((e, i) => (
          <li key={i}>{e.username}: {e.score}/5</li>
        ))}
      </ul>
    </div>
  );
}