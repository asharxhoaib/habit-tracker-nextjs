"use client";

const CONFETTI_COLORS = [
  "#3a56f5",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0891b2",
];

interface ConfettiOverlayProps {
  active: boolean;
}

/**
 * Purely CSS-driven confetti burst. Renders a fixed set of pieces that
 * fall + fade using the `confetti-fall` keyframe animation defined in
 * tailwind.config.ts. No JS animation loop, no external libraries.
 */
export default function ConfettiOverlay({ active }: ConfettiOverlayProps) {
  if (!active) return null;

  const pieces = Array.from({ length: 16 });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = (i / pieces.length) * 100 + (i % 3) * 2;
        const delay = (i % 5) * 40;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        return (
          <span
            key={i}
            className="absolute top-0 block h-2 w-2 animate-confetti-fall rounded-sm"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              animationDelay: `${delay}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
