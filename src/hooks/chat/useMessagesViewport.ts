import { useEffect, useState } from "react";
import { isCompactMessagesViewport } from "@/utils/chat/layoutConfig";

export function useMessagesViewport() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const apply = () => setIsCompact(isCompactMessagesViewport(window.innerWidth));
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return { isCompact };
}
