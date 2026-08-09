import { useCallback, useEffect, useRef } from "react";

// A single shared AudioContext for the whole app — synthesized tones, not sample files, so there's
// no external asset to fetch/license and the "chime" character is easy to tune (frequency/envelope).
let sharedCtx = null;
function getAudioContext() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) sharedCtx = new Ctx();
  return sharedCtx;
}

/** One short sine tone with a soft attack/decay envelope — the building block for both cues. */
function playTone(ctx, { frequency, startTime, duration, peakGain, type = "sine" }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015); // soft attack, no click
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function useSound() {
  const mutedRef = useRef(false);

  useEffect(() => {
    // Some browsers start an AudioContext "suspended" until a user gesture resumes it — any tap
    // on the page (which is how every sound in this app gets triggered anyway) satisfies that.
    const resume = () => {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    };
    window.addEventListener("pointerdown", resume, { once: true });
    return () => window.removeEventListener("pointerdown", resume);
  }, []);

  /** Soft, premium double-tone chime — a gentle rising interval, not a jarring bell. */
  const playChime = useCallback(() => {
    if (mutedRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    playTone(ctx, { frequency: 880, startTime: now, duration: 0.32, peakGain: 0.09 });
    playTone(ctx, { frequency: 1318.5, startTime: now + 0.11, duration: 0.36, peakGain: 0.08 });
  }, []);

  /** A very quiet "tick" simulating physical haptic feedback on a tap/swipe. */
  const playTick = useCallback(() => {
    if (mutedRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    playTone(ctx, { frequency: 1400, startTime: ctx.currentTime, duration: 0.05, peakGain: 0.05, type: "triangle" });
  }, []);

  return { playChime, playTick };
}
