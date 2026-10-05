import { prisma } from "@/lib/prisma";
import SiteSettingsManager from "@/components/SiteSettingsManager";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  return <SiteSettingsManager initialSettings={settings} />;
}
