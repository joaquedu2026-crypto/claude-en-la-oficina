import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { normalizeUrl } from "@/lib/normalize-url";
import { withRetry } from "@/lib/with-retry";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const branchLink = await withRetry(() =>
    prisma.branchLink.update({
      where: { id },
      data: {
        branch: typeof body.branch === "string" ? body.branch.trim() : undefined,
        category: typeof body.category === "string" ? body.category.trim() : undefined,
        url: typeof body.url === "string" ? normalizeUrl(body.url.trim()) : undefined,
      },
    })
  );

  return NextResponse.json(branchLink);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await withRetry(() => prisma.branchLink.delete({ where: { id } }));
  return NextResponse.json({ ok: true });
}
