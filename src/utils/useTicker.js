import { useEffect, useState } from "react";

/** Re-renders the calling component every `intervalMs`, returning the current timestamp. */
export function useTicker(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
