import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { normalizeUrl } from "@/lib/normalize-url";

export async function GET() {
  const catalogs = await prisma.catalog.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json(catalogs);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

  if (!name || !rawUrl) {
    return NextResponse.json({ error: "Nombre y enlace son obligatorios" }, { status: 400 });
  }

  const catalog = await prisma.catalog.create({
    data: {
      name,
      url: normalizeUrl(rawUrl),
      description: typeof body?.description === "string" && body.description ? body.description : null,
      imageUrl: typeof body?.imageUrl === "string" && body.imageUrl ? body.imageUrl : null,
      branch: typeof body?.branch === "string" && body.branch.trim() ? body.branch.trim() : null,
      category: typeof body?.category === "string" && body.category.trim() ? body.category.trim() : null,
      showInGallery: body?.showInGallery !== false,
      published: body?.published !== false,
      order: typeof body?.order === "number" ? body.order : 0,
    },
  });

  return NextResponse.json(catalog, { status: 201 });
}
