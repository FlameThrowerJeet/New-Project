import React, { useEffect, useState } from 'react';

interface StreamDebugProps {
  url: string;
  label: string;
}

const PhoneStreamDebug: React.FC<StreamDebugProps> = ({ url, label }) => {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const testMethods = async () => {
      const tests = [];
      
      // Test 1: Direct fetch
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        tests.push({ 
          method: 'Direct Fetch',
          status: 'SUCCESS',
          info: `Status: ${response.status}`
        });
      } catch (error) {
        tests.push({
          method: 'Direct Fetch',
          status: 'FAILED',
          info: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      // Test 2: Try common iPhone streaming paths
      const paths = ['/', '/video', '/mjpeg', '/stream', '/cam'];
      for (const path of paths) {
        try {
          const testUrl = url + path;
          const response = await fetch(testUrl, { 
            method: 'HEAD',
            mode: 'no-cors'
          });
          tests.push({
            method: `Path Test: ${path}`,
            status: 'SUCCESS',
            info: testUrl
          });
        } catch (error) {
          tests.push({
            method: `Path Test: ${path}`,
            status: 'FAILED',
            info: url + path
          });
        }
      }
      
      setResults(tests);
    };

    testMethods();
  }, [url]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '80vh',
      background: 'rgba(0,0,0,0.9)',
      color: '#00d4aa',
      padding: '20px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      <h3>🔍 {label} Stream Debug</h3>
      <div><strong>URL:</strong> {url}</div>
      <hr style={{ margin: '10px 0', borderColor: '#333' }} />
      
      {results.length === 0 ? (
        <div>⏳ Testing connectivity...</div>
      ) : (
        results.map((result, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <div style={{ 
              color: result.status === 'SUCCESS' ? '#00ff00' : '#ff4444',
              fontWeight: 'bold'
            }}>
              {result.status === 'SUCCESS' ? '✅' : '❌'} {result.method}
            </div>
            <div style={{ color: '#ccc', fontSize: '10px', paddingLeft: '20px' }}>
              {result.info}
            </div>
          </div>
        ))
      )}
      
      <hr style={{ margin: '10px 0', borderColor: '#333' }} />
      <div style={{ fontSize: '10px', color: '#888' }}>
        This debug panel helps identify the correct stream method for your iPhone.
      </div>
      
      {/* Quick test links */}
      <div style={{ marginTop: '10px' }}>
        <div><strong>Quick Tests:</strong></div>
        <div>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#00d4aa' }}>
            Open in new tab
          </a>
        </div>
        <div>
          <a href={url + '/video'} target="_blank" rel="noopener noreferrer" style={{ color: '#00d4aa' }}>
            Try /video
          </a>
        </div>
        <div>
          <a href={url + '/mjpeg'} target="_blank" rel="noopener noreferrer" style={{ color: '#00d4aa' }}>
            Try /mjpeg
          </a>
        </div>
      </div>
    </div>
  );
};

export default PhoneStreamDebug; 