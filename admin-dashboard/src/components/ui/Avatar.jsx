import { cn } from "../../lib/cn.js";

const sizeMap = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-12 h-12 text-sm" };

export function Avatar({ name, src, size = "md", className }) {
  const initials = (name || "?")
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Pick a deterministic background based on the name
  const palette = [
    "from-brand-500 to-violet-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-rose-500",
    "from-sky-500 to-indigo-500",
    "from-fuchsia-500 to-pink-500",
    "from-orange-500 to-amber-500"
  ];
  const tone = palette[(name || "").charCodeAt(0) % palette.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", sizeMap[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br",
        tone,
        sizeMap[size],
        className
      )}
    >
      {initials || "?"}
    </div>
  );
}
