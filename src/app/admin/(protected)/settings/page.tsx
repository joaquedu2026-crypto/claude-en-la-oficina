import { prisma } from "@/lib/prisma";
import SiteSettingsManager from "@/components/SiteSettingsManager";
import { withRetry } from "@/lib/with-retry";

export default async function AdminSettingsPage() {
  const settings = await withRetry(() => prisma.siteSettings.findUnique({ where: { id: "main" } }));
  return <SiteSettingsManager initialSettings={settings} />;
}
