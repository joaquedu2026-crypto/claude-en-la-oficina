import { prisma } from "@/lib/prisma";
import AdsManager from "@/components/AdsManager";
import { withRetry } from "@/lib/with-retry";

export default async function AdminAdsPage() {
  const [ads, catalogs] = await withRetry(() =>
    Promise.all([
      prisma.ad.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
      prisma.catalog.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    ])
  );
  return <AdsManager initialAds={ads} catalogs={catalogs} />;
}
