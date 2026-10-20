import { prisma } from "@/lib/prisma";
import CatalogsManager from "@/components/CatalogsManager";
import { withRetry } from "@/lib/with-retry";

export default async function AdminCatalogsPage() {
  const [catalogs, branchLinks] = await withRetry(() =>
    Promise.all([
      prisma.catalog.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
      prisma.branchLink.findMany({ orderBy: [{ branch: "asc" }, { category: "asc" }] }),
    ])
  );
  const branches = Array.from(new Set(branchLinks.map((b) => b.branch)));
  return <CatalogsManager initialCatalogs={catalogs} branches={branches} />;
}
