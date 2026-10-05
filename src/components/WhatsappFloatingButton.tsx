"use client";

import { useEffect, useRef, useState } from "react";
import SocialIcon from "@/components/SocialIcon";

type BranchOption = {
  branch: string;
  url: string;
};

const buttonClasses =
  "flex items-center gap-1.5 sm:gap-2 rounded-full bg-white border border-border-soft shadow-sm hover:shadow-md transition pl-1.5 pr-3 py-1.5 sm:pl-2 sm:pr-4 sm:py-2";

export default function WhatsappFloatingButton({ options }: { options: BranchOption[] }) {
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

  if (options.length === 1) {
    return (
      <a
        href={options[0].url}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-2 sm:right-4 bottom-4 z-30 ${buttonClasses}`}
      >
        <SocialIcon platform="whatsapp" className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
        <span className="text-[11px] sm:text-sm font-medium text-brand leading-none whitespace-nowrap">
          WhatsApp
        </span>
      </a>
    );
  }

  return (
    <div ref={ref} className="fixed right-2 sm:right-4 bottom-4 z-30">
      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-white border border-border-soft rounded-xl shadow-lg overflow-hidden min-w-[190px]">
          <p className="text-xs text-muted px-3 pt-2 pb-1">¿Con qué sucursal querés hablar?</p>
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
      <button type="button" onClick={() => setOpen((v) => !v)} className={buttonClasses}>
        <SocialIcon platform="whatsapp" className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
        <span className="text-[11px] sm:text-sm font-medium text-brand leading-none whitespace-nowrap">
          WhatsApp
        </span>
      </button>
    </div>
  );
}
