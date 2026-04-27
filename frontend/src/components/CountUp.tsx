import React, { useState, useEffect, useRef } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  start?: number;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 1000, decimals = 0, suffix = '', start = 0 }) => {
  const [count, setCount] = useState(start);
  const previousEnd = useRef(start);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const initialValue = previousEnd.current;
    const delta = end - initialValue;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const currentCount = initialValue + (progress * delta);
      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        previousEnd.current = end;
      }
    };

    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span className="count-up-val">{count.toFixed(decimals)}{suffix}</span>;
};

export default CountUp;
