import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      logoUrl: typeof body.logoUrl === "string" && body.logoUrl ? body.logoUrl : null,
      backgroundImageUrl:
        typeof body.backgroundImageUrl === "string" && body.backgroundImageUrl ? body.backgroundImageUrl : null,
    },
    update: {
      logoUrl: body.logoUrl === undefined ? undefined : body.logoUrl || null,
      backgroundImageUrl: body.backgroundImageUrl === undefined ? undefined : body.backgroundImageUrl || null,
    },
  });

  return NextResponse.json(settings);
}
