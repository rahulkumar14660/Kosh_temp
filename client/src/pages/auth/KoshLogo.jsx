import React from 'react';
import { FaLandmark } from 'react-icons/fa';

const KoshLogo = () => {
  const gradientStyle = {
    background: '#ffffff',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1,
    }}>
      <span style={{color: '#2E3C7F'}}>
        <FaLandmark />
      </span>
      <span style={gradientStyle}>
        Kosh
      </span>
    </div>
  );
};

export default KoshLogo;
