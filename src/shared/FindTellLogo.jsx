import React from 'react';

/**
 * Find&Tell Brand Logo Component
 * Features the connected ampersand design with navy, cyan, and purple colors
 *
 * @param {Object} props
 * @param {number} props.size - Size multiplier (default: 1)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showText - Whether to show "FIND & TELL" text (default: true)
 */
export default function FindTellLogo({ size = 1, className = '', showText = true }) {
  const baseWidth = 400;
  const baseHeight = 100;
  const width = baseWidth * size;
  const height = baseHeight * size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* FIND text */}
      {showText && (
        <text
          x="20"
          y="65"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="48"
          fontWeight="600"
          fill="#6b7280"
          letterSpacing="2"
        >
          FIND
        </text>
      )}

      {/* Ampersand Symbol - Navy circle (top) */}
      <circle cx="200" cy="25" r="12" fill="#1e3a8a" />

      {/* Ampersand Symbol - Cyan circle (middle-left) */}
      <circle cx="190" cy="50" r="12" fill="#0ea5e9" />

      {/* Ampersand Symbol - Purple circle (middle-right) */}
      <circle cx="210" cy="50" r="12" fill="#a855f7" />

      {/* Connecting curves for ampersand */}
      <path
        d="M 200 37 Q 185 50 190 62"
        stroke="#0ea5e9"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 200 37 Q 215 50 210 62"
        stroke="#a855f7"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Bottom curve connecting the lower circles */}
      <path
        d="M 190 62 Q 200 70 210 62"
        stroke="#a855f7"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* TELL text */}
      {showText && (
        <text
          x="240"
          y="65"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="48"
          fontWeight="600"
          fill="#6b7280"
          letterSpacing="2"
        >
          TELL
        </text>
      )}
    </svg>
  );
}
