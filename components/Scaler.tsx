'use client';
import React, { useEffect, useRef, useState } from 'react';

interface ScaledAppProps {
  children: React.ReactNode;
}

const ScaledApp: React.FC<ScaledAppProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 }); // Default dimensions

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        setDimensions({ width: newWidth, height: newHeight });

        const scaleX = window.innerWidth / newWidth;
        const scaleY = window.innerHeight / newHeight;
        setScale(Math.min(scaleX, scaleY));
      }
    };

    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      {children}
    </div>
  );
};

export default ScaledApp;
