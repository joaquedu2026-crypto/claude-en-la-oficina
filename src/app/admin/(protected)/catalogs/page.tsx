import { prisma } from "@/lib/prisma";
import CatalogsManager from "@/components/CatalogsManager";

export default async function AdminCatalogsPage() {
  const catalogs = await prisma.catalog.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return <CatalogsManager initialCatalogs={catalogs} />;
}
