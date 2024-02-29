import React, { useState, useEffect } from "react";
import Bird from "./components/Bird";
import Pipes from "./components/Pipes";

const GameEngine = ({
  birdPosition,
  pipes,
  gameOver,
  score,
  gameStarted,
  setBirdPosition,
  setPipes,
  setGameOver,
  setScore,
  setGameStarted,
}) => {
  const jump = () => {
    if (!gameOver && gameStarted) {
      // For smoother jumping animation
      const jumpInterval = setInterval(() => {
        setBirdPosition((prev) => ({ ...prev, y: prev.y - 12.5 }));
      }, 20);
      setTimeout(() => clearInterval(jumpInterval), 100);
      // setBirdPosition((prev) => ({ ...prev, y: prev.y - 60 }));
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

  useEffect(() => {}, [score]);

  const checkCollision = () => {
    const birdTop = birdPosition.y;
    const birdBottom = birdPosition.y + 20;
    const birdLeft = birdPosition.x;
    const birdRight = birdPosition.x + 40;

    pipes.forEach((pipe) => {
      const pipeTop = pipe.y;
      const pipeBottom = pipe.y + 600;
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + 100;

      const isColliding =
        birdRight > pipeLeft &&
        birdLeft < pipeRight &&
        birdBottom > pipeTop &&
        birdTop < pipeBottom;

      if (isColliding) {
        // Bird has hit the pipe, end the game
        setGameOver(true);
        setGameStarted(false);
      } else if (!pipe.passed && birdLeft > pipeLeft) {
        setPipes((prevPipes) =>
          prevPipes.map((prevPipe) =>
            prevPipe === pipe ? { ...prevPipe, passed: true } : prevPipe
          )
        );
        setScore((prevScore) => prevScore + 1);
      }
    });

    // Check if bird is out of the screen vertically
    if (birdBottom > 800 || birdTop < -170) {
      // Bird is out of bounds, end the game
      setGameOver(true);
      setGameStarted(false);
    }
  };

  useEffect(() => {
    checkCollision();
  }, [birdPosition, pipes]);

  useEffect(() => {
    const gravity = setInterval(() => {
      setBirdPosition((prev) => ({ ...prev, y: prev.y + 2.5 }));
      checkCollision();
    }, 15);

    const pipeGenerator = setInterval(() => {
      if (!gameOver && gameStarted) {
        setPipes((prev) => [
          ...prev,
          { x: 400, y: Math.floor(Math.random() * 500), passed: false },
        ]);
      }
    }, 2000);

    const pipeMove = setInterval(() => {
      if (!gameOver && gameStarted) {
        setPipes((prev) => prev.map((pipe) => ({ ...pipe, x: pipe.x - 2.5 })));
      }
    }, 15);

    return () => {
      clearInterval(gravity);
      clearInterval(pipeGenerator);
      clearInterval(pipeMove);
    };
  }, [gameOver, gameStarted]);

  return (
    <div className="overflow-hidden">
      <div className={`App ${gameOver ? "game-over" : ""}`} onClick={jump}>
        <div>score: {score}</div>
        <Bird birdPosition={birdPosition} />
        {pipes.map((pipe, index) => (
          <Pipes key={index} pipePosition={pipe} />
        ))}
      </div>
    </div>
  );
};

export default GameEngine;
