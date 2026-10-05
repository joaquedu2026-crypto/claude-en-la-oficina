import { prisma } from "@/lib/prisma";
import SocialsManager from "@/components/SocialsManager";
import { withRetry } from "@/lib/with-retry";

export default async function AdminSocialsPage() {
  const socials = await withRetry(() =>
    prisma.socialLink.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] })
  );
  return <SocialsManager initialSocials={socials} />;
}
