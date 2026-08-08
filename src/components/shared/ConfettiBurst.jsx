import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const COLORS = ["#E31837", "#00A651", "#F39C12", "#3B82F6", "#F8F9FA"];

function makeParticles(count = 90) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    drift: (Math.random() - 0.5) * 40,
    rotate: Math.random() * 720 - 360,
    size: 6 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: 2.2 + Math.random() * 1.4,
    delay: Math.random() * 0.35,
    round: Math.random() > 0.5,
  }));
}

/** Fires a fresh confetti burst every time `burstKey` changes to a truthy/new value. */
export default function ConfettiBurst({ burstKey }) {
  const [visible, setVisible] = useState(false);
  const particles = useMemo(() => makeParticles(), [burstKey]);

  useEffect(() => {
    if (!burstKey) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [burstKey]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ top: "-5%", left: `${p.x}%`, opacity: 1, rotate: 0 }}
          animate={{ top: "110%", left: `${p.x + p.drift}%`, opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? "9999px" : "2px",
          }}
        />
      ))}
    </div>
  );
}
