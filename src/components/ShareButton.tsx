"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        // El usuario canceló el cuadro de compartir; no hacemos nada.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiá el enlace para compartirlo:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand/90 text-white px-5 py-2.5 text-sm font-medium transition"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" />
        <line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
      </svg>
      {copied ? "¡Enlace copiado!" : "Compartir"}
    </button>
  );
}
