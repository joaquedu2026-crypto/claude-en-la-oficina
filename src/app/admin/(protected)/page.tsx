import { prisma } from "@/lib/prisma";
import AdsManager from "@/components/AdsManager";

export default async function AdminAdsPage() {
  const [ads, catalogs] = await Promise.all([
    prisma.ad.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    prisma.catalog.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
  ]);
  return <AdsManager initialAds={ads} catalogs={catalogs} />;
}
