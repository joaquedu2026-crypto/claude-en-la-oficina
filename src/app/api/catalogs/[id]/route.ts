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

  const catalog = await prisma.catalog.update({
    where: { id },
    data: {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      url: typeof body.url === "string" ? body.url.trim() : undefined,
      description: typeof body.description === "string" ? body.description || null : undefined,
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl || null : undefined,
      published: typeof body.published === "boolean" ? body.published : undefined,
      order: typeof body.order === "number" ? body.order : undefined,
    },
  });

  return NextResponse.json(catalog);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.catalog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
