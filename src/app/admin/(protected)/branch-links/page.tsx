import { prisma } from "@/lib/prisma";
import BranchLinksManager from "@/components/BranchLinksManager";
import { withRetry } from "@/lib/with-retry";

export default async function AdminBranchLinksPage() {
  const branchLinks = await withRetry(() =>
    prisma.branchLink.findMany({ orderBy: [{ branch: "asc" }, { category: "asc" }] })
  );
  return <BranchLinksManager initialBranchLinks={branchLinks} />;
}
