const PATHS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <path d="M12 3a9 9 0 0 0-7.8 13.4L3 21l4.7-1.2A9 9 0 1 0 12 3Zm4.8 12.6c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.4-3.8 6 6 0 0 1-1.3-3.1c0-.7.3-1.3.7-1.7.2-.2.4-.3.7-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2.1.4 0 .6l-.4.5c-.1.2-.2.3 0 .6.5.9 1.5 1.8 2.5 2.3.2.1.4.1.5-.1l.5-.6c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.4.1.2.1.6-.1 1.1Z" />
  ),
  facebook: (
    <path d="M14 9h2.5V6.2h-2.5c-2.1 0-3.5 1.5-3.5 3.6V12H8v3h2.5v6h3v-6h2.3l.4-3h-2.7v-1.8c0-.7.3-1.2 1.5-1.2Z" />
  ),
  tiktok: (
    <path d="M14 3c.3 1.9 1.5 3.2 3.5 3.4v2.5a6 6 0 0 1-3.5-1.1v5.7a4.7 4.7 0 1 1-4-4.6v2.6a2.1 2.1 0 1 0 1.5 2V3Z" />
  ),
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="3" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="var(--icon-bg, white)" stroke="none" />
    </>
  ),
  x: <path d="M4 4l16 16M20 4 4 20" strokeWidth="2.2" />,
  other: <circle cx="12" cy="12" r="9" />,
};

const LABELS: Record<string, string> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X (Twitter)",
  other: "Otro",
};

export const SOCIAL_PLATFORMS = Object.keys(LABELS);
export function platformLabel(platform: string): string {
  return LABELS[platform] ?? "Otro";
}

export default function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const content = PATHS[platform] ?? PATHS.other;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
