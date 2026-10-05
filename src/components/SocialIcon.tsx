import { useId } from "react";

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
  const uid = useId();
  const gradId = `ig-gradient-${uid}`;

  switch (platform) {
    case "instagram":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <defs>
            <radialGradient id={gradId} cx="30%" cy="107%" r="150%">
              <stop offset="0%" stopColor="#FFDD55" />
              <stop offset="10%" stopColor="#FFDD55" />
              <stop offset="50%" stopColor="#FF543E" />
              <stop offset="100%" stopColor="#C837AB" />
            </radialGradient>
          </defs>
          <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${gradId})`} />
          <rect x="13" y="13" width="22" height="22" rx="7" fill="none" stroke="#fff" strokeWidth="2.6" />
          <circle cx="24" cy="24" r="6.2" fill="none" stroke="#fff" strokeWidth="2.6" />
          <circle cx="33" cy="15" r="1.8" fill="#fff" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="#25D366" />
          <path
            d="M24 11c-7.2 0-13 5.8-13 13 0 2.5.7 4.9 2 7l-2.1 7.7 7.9-2.1c2 1.1 4.3 1.7 6.6 1.7h0c7.2 0 13-5.8 13-13s-5.8-13.4-13-13.4Zm7.6 18.5c-.3.9-1.7 1.7-2.5 1.8-.6.1-1.5.2-2.4-.1-1-.3-2.3-.7-4-1.6-3.5-1.9-5.8-5.4-6-5.7-.2-.3-1.4-1.9-1.4-3.6s.9-2.5 1.2-2.9c.3-.3.7-.4 1-.4h.7c.2 0 .5-.1.8.6l1.1 2.6c.1.3.2.5 0 .8l-.5.7c-.2.2-.4.4-.1.9.3.5 1.3 2.2 2.9 3.5 2 1.7 3.6 2.2 4.1 2.4.4.2.6.2.8-.1l1.2-1.4c.3-.4.6-.3 1-.1l2.4 1.2c.3.1.6.3.7.4.1.3.1 1-.2 1.9Z"
            fill="#fff"
          />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="#1877F2" />
          <path
            d="M28 24.5h3.7l.6-4.5H28v-2.6c0-1.4.3-2.4 2.4-2.4h2.1V10.8C32 10.7 30.4 10.5 28.6 10.5c-3.8 0-6.5 2.3-6.5 6.6v3.9h-4.2v4.5h4.2V38h5.1V24.5Z"
            fill="#fff"
          />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="2" y="2" width="44" height="44" rx="13" fill="#000" />
          <g transform="translate(13,9)">
            <path
              d="M14.5 0c.4 3 2.3 5 5.5 5.3v3.9a9 9 0 0 1-5.5-1.8v8.5a7.3 7.3 0 1 1-7.3-7.3c.3 0 .6 0 .9.1v4a3.3 3.3 0 1 0 2.4 3.2V0h4Z"
              fill="#EE1D52"
              transform="translate(-0.9,-0.6)"
            />
            <path
              d="M14.5 0c.4 3 2.3 5 5.5 5.3v3.9a9 9 0 0 1-5.5-1.8v8.5a7.3 7.3 0 1 1-7.3-7.3c.3 0 .6 0 .9.1v4a3.3 3.3 0 1 0 2.4 3.2V0h4Z"
              fill="#69C9D0"
              transform="translate(0.9,0.6)"
            />
            <path d="M14.5 0c.4 3 2.3 5 5.5 5.3v3.9a9 9 0 0 1-5.5-1.8v8.5a7.3 7.3 0 1 1-7.3-7.3c.3 0 .6 0 .9.1v4a3.3 3.3 0 1 0 2.4 3.2V0h4Z" fill="#fff" />
          </g>
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="2" y="9" width="44" height="30" rx="9" fill="#FF0000" />
          <path d="M20 17.5v13l11.5-6.5L20 17.5Z" fill="#fff" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="2" y="2" width="44" height="44" rx="13" fill="#000" />
          <path
            d="M13 13l9.2 12.2L13 35h3l7.6-8.5L30 35h5L25.3 22.2 34 13h-3l-7 7.9-6.5-7.9h-4.5Zm2.6 1.8h2.3l15.4 18.4h-2.3L15.6 14.8Z"
            fill="#fff"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="#9CA3AF" />
          <path
            d="M21.5 26.5l5-5m-7.3 1.6-2.1 2.1a4.5 4.5 0 0 0 6.4 6.4l3.2-3.2a4.5 4.5 0 0 0 0-6.4M26.5 21.5l2.1-2.1a4.5 4.5 0 0 0-6.4-6.4l-3.2 3.2a4.5 4.5 0 0 0 0 6.4"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
  }
}
