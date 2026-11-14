import React from 'react';

interface BrandMarkProps {
  compact?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ compact = false }) => {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="edusparkGrad" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect width="28" height="28" rx="8" fill="url(#edusparkGrad)" />
        <path
          d="M14 6.5L16.2 11.8L21.5 14L16.2 16.2L14 21.5L11.8 16.2L6.5 14L11.8 11.8L14 6.5Z"
          fill="white"
        />
      </svg>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          EduSpark AI
        </span>
      )}
    </span>
  );
};
