import React from 'react';
import './Home.css';

const Home = ({ onSelectGame }) => {
  return (
    <div className="home-container">
      <h1 className="home-title">Arcade Hub</h1>
      
      <div className="game-selection">
        <div className="game-card" onClick={() => onSelectGame('snake')}>
          <div className="game-icon">🐍</div>
          <div className="game-name">Snake Game</div>
          <div className="game-desc">Classic snake arcade fun</div>
        </div>

        <div className="game-card" onClick={() => onSelectGame('bounce')}>
          <div className="game-icon">⚽</div>
          <div className="game-name">Bouncing Ball</div>
          <div className="game-desc">Simple physics tutorial</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
