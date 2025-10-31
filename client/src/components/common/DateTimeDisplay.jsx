import React, { useState, useEffect } from 'react';
const DateTimeDisplay = () => {
  const [dateTime, setDateTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="header-datetime">
      <p>{dateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <h3>{dateTime.toLocaleTimeString('en-US')}</h3>
    </div>
  );
};
export default DateTimeDisplay;
