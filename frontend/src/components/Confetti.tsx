import React from 'react';

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

const colors = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe', '#fd79a8'];
const particles: Particle[] = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  x: (i * 37) % 100,
  color: colors[i % colors.length],
  size: (i % 5) * 2 + 6,
  delay: (i % 5) * 0.08,
  duration: 1.5 + (i % 6) * 0.25
}));

export const Confetti: React.FC = () => {

  return (
    <div className="confetti-container" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.id % 2 === 0 ? '50%' : '3px',
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
