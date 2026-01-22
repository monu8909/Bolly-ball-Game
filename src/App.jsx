import React, { useState } from "react";
import SnakeGame from "./SnakeGame";
import BouncingBallGame from "./BouncingBallGame";
import Home from "./Home";
import "./App.css";

function App() {
  const [activeGame, setActiveGame] = useState(null); // null, 'snake', 'bounce'

  const renderContent = () => {
    switch (activeGame) {
      case "snake":
        return (
          <div className="game-wrapper">
            <button
              className="back-button-overlay"
              onClick={() => setActiveGame(null)}
            >
              ← Back to Menu
            </button>
            <SnakeGame />
          </div>
        );
      case "bounce":
        return <BouncingBallGame onBack={() => setActiveGame(null)} />;
      default:
        return <Home onSelectGame={setActiveGame} />;
    }
  };

  return <div className="App">{renderContent()}</div>;
}

export default App;
