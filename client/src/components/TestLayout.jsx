import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Timestamp to verify rendering
const RENDER_TIME = new Date().toLocaleTimeString();

const TestLayout = () => {
  console.log("TestLayout rendering at:", RENDER_TIME);
  
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      console.log("Clock updated:", new Date().toLocaleTimeString());
    }, 1000);
    
    // Debug message to confirm component mounted
    console.log("TestLayout component mounted");
    
    return () => {
      clearInterval(interval);
      console.log("TestLayout component unmounted");
    };
  }, []);

  return (
    <div id="test-layout-root" style={{
      width: "100vw",
      height: "100vh",
      backgroundColor: "#000",
      margin: 0,
      padding: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: "50px"
    }}>
      <h1 style={{
        color: "red",
        fontSize: "36px",
        marginBottom: "20px"
      }}>
        TEST LAYOUT (Rendered at {RENDER_TIME})
      </h1>
      
      <div style={{
        color: "yellow",
        fontSize: "24px",
        border: "3px solid yellow",
        padding: "10px 20px",
        marginBottom: "30px"
      }}>
        Current Time: {time}
      </div>
      
      {/* Explicitly defined box container */}
      <div id="box-container" style={{
        width: "80%",
        maxWidth: "800px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "20px",
        padding: "20px",
        border: "1px dashed white"
      }}>
        {/* Test Box 1 */}
        <div style={{
          width: "calc(50% - 10px)",
          height: "150px",
          backgroundColor: "blue",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
          fontWeight: "bold"
        }}>
          BOX 1
        </div>
        
        {/* Test Box 2 */}
        <div style={{
          width: "calc(50% - 10px)",
          height: "150px",
          backgroundColor: "green",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
          fontWeight: "bold"
        }}>
          BOX 2
        </div>
        
        {/* Test Box 3 */}
        <div style={{
          width: "calc(50% - 10px)",
          height: "150px",
          backgroundColor: "purple",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
          fontWeight: "bold"
        }}>
          BOX 3
        </div>
        
        {/* Test Box 4 */}
        <div style={{
          width: "calc(50% - 10px)",
          height: "150px",
          backgroundColor: "orange",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
          fontWeight: "bold"
        }}>
          BOX 4
        </div>
      </div>
      
      <p style={{
        color: "white",
        marginTop: "30px"
      }}>
        Check console for debugging information
      </p>
    </div>
  );
};

export default TestLayout;