import { useEffect, useState } from 'react';

export const CursorGlow = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Main cursor glow */}
      <div
        className="fixed pointer-events-none z-50 mix-blend-screen transition-opacity duration-300"
        style={{
          left: position.x,
          top: position.y,
          opacity: isVisible ? 1 : 0,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-8 h-8 bg-cyan-400/30 rounded-full blur-xl animate-pulse" />
      </div>

      {/* Outer glow ring */}
      <div
        className="fixed pointer-events-none z-50 transition-opacity duration-300"
        style={{
          left: position.x,
          top: position.y,
          opacity: isVisible ? 1 : 0,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-16 h-16 border-2 border-cyan-400/20 rounded-full animate-ping" />
      </div>

      {/* Inner cursor dot */}
      <div
        className="fixed pointer-events-none z-50 transition-opacity duration-300"
        style={{
          left: position.x,
          top: position.y,
          opacity: isVisible ? 1 : 0,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#00d4ff]" />
      </div>
    </>
  );
};
