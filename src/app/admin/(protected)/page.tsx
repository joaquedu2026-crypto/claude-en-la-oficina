import { prisma } from "@/lib/prisma";
import AdsManager from "@/components/AdsManager";
import { withRetry } from "@/lib/with-retry";

export default async function AdminAdsPage() {
  const [ads, catalogs, branchLinks] = await withRetry(() =>
    Promise.all([
      prisma.ad.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
      prisma.catalog.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
      prisma.branchLink.findMany({ orderBy: [{ branch: "asc" }, { category: "asc" }] }),
    ])
  );
  return <AdsManager initialAds={ads} catalogs={catalogs} branchLinks={branchLinks} />;
}
