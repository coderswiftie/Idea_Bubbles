import React from 'react';

interface BowProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Exquisite Coquette Ribbon Bow SVG
 * Handcrafted vector paths for vintage romantic ribbon loops and graceful drape tails.
 */
export const CoquetteBow: React.FC<BowProps> = ({
  className = '',
  size = 24,
  color = '#EFCBD5', // Powder pink
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      aria-hidden="true"
    >
      {/* Left Ribbon Loop */}
      <path
        d="M 50 35 C 42 16 20 12 12 24 C 4 36 22 50 48 38 Z"
        fill={color}
        fillOpacity="0.88"
        stroke="#C98FA4"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Left Inner Crease */}
      <path
        d="M 46 36 C 36 28 26 26 18 30"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />

      {/* Right Ribbon Loop */}
      <path
        d="M 50 35 C 58 16 80 12 88 24 C 96 36 78 50 52 38 Z"
        fill={color}
        fillOpacity="0.88"
        stroke="#C98FA4"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Right Inner Crease */}
      <path
        d="M 54 36 C 64 28 74 26 82 30"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />

      {/* Left Drape Tail */}
      <path
        d="M 48 38 C 42 50 32 64 26 72 C 32 68 36 67 44 65 C 48 56 49 45 49 40 Z"
        fill={color}
        fillOpacity="0.75"
        stroke="#C98FA4"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Right Drape Tail */}
      <path
        d="M 52 38 C 58 50 68 64 74 72 C 68 68 64 67 56 65 C 52 56 51 45 51 40 Z"
        fill={color}
        fillOpacity="0.75"
        stroke="#C98FA4"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Center Ribbon Knot */}
      <ellipse
        cx="50"
        cy="36"
        rx="6"
        ry="7"
        fill="#C98FA4"
        stroke="#F8E5E9"
        strokeWidth="1.5"
      />
      {/* Knot Pearl Highlight */}
      <circle cx="48.5" cy="34" r="2" fill="#FFFFFF" fillOpacity="0.9" />
    </svg>
  );
};

export const PearlSparkle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 14,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 2 C12 7 7 12 2 12 C7 12 12 17 12 22 C12 17 17 12 22 12 C17 12 12 7 12 2 Z"
        fill="#EFCBD5"
        stroke="#C98FA4"
        strokeWidth="1"
      />
      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
    </svg>
  );
};

export const OrnamentalDivider: React.FC<{ className?: string; label?: string }> = ({
  className = '',
  label,
}) => {
  return (
    <div className={`flex items-center gap-3 my-4 ${className}`}>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#EFCBD5] to-transparent" />
      <div className="flex items-center gap-1.5 shrink-0">
        <CoquetteBow size={18} />
        {label && (
          <span className="font-editorial italic text-xs text-cocoa-muted tracking-wide px-1">
            {label}
          </span>
        )}
      </div>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#EFCBD5] to-transparent" />
    </div>
  );
};
