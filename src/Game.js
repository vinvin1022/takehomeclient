// src/App.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import './Game.css'

const socket = io('http://localhost:3456/game');

function Game() {
  const [team, setTeam] = useState(null);
  const [ropePosition, setRopePosition] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [history, setHistory] = useState({});
  const [animatePress, setAnimatePress] = useState(false);

  useEffect(() => {
    socket.on('gameStart', () => {
      setGameStarted(true);
      setCountdown(null);
      setMessage('Game started! Press the button!');
    });

    socket.on('updateRope', (data) => {
      setRopePosition(data.position);
    });

    socket.on('gameEnd', (data) => {
      setGameStarted(false);
      setMessage(`${data.winningTeam} team wins!`);
    });

    socket.on('countdown', (timeLeft) => {
      setCountdown(timeLeft);
      setMessage(`Game starting in ${timeLeft} seconds`);
    });

    return () => {
      socket.off('gameStart');
      socket.off('updateRope');
      socket.off('gameEnd');
      socket.off('countdown');
    };
  }, []);

  const joinGame = (selectedTeam) => {
    socket.emit('joinGame', { username, team: selectedTeam });
    setTeam(selectedTeam);
  };

  const handlePress = () => {
    socket.emit('press');
    setAnimatePress(true);
    setTimeout(() => setAnimatePress(false), 100); // 短暂的拉伸动画
  };

  const fetchHistory = async () => {
    if (username) {
      const url = `http://localhost:3456/game/history/${username}`
      const response = await fetch(url);
      const data = await response.json();
      setHistory(data);
    }
    
  };

  return (
    <div className="game-container">
      <h1>拔河比赛</h1>
      <input
        type="text"
        placeholder="用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{display: "block", margin: "0 auto"}}
      />
     
     
      {!team ? (
        <div>
          <button onClick={() => joinGame('left')}>加入左边队伍</button>
          <button onClick={() => joinGame('right')}>加入右边队伍</button>
        </div>
      ) : (
        <div>
          <p>你的队伍: {team}</p>
          {countdown !== null && !gameStarted ? (
            <p>{message}</p>
          ) : (
            <>
              {gameStarted ? (
                <button
                  onClick={handlePress}
                  style={{ animation: animatePress ? 'pullAnimation 0.2s ease' : '' }}
                >
                  Press!
                </button>
              ) : (
                <p>{message}</p>
              )}
        
                <div className="rope-container" style={{ transform: `translateX(${ropePosition * 10}px)` }}>
                  <div className="line"></div>
                  <div className="character left">
                    <span role="img" aria-label="Left Team">👦</span>
                  </div>
                  <div
                    className="rope"
                  >
                    H
                  </div>
                  <div className="character right">
                    <span role="img" aria-label="Right Team">👧</span>
                  </div>
                </div>
              
              <div>
                <p>Rope Position: {ropePosition}</p>
              </div>
            </>
          )}
        </div>
      )}
      <button onClick={() => fetchHistory()}>查看比赛历史记录</button>
      <ul style={{width: "500px", padding: 0, margin: "0 auto", listStyle: "none"}}>
        {history?.history?.map((record, index) => (
          <li key={index}>
            {history.username} - {record.result} - {record.presses} presses
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Game;
