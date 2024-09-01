// components/LoadingBar.tsx
import React from 'react';

const LoadingBar: React.FC = () => {
  const loadingContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100px', // Adjust width as needed
    height: '10px', // Adjust height as needed
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Light background for contrast
    overflow: 'hidden',
  };

  const loadingBarStyle: React.CSSProperties = {
    width: '100%',

    height: '100%',
    backgroundColor: 'black',
    animation: 'oscillate 1s infinite ease-in-out',
  };

  return (
    <>
      <style jsx>{`
        @keyframes oscillate {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
      <div style={loadingContainerStyle}>
        <div style={loadingBarStyle}></div>
      </div>
    </>
  );
};

export default LoadingBar;
