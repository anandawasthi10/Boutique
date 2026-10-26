import React from 'react';

export const NeonIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="4" fill="#00E599" fillOpacity="0.15" />
      <path
        d="M6 18V6H8.2L15.8 15.5V6H18V18H15.8L8.2 8.5V18H6Z"
        fill="#00E599"
      />
    </svg>
  );
};
