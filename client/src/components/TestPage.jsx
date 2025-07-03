import React from 'react';

const TestPage = () => {
  return (
    <div style={{
      background: 'black', 
       
      width: '100vw', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{color: 'red', fontSize: '48px'}}>TEST PAGE</h1>
      
      <div style={{
        background: 'yellow',
        padding: '20px',
        marginBottom: '30px'
      }}>
        THIS IS A CLOCK PLACEHOLDER
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        width: '80%'
      }}>
        <div style={{background: 'blue', height: '100px', color: 'white'}}>BOX 1</div>
        <div style={{background: 'green', height: '100px', color: 'white'}}>BOX 2</div>
        <div style={{background: 'purple', height: '100px', color: 'white'}}>BOX 3</div>
        <div style={{background: 'orange', height: '100px', color: 'white'}}>BOX 4</div>
      </div>
    </div>
  );
};

export default TestPage;