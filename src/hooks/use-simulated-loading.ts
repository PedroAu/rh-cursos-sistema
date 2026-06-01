import { useEffect, useState } from "react";

export function useSimulatedLoading(deps: unknown[], duration = 450) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), duration);
    return () => window.clearTimeout(timer);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return loading;
}
