import { prisma } from "@/lib/prisma";
import CatalogsManager from "@/components/CatalogsManager";
import { withRetry } from "@/lib/with-retry";

export default async function AdminCatalogsPage() {
  const catalogs = await withRetry(() =>
    prisma.catalog.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] })
  );
  return <CatalogsManager initialCatalogs={catalogs} />;
}
