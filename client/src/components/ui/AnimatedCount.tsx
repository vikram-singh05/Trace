import { useEffect, useState } from 'react';

interface AnimatedCountProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (val: number) => string;
}


export default function AnimatedCount({
  value,
  duration = 800,
  className = '',
  formatter = (val) => val.toLocaleString(),
}: AnimatedCountProps) {
  const [count, setCount] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return value;
    }
    return 0;
  });

  useEffect(() => {

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * easeOut);

      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <span className={className}>{formatter(count)}</span>;
}
