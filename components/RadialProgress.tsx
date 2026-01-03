import React from 'react';

export const RadialProgress: React.FC<{ score: number }> = ({ score }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = 'text-red-500';
  if (score >= 70) color = 'text-yellow-500';
  if (score >= 85) color = 'text-green-500';

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-gray-200"
          strokeWidth="6"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
        />
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
        />
      </svg>
      <span className={`absolute text-xl font-bold ${color}`}>{score}</span>
    </div>
  );
};