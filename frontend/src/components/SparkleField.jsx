import { useMemo } from "react";

// A lightweight decorative layer of twinkling gold dots. Purely visual —
// drop it inside any `position: relative` container.
export default function SparkleField({ count = 14 }) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 2.5,
        delay: `${Math.random() * 4.5}s`,
        duration: `${3.5 + Math.random() * 3}s`,
      })),
    [count]
  );

  return (
    <div className="sparkle-field" aria-hidden="true">
      {sparkles.map((s) => (
        <span
          key={s.id}
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  );
}
