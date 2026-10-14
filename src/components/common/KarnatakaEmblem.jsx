import React from 'react';

export default function KarnatakaEmblem({ size = 38 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      title="Government of Karnataka Emblem"
    >
      {/* Outer Golden/Bronze Ring with red accent */}
      <circle cx="50" cy="50" r="46" fill="#b91c1c" stroke="#f59e0b" strokeWidth="3" />
      <circle cx="50" cy="50" r="41" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="1.5" />
      
      {/* Sun Rays / Crest */}
      <circle cx="50" cy="50" r="36" fill="#1e293b" />
      
      {/* Double-headed Gandaberunda Mythical Eagle Motif in Gold */}
      <path
        d="M50 20 L53 30 L63 26 L58 35 L68 36 L59 43 L67 49 L57 51 L62 60 L52 57 L50 67 L48 57 L38 60 L43 51 L33 49 L41 43 L32 36 L42 35 L37 26 L47 30 Z"
        fill="#f59e0b"
      />
      {/* Left Head */}
      <path d="M44 26 C40 22 42 17 48 18 C46 22 45 25 44 26 Z" fill="#fbbf24" />
      {/* Right Head */}
      <path d="M56 26 C60 22 58 17 52 18 C54 22 55 25 56 26 Z" fill="#fbbf24" />
      
      {/* Ashoka Chakra Base / Lions representation */}
      <ellipse cx="50" cy="68" rx="20" ry="7" fill="#f59e0b" />
      <rect x="36" y="66" width="28" height="4" rx="2" fill="#78350f" />
      <circle cx="50" cy="68" r="2.5" fill="#1e3a8a" />
      
      {/* Stars on flanks */}
      <polygon points="20,50 22,54 27,54 23,57 25,62 20,59 15,62 17,57 13,54 18,54" fill="#fbbf24" />
      <polygon points="80,50 82,54 87,54 83,57 85,62 80,59 75,62 77,57 73,54 78,54" fill="#fbbf24" />
      
      {/* Base Ribbon Banner */}
      <path d="M22 78 Q50 86 78 78 L82 85 Q50 94 18 85 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
      <text x="50" y="86" fontSize="5.5" fontWeight="900" fill="#78350f" textAnchor="middle" letterSpacing="0.8">
        GOVT OF KARNATAKA
      </text>
    </svg>
  );
}
