import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const socials = await prisma.socialLink.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json(socials);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const platform = typeof body?.platform === "string" ? body.platform.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!platform || !url) {
    return NextResponse.json({ error: "Red social y enlace son obligatorios" }, { status: 400 });
  }

  const social = await prisma.socialLink.create({
    data: {
      platform,
      url,
      label: typeof body?.label === "string" && body.label ? body.label : null,
      imageUrl: typeof body?.imageUrl === "string" && body.imageUrl ? body.imageUrl : null,
      published: body?.published !== false,
      order: typeof body?.order === "number" ? body.order : 0,
    },
  });

  return NextResponse.json(social, { status: 201 });
}
