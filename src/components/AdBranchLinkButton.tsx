"use client";

import { useState, useRef, useEffect } from "react";

type BranchOption = {
  branch: string;
  url: string;
};

export default function AdBranchLinkButton({
  options,
  children,
  wrapperClassName = "relative mt-5",
  buttonClassName = "inline-flex items-center gap-1 text-brand hover:text-brand-light font-medium text-sm transition",
}: {
  options: BranchOption[];
  children?: React.ReactNode;
  wrapperClassName?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (options.length === 0) return null;

  return (
    <div className={wrapperClassName} ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={buttonClassName}>
        {children ?? "Ver más →"}
      </button>
      {open && (
        <div className="absolute z-10 mt-2 bg-white border border-border-soft rounded-xl shadow-lg overflow-hidden min-w-[180px]">
          <p className="text-xs text-muted px-3 pt-2 pb-1">¿Desde qué sucursal?</p>
          {options.map((opt) => (
            <a
              key={opt.branch}
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-foreground hover:bg-brand-tint hover:text-brand transition"
            >
              {opt.branch}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
