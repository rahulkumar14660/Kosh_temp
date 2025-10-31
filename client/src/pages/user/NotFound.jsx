import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const DodgingButton = () => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const container = document.querySelector('.dodging-zone');
    const containerRect = container.getBoundingClientRect();
    const buttonRect = buttonRef.current.getBoundingClientRect();

    const initialTop = (containerRect.height - buttonRect.height) / 2;
    const initialLeft = (containerRect.width - buttonRect.width) / 2;

    setPosition({ top: initialTop, left: initialLeft });
  }, []);

  const moveButton = () => {
    
    if (attempts >= 6) {
      setWon(true);
      return;
    }
    const container = document.querySelector('.dodging-zone');
    const containerRect = container.getBoundingClientRect();
    const buttonRect = buttonRef.current.getBoundingClientRect();

    const maxTop = containerRect.height - buttonRect.height;
    const maxLeft = containerRect.width - buttonRect.width;

    const newTop = Math.random() * maxTop;
    const newLeft = Math.random() * maxLeft;

    setPosition({ top: newTop, left: newLeft });
  };

  return (
    <div className="dodging-zone">
      {!won ? (
        <>
          <p className="warning-text">Whatever you do, <span className="highlight">don’t click this button</span>.</p>
          <button
            ref={buttonRef}
            className="dodging-button fancy-button"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            onMouseEnter={moveButton}
            onClick={() => {setAttempts(prev => prev + 1); moveButton()}}
          >
            🚫 Don't Click Here
          </button>
          <p className="attempts">{attempts}</p>
        </>
      ) : (
        <div className="win-box">
          <h2>🎉 You Win! 🎉</h2>
          <p>You are one stubborn person. 🙃</p>
        </div>
      )}
    </div>
  );
};


const NotFound = () => {
  return (
    <div className="notfound-wrapper">
      <h1 className="error-code">404</h1>
      <p className="error-message">Looks like you’ve reached a dead-end street 🧱</p>
      <Link to="/home" className="go-home-btn">🚀 Go Back Home</Link>

      <DodgingButton />
    </div>
  );
};

export default NotFound;
