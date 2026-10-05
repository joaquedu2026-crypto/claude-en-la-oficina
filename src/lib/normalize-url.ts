export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function normalizeWhatsappUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  if (digitsOnly && digitsOnly === trimmed.replace(/[\s()+-]/g, "")) {
    return `https://wa.me/${digitsOnly}`;
  }
  return normalizeUrl(trimmed);
}
