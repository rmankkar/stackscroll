import { useEffect, useState } from "react";

/**
 * BackgroundBlobs renders soft, animated, colorful gradient blobs behind the
 * page content. Gives the UI a lively, modern feel without distracting from
 * the Q&A cards. Fully responsive — blobs scale with the viewport.
 */
export default function BackgroundBlobs() {
  const [positions, setPositions] = useState<{ x: number; y: number; size: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    const colors = [
      "hsl(var(--primary) / 0.15)",
      "hsl(var(--accent) / 0.12)",
      "hsl(43 96% 56% / 0.10)", // amber
      "hsl(142 76% 36% / 0.10)", // emerald
    ];

    const count = window.innerWidth < 768 ? 4 : 6;

    const blobs = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: window.innerWidth < 768 ? 40 + Math.random() * 40 : 60 + Math.random() * 80,
      color: colors[i % colors.length],
      delay: i * 1.5,
    }));

    setPositions(blobs);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {positions.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-[120px] opacity-60 animate-blob"
          style={{
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            backgroundColor: blob.color,
            animationDelay: `${blob.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
