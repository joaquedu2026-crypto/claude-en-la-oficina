import { prisma } from "@/lib/prisma";
import SocialsManager from "@/components/SocialsManager";

export default async function AdminSocialsPage() {
  const socials = await prisma.socialLink.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return <SocialsManager initialSocials={socials} />;
}
