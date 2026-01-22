import React, { useState, useEffect, useCallback, useRef } from "react";
import "./SnakeGame.css";

const CELL_SIZE = 25; // px
const BOARD_WIDTH = 40; // cells
const BOARD_HEIGHT = 20; // cells
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;
const MIN_SPEED = 50;

const DIRECTION = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
};

const getRandomPosition = (snake = []) => {
  let position;
  let isOnSnake = true;
  while (isOnSnake) {
    position = {
      x: Math.floor(Math.random() * BOARD_WIDTH),
      y: Math.floor(Math.random() * BOARD_HEIGHT),
    };
    isOnSnake = snake.some(
      (segment) => segment.x === position.x && segment.y === position.y,
    );
  }
  return position;
};

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  console.log("snake----->", snake);
  const [food, setFood] = useState(getRandomPosition([{ x: 10, y: 10 }]));
  const [direction, setDirection] = useState(DIRECTION.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    localStorage.getItem("snakeHighScore") || 0,
  );
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const [fogParticles, setFogParticles] = useState([]);
  const [sparkleParticles, setSparkleParticles] = useState([]);
  const [isShake, setIsShake] = useState(false);
  const [scoreBump, setScoreBump] = useState(false);

  // Use ref for direction to avoid closure stale state in interval
  const directionRef = useRef(DIRECTION.RIGHT);
  // console.log("directionRef----->", directionRef);

  const isMoveProcessed = useRef(true);
  // console.log("isMoveProcessed----->", isMoveProcessed);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(getRandomPosition([{ x: 10, y: 10 }]));
    setDirection(DIRECTION.RIGHT);
    directionRef.current = DIRECTION.RIGHT;
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
    setFogParticles([]);
    setSparkleParticles([]);
    setIsShake(false);
    isMoveProcessed.current = true;
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (gameOver) return;

      if (e.key === " ") {
        setIsPaused((prev) => !prev);
        return;
      }

      // Prevent reverse direction and multiple moves per tick
      if (!isMoveProcessed.current && !isPaused) return;

      switch (e.key) {
        case "ArrowUp":
          if (directionRef.current !== DIRECTION.DOWN) {
            directionRef.current = DIRECTION.UP;
            setDirection(DIRECTION.UP);
            isMoveProcessed.current = false;
          }
          break;
        case "ArrowDown":
          if (directionRef.current !== DIRECTION.UP) {
            directionRef.current = DIRECTION.DOWN;
            setDirection(DIRECTION.DOWN);
            isMoveProcessed.current = false;
          }
          break;
        case "ArrowLeft":
          if (directionRef.current !== DIRECTION.RIGHT) {
            directionRef.current = DIRECTION.LEFT;
            setDirection(DIRECTION.LEFT);
            isMoveProcessed.current = false;
          }
          break;
        case "ArrowRight":
          if (directionRef.current !== DIRECTION.LEFT) {
            directionRef.current = DIRECTION.RIGHT;
            setDirection(DIRECTION.RIGHT);
            isMoveProcessed.current = false;
          }
          break;
        default:
          break;
      }
    },
    [gameOver, isPaused],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };

      switch (directionRef.current) {
        case DIRECTION.UP:
          head.y -= 1;
          break;
        case DIRECTION.DOWN:
          head.y += 1;
          break;
        case DIRECTION.LEFT:
          head.x -= 1;
          break;
        case DIRECTION.RIGHT:
          head.x += 1;
          break;
        default:
          break;
      }

      // Check collision with walls
      if (
        head.x < 0 ||
        head.x >= BOARD_WIDTH ||
        head.y < 0 ||
        head.y >= BOARD_HEIGHT
      ) {
        setGameOver(true);
        setIsShake(true);
        return prevSnake;
      }

      // Check collision with self
      for (let segment of prevSnake) {
        if (head.x === segment.x && head.y === segment.y) {
          setGameOver(true);
          setIsShake(true);
          return prevSnake;
        }
      }

      const newSnake = [head, ...prevSnake];

      // Check collision with food
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("snakeHighScore", newScore);
          }
          return newScore;
        });
        setScoreBump(true);
        setTimeout(() => setScoreBump(false), 200);

        // Spawn Sparkles
        const newSparkles = [];
        for (let i = 0; i < 8; i++) {
          newSparkles.push({
            id: Date.now() + i,
            x: head.x,
            y: head.y,
            tx: (Math.random() - 0.5) * 100 + "px",
            ty: (Math.random() - 0.5) * 100 + "px",
          });
        }
        setSparkleParticles((prev) => [...prev, ...newSparkles]);

        setFood(getRandomPosition(newSnake));
        setSpeed((prev) => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
      } else {
        newSnake.pop(); // Remove tail
      }

      isMoveProcessed.current = true;
      return newSnake;
    });
  }, [food, gameOver, highScore, isPaused]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    // Spawn fog at the head position
    const head = snake[0];
    setFogParticles((prev) => {
      const now = Date.now();
      // Cleanup old particles (older than 1s)
      const valid = prev.filter((p) => now - p.id < 1000);
      return [...valid, { x: head.x, y: head.y, id: now }];
    });

    // Cleanup sparkles
    setSparkleParticles((prev) => {
      const now = Date.now();
      return prev.filter((p) => now - p.id < 600);
    });
  }, [snake, gameOver, isPaused]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, speed]);

  return (
    <div className="snake-game-container">
      <div className="score-board">
        <div className={`score-item ${scoreBump ? "bump" : ""}`}>
          Score: {score}
        </div>
        <div className="score-item" style={{ color: "#aaa" }}>
          High Score: {highScore}
        </div>
      </div>

      <div
        className={`game-area ${isShake ? "shake" : ""}`}
        style={{
          width: BOARD_WIDTH * CELL_SIZE,
          height: BOARD_HEIGHT * CELL_SIZE,
        }}
      >
        {gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-text">GAME OVER</div>
            <button className="restart-btn" onClick={resetGame}>
              Play Again
            </button>
          </div>
        )}

        {/* Render Fog Particles */}
        {fogParticles.map((p) => (
          <div
            key={p.id}
            className="fog-particle"
            style={{
              left: p.x * CELL_SIZE,
              top: p.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          />
        ))}

        {/* Render Sparkle Particles */}
        {sparkleParticles.map((p) => (
          <div
            key={p.id}
            className="sparkle-particle"
            style={{
              left: p.x * CELL_SIZE,
              top: p.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              "--tx": p.tx,
              "--ty": p.ty,
            }}
          />
        ))}

        {/* Render Food */}
        <div
          className="food"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        />

        {/* Render Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`snake-segment ${index === 0 ? "snake-head" : ""}`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              transition: `left ${speed}ms linear, top ${speed}ms linear`,
            }}
          />
        ))}
      </div>

      <div className="controls-hint">
        Use <strong>Arrow Keys</strong> to move. Press <strong>Space</strong> to
        pause.
      </div>
    </div>
  );
};

export default SnakeGame;
