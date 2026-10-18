import { useEffect, useState } from "react";
import { motion } from "motion/react";

/** Compositor-only ambient movement. Paused when hidden or effects are reduced. */
export function AmbientScene({ reduced }: { reduced: boolean }) {
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const update = () => {
      setVisible(!document.hidden);
      document.documentElement.dataset.visible = String(!document.hidden);
    };
    document.addEventListener("visibilitychange", update);
    update();
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const active = visible && !reduced;
  return (
    <div className="ambient-scene" aria-hidden="true" data-active={active}>
      <motion.div
        className="ambient-light light-one"
        animate={
          active
            ? { x: [0, 55, 0], y: [0, 25, 0], scale: [1, 1.08, 1] }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={
          active
            ? { duration: 28, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      />
      <motion.div
        className="ambient-light light-two"
        animate={active ? { x: [0, -40, 0], y: [0, -35, 0] } : { x: 0, y: 0 }}
        transition={
          active
            ? { duration: 32, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      />
      <div className="ambient-texture" />
    </div>
  );
}
