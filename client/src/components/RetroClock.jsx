import React, { useState, useEffect } from 'react';

const RetroClock = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{
      width: '300px',
      height: '120px',
      backgroundColor: 'black',
      border: '3px solid red',
      color: 'lime',
      fontSize: '28px',
      fontWeight: 'bold',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '20px auto',
      padding: '10px',
      boxShadow: '0 0 20px red',
      zIndex: 999,
      position: 'relative'
    }}>
      {time.toLocaleTimeString()}
    </div>
  );
};

export default RetroClock;