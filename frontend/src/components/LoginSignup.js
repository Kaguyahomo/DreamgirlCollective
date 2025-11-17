import React, { useState } from "react";
import api from "../api";

export default function LoginSignup({ setUser }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const route = mode === "login" ? "/users/login" : "/users/signup";
    try {
      const res = await api.post(route, { username, password });
      if (mode === "login") {
        setUser(res.data.user);
        localStorage.setItem("token", res.data.token);
      } else {
        alert("Signup successful! You can log in now.");
        setMode("login");
      }
    } catch {
      alert("Error, try again.");
    }
  };

  return (
    <div>
      <h2>{mode === "login" ? "Login" : "Signup"}</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}/>
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}/>
      <button onClick={submit}>{mode === "login" ? "Login" : "Signup"}</button>
      <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>Switch to {mode === "login" ? "Signup" : "Login"}</button>
    </div>
  );
}