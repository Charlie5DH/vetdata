import { useEffect, useState } from "react";

export function useScrollSpy(
  sectionIds: string[],
  offset: number = 120,
): string {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (sectionIds.length === 0) return;

    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        let current = sectionIds[0] ?? "";

        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            current = id;
          }
        }

        setActiveId(current);
        ticking = false;
      });
    }

    const container = document.querySelector("[data-scroll-container]");
    const target = container ?? window;

    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      target.removeEventListener("scroll", onScroll);
    };
  }, [sectionIds, offset]);

  return activeId;
}
