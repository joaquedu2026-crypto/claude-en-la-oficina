"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type CarouselItem = {
  id: string;
  node: ReactNode;
};

// Mitad del ancho de un ítem (w-24 sm:w-28 → 6rem/7rem) para que el primero y
// el último puedan llegar a quedar centrados, no solo los del medio.
const SIDE_PADDING = "calc(50% - 3.5rem)";
const DRAG_THRESHOLD = 5;

export default function AdCarousel({ items }: { items: CarouselItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{ startX: number; startScrollLeft: number } | null>(null);
  const justDraggedRef = useRef(false);

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

    // Soporte de mouse en desktop: el touch ya scrollea nativo, pero el mouse
    // necesita drag manual (pointer events) y mapear la rueda vertical a horizontal.
    function handleWheel(e: WheelEvent) {
      if (!container || e.deltaY === 0) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }

    function handlePointerDown(e: PointerEvent) {
      if (e.pointerType !== "mouse" || !container) return;
      dragState.current = { startX: e.clientX, startScrollLeft: container.scrollLeft };
      setIsDragging(true);
    }

    function handlePointerMove(e: PointerEvent) {
      if (!dragState.current || !container) return;
      const delta = e.clientX - dragState.current.startX;
      if (Math.abs(delta) > DRAG_THRESHOLD) {
        justDraggedRef.current = true;
        container.scrollLeft = dragState.current.startScrollLeft - delta;
      }
    }

    function endDrag() {
      dragState.current = null;
      setIsDragging(false);
    }

    function handleClickCapture(e: MouseEvent) {
      if (justDraggedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        justDraggedRef.current = false;
      }
    }

    function preventNativeDrag(e: DragEvent) {
      e.preventDefault();
    }

    updateActive();
    container.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
    container.addEventListener("click", handleClickCapture, true);
    container.addEventListener("dragstart", preventNativeDrag);
    return () => {
      container.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", endDrag);
      container.removeEventListener("click", handleClickCapture, true);
      container.removeEventListener("dragstart", preventNativeDrag);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="no-scrollbar flex items-start gap-4 overflow-x-auto py-4 cursor-grab select-none active:cursor-grabbing"
      style={{
        scrollSnapType: isDragging ? "none" : "x mandatory",
        paddingLeft: SIDE_PADDING,
        paddingRight: SIDE_PADDING,
      }}
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
