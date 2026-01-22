import React, { useRef, useEffect, useState } from "react";
import "./BouncingBallGame.css";

const BouncingBallGame = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const requestRef = useRef();

  // Paddle state
  const paddleRef = useRef({
    x: 250, // Center (600/2 - 100/2)
    width: 100,
    height: 10,
    color: "#ff5252",
  });

  // Ball state
  const ballRef = useRef({
    x: 100,
    y: 100,
    vx: 4,
    vy: 4,
    radius: 10,
    color: "#61dafb",
  });

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const ball = ballRef.current;
    const paddle = paddleRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update position
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce off walls (Left/Right/Top)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
      ball.vx = -ball.vx;
    }

    if (ball.y - ball.radius < 0) {
      ball.vy = -ball.vy;
    }

    // Paddle Collision Logic
    // Check if ball is at the bottom area where paddle is
    if (ball.y + ball.radius >= canvas.height - paddle.height - 5) {
      // Check if it hits the paddle horizontally
      if (ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
        // Bounce back up and increase speed slightly
        ball.vy = -Math.abs(ball.vy * 1.05);
        ball.y = canvas.height - paddle.height - ball.radius - 5; // Prevent sticking

        // Add some "english" based on where it hit the paddle
        const hitPoint = ball.x - (paddle.x + paddle.width / 2);
        ball.vx += hitPoint * 0.1;
      }
    }

    // Game Over Condition (Ball falls through bottom)
    if (ball.y - ball.radius > canvas.height) {
      setGameOver(true);
      setIsRunning(false);
      return;
    }

    // Draw Paddle
    ctx.fillStyle = paddle.color;
    ctx.fillRect(
      paddle.x,
      canvas.height - paddle.height - 5,
      paddle.width,
      paddle.height,
    );

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();

    // Draw trail/glow
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(97, 218, 251, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Center paddle on mouse
    paddleRef.current.x = mouseX - paddleRef.current.width / 2;

    // Clamp to canvas bounds
    if (paddleRef.current.x < 0) paddleRef.current.x = 0;
    if (paddleRef.current.x + paddleRef.current.width > canvas.width) {
      paddleRef.current.x = canvas.width - paddleRef.current.width;
    }

    // Redraw if paused to show paddle movement
    if (!isRunning && !gameOver) {
      requestAnimationFrame(animate);
    }
  };

  const resetGame = () => {
    setGameOver(false);
    setIsRunning(true);
    ballRef.current = {
      x: 100,
      y: 100,
      vx: 4,
      vy: 4,
      radius: 10,
      color: "#61dafb",
    };
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning]);

  const handleCanvasClick = (e) => {
    // Disabled click teleport to make game challenging
    // if (gameOver) return;
    // const canvas = canvasRef.current;
    // const rect = canvas.getBoundingClientRect();
    // const clickX = e.clientX - rect.left;
    // const clickY = e.clientY - rect.top;
    // // Teleport ball to click
    // ballRef.current.x = clickX;
    // ballRef.current.y = clickY;
    // // Randomize velocity slightly
    // ballRef.current.vx = (Math.random() - 0.5) * 15;
    // ballRef.current.vy = (Math.random() - 0.5) * 15;
    // // Random color
    // const colors = ['#61dafb', '#ff5252', '#4caf50', '#ffd700', '#e040fb'];
    // ballRef.current.color = colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="bouncing-ball-container">
      <h2>Bouncing Ball Challenge</h2>
      <div className="canvas-wrapper" style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="ball-canvas"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
        />
        {gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-text">GAME OVER</div>
            <button className="restart-btn" onClick={resetGame}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="controls">
        <button className="game-btn" onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? "Pause" : "Resume"}
        </button>
        <button className="game-btn back-btn" onClick={onBack}>
          Back to Menu
        </button>
      </div>

      <p className="instructions">
        Move your mouse to control the paddle! Don't let the ball drop.
      </p>
    </div>
  );
};

export default BouncingBallGame;
