// Lightweight class-name utility (replacement for classnames)
import { clsx } from "clsx";

export function cn(...args) {
  return clsx(args);
}
