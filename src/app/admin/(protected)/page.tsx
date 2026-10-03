import { prisma } from "@/lib/prisma";
import AdsManager from "@/components/AdsManager";

export default async function AdminAdsPage() {
  const ads = await prisma.ad.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return <AdsManager initialAds={ads} />;
}
