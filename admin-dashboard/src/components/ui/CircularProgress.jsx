import { cn } from "../../lib/cn.js";

/**
 * Circular progress ring — matches mobile app's donut chart style.
 * @param {number} value 0–100
 * @param {string} size  diameter in px
 * @param {number} stroke ring thickness
 * @param {string} color CSS color for the ring
 * @param {string} bgColor background ring color
 */
export function CircularProgress({ value = 0, size = 80, stroke = 6, color = "#60a5fa", bgColor = "rgba(255,255,255,0.06)", label, centerContent }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      {centerContent || (label !== undefined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white leading-none">{Math.round(value)}%</span>
          {label && <span className="text-[9px] text-slate-400 mt-0.5 leading-tight text-center">{label}</span>}
        </div>
      ))}
    </div>
  );
}

/**
 * Stat tile with circular progress ring — matches mobile app's analytics cards.
 */
export function CircleStat({ value = 0, label, icon: Icon, color = "#60a5fa", className }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-100/50 border border-blue-500/10", className)}>
      <CircularProgress value={value} size={64} stroke={5} color={color} />
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" style={{ color }} />}
        <span className="text-xs font-semibold text-slate-300 text-center">{label}</span>
      </div>
    </div>
  );
}
