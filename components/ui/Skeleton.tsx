'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={`bg-[var(--color-surface)] animate-pulse rounded-[4px] ${
        circle ? 'rounded-full' : ''
      } ${className}`.trim()}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
