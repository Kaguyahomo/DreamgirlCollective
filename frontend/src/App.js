import React, { useState } from "react";
import AdminWordBank from "./components/AdminWordBank";
import DailyQuiz from "./components/DailyQuiz";
import Leaderboard from "./components/Leaderboard";
import LoginSignup from "./components/LoginSignup";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      <h1>Wordle Vocab Quiz</h1>
      {!user &&
        <LoginSignup setUser={setUser} />
      }
      {user &&
        <>
          <button onClick={() => setUser(null)}>Logout</button>
          <DailyQuiz user={user} />
          <Leaderboard />
          {user.is_admin && <AdminWordBank />}
        </>
      }
    </div>
  );
}
export default App;