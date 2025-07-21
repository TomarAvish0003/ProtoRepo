// components/CaughtIcon.tsx
import React from 'react';

interface CaughtIconProps extends React.SVGProps<SVGSVGElement> {
  filled: boolean;
}

export default function CaughtIcon({ filled, ...props }: CaughtIconProps) {
  return filled ? (
    <svg {...props} width={28} height={28} viewBox="0 0 24 24" fill="#EF5350">
      <circle cx="12" cy="12" r="10" stroke="#222" strokeWidth="2"/>
      <rect x="2" y="11" width="20" height="2" fill="#fff"/>
      <circle cx="12" cy="12" r="4" fill="#fff" stroke="#222" strokeWidth="2"/>
      <circle cx="12" cy="12" r="2" fill="#EF5350" stroke="#222" strokeWidth="1"/>
    </svg>
  ) : (
    <svg {...props} width={28} height={28} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#222" strokeWidth="2"/>
      <rect x="2" y="11" width="20" height="2" fill="#fff"/>
      <circle cx="12" cy="12" r="4" fill="none" stroke="#222" strokeWidth="2"/>
      <circle cx="12" cy="12" r="2" fill="none" stroke="#222" strokeWidth="1"/>
    </svg>
  );
}
