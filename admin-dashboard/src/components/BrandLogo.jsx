import { cn } from "../lib/cn.js";

/**
 * Authentic L logo matching mobile app:
 *  - Large "L" with 3D gradient
 *  - Network of glowing nodes in upper-right corner
 *  - Government building silhouette
 *  - Open book at the base
 */
export function BrandLogo({ size = 48, showText = true, textSize = "text-sm", className }) {
  const iconSize = size;
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        {/* Outer glow ring (orange) */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            boxShadow: "0 0 24px rgba(249,115,22,0.45), 0 0 48px rgba(59,130,246,0.25)",
          }}
        />
        {/* Background gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-orange-400" />
        {/* Inner content */}
        <svg
          viewBox="0 0 48 48"
          width={iconSize}
          height={iconSize}
          className="relative z-10"
        >
          <defs>
            <linearGradient id="lGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fde68a" stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* The big L */}
          <text
            x="6"
            y="34"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="900"
            fontSize="32"
            fill="url(#lGold)"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
          >
            L
          </text>
          {/* Network nodes (upper right of L) — blue */}
          <g opacity="0.95">
            <circle cx="32" cy="10" r="2" fill="#bfdbfe" />
            <circle cx="38" cy="14" r="1.6" fill="#dbeafe" />
            <circle cx="36" cy="20" r="1.4" fill="#93c5fd" />
            <circle cx="30" cy="16" r="1.2" fill="#dbeafe" />
            <circle cx="40" cy="22" r="1.2" fill="#bfdbfe" />
            <line x1="32" y1="10" x2="38" y2="14" stroke="#93c5fd" strokeWidth="0.5" opacity="0.6" />
            <line x1="38" y1="14" x2="36" y2="20" stroke="#93c5fd" strokeWidth="0.5" opacity="0.6" />
            <line x1="32" y1="10" x2="30" y2="16" stroke="#93c5fd" strokeWidth="0.5" opacity="0.6" />
            <line x1="30" y1="16" x2="36" y2="20" stroke="#93c5fd" strokeWidth="0.5" opacity="0.6" />
            <line x1="36" y1="20" x2="40" y2="22" stroke="#93c5fd" strokeWidth="0.5" opacity="0.6" />
          </g>
          {/* Government building silhouette (lower right of L) — orange/white */}
          <g opacity="0.95">
            <rect x="28" y="26" width="14" height="11" fill="white" rx="0.5" />
            <rect x="26" y="24" width="18" height="3" fill="white" />
            <rect x="30" y="29" width="1.5" height="6" fill="#f97316" />
            <rect x="33" y="29" width="1.5" height="6" fill="#f97316" />
            <rect x="36" y="29" width="1.5" height="6" fill="#f97316" />
            <rect x="39" y="29" width="1.5" height="6" fill="#f97316" />
            <polygon points="26,24 35,18 44,24" fill="white" />
            <line x1="35" y1="18" x2="35" y2="24" stroke="#f97316" strokeWidth="0.5" />
          </g>
          {/* Book at the base */}
          <g opacity="0.95">
            <path d="M 4 38 L 24 38 L 24 44 L 4 44 Z" fill="white" />
            <path d="M 24 38 L 44 38 L 44 44 L 24 44 Z" fill="#fde68a" />
            <line x1="24" y1="38" x2="24" y2="44" stroke="#f97316" strokeWidth="0.6" />
          </g>
        </svg>
      </div>
      {showText && (
        <div className="min-w-0">
          <p className={cn("font-bold text-white tracking-wider leading-tight", textSize)}>
            LOKSEWA <span className="text-gradient">AI</span>
          </p>
        </div>
      )}
    </div>
  );
}
