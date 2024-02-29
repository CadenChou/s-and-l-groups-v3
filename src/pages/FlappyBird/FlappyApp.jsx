// App.js

import React, { useState, useEffect } from "react";

import GameEngine from "./GameEngine";

const App = () => {
  const [birdPosition, setBirdPosition] = useState({ x: 50, y: 200 });
  const [pipes, setPipes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const jump = () => {
    if (!gameOver && gameStarted) {
      setBirdPosition((prev) => ({ ...prev, y: prev.y - 60 }));
    } else if (!gameOver && !gameStarted) {
      // Start the game on the first jump
      setGameStarted(true);
    } else {
      // Restart the game
      setBirdPosition({ x: 50, y: 200 });
      setPipes([]);
      setGameOver(false);
      setGameStarted(true);
      setScore(0);
    }
  };

  if (gameOver) {
    return (
      <div className="overflow-hidden">
        <div className={`App ${gameOver ? "game-over" : ""}`}>
          <center>
            <div className="game-over-message">
              Game Over!
              <br />
              <button
                onClick={jump}
                style={{
                  backgroundColor: "#89CFF0",
                  padding: "5px 10px",
                  borderRadius: "10px",
                }}
              >
                Click to Restart
              </button>
            </div>
          </center>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden">
      <GameEngine
        birdPosition={birdPosition}
        pipes={pipes}
        score={score}
        gameStarted={gameStarted}
        gameOver={gameOver}
        setBirdPosition={setBirdPosition}
        setPipes={setPipes}
        setScore={setScore}
        setGameStarted={setGameStarted}
        setGameOver={setGameOver}
      />
    </div>
  );
};

export default App;
