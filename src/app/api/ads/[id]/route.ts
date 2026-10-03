import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const ad = await prisma.ad.update({
    where: { id },
    data: {
      title: typeof body.title === "string" ? body.title.trim() : undefined,
      description: typeof body.description === "string" ? body.description.trim() : undefined,
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl || null : undefined,
      videoUrl: typeof body.videoUrl === "string" ? body.videoUrl || null : undefined,
      link: typeof body.link === "string" ? body.link || null : undefined,
      published: typeof body.published === "boolean" ? body.published : undefined,
      order: typeof body.order === "number" ? body.order : undefined,
    },
  });

  return NextResponse.json(ad);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.ad.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
