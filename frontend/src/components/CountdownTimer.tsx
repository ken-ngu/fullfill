import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  cutoffTime: string; // Format: "HH:MM" (24-hour)
  orderDate: string; // ISO date string
}

export function CountdownTimer({ cutoffTime, orderDate }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isPastCutoff, setIsPastCutoff] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const [hours, minutes] = cutoffTime.split(':').map(Number);

      // Create cutoff date for today
      const cutoff = new Date(orderDate);
      cutoff.setHours(hours, minutes, 0, 0);

      const diff = cutoff.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Order cutoff passed');
        setIsPastCutoff(true);
        return;
      }

      const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secondsRemaining = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hoursRemaining}h ${minutesRemaining}m ${secondsRemaining}s`
      );
      setIsUrgent(hoursRemaining < 2);
      setIsPastCutoff(false);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [cutoffTime, orderDate]);

  return (
    <div className={`flex items-center space-x-2 ${isPastCutoff ? 'text-red-600' : isUrgent ? 'text-yellow-600' : 'text-slate-600'}`}>
      <svg
        className={`w-5 h-5 ${isPastCutoff || isUrgent ? 'animate-pulse' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="font-semibold">
        {isPastCutoff ? timeRemaining : `Cutoff in ${timeRemaining}`}
      </span>
    </div>
  );
}
