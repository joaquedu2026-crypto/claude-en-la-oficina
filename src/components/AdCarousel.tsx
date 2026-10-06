"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type CarouselItem = {
  id: string;
  node: ReactNode;
};

// Mitad del ancho de un ítem (w-24 sm:w-28 → 6rem/7rem) para que el primero y
// el último puedan llegar a quedar centrados, no solo los del medio.
const SIDE_PADDING = "calc(50% - 3.5rem)";

export default function AdCarousel({ items }: { items: CarouselItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function updateActive() {
      if (!container) return;
      const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;
      let closestId: string | null = null;
      let closestDistance = Infinity;
      itemRefs.current.forEach((el, id) => {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - containerCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = id;
        }
      });
      setActiveId(closestId);
    }

    updateActive();
    container.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      container.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="no-scrollbar flex items-start gap-4 overflow-x-auto py-4"
      style={{ scrollSnapType: "x mandatory", paddingLeft: SIDE_PADDING, paddingRight: SIDE_PADDING }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          ref={(el) => {
            if (el) itemRefs.current.set(item.id, el);
            else itemRefs.current.delete(item.id);
          }}
          className="flex-shrink-0 transition-all duration-300"
          style={{
            scrollSnapAlign: "center",
            transform: activeId === item.id ? "scale(1.15)" : "scale(0.85)",
            opacity: activeId === null || activeId === item.id ? 1 : 0.55,
          }}
        >
          {item.node}
        </div>
      ))}
    </div>
  );
}
