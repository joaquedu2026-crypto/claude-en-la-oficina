import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { normalizeWhatsappUrl, normalizeUrl } from "@/lib/normalize-url";
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

  let url: string | undefined;
  if (typeof body.url === "string") {
    const rawUrl = body.url.trim();
    let effectivePlatform = typeof body.platform === "string" ? body.platform.trim() : undefined;
    if (!effectivePlatform) {
      const existing = await withRetry(() =>
        prisma.socialLink.findUnique({ where: { id }, select: { platform: true } })
      );
      effectivePlatform = existing?.platform;
    }
    url = effectivePlatform === "whatsapp" ? normalizeWhatsappUrl(rawUrl) : normalizeUrl(rawUrl);
  }

  const social = await withRetry(() =>
    prisma.socialLink.update({
      where: { id },
      data: {
        platform: typeof body.platform === "string" ? body.platform.trim() : undefined,
        url,
        label: typeof body.label === "string" ? body.label || null : undefined,
        imageUrl: typeof body.imageUrl === "string" ? body.imageUrl || null : undefined,
        published: typeof body.published === "boolean" ? body.published : undefined,
        order: typeof body.order === "number" ? body.order : undefined,
      },
    })
  );

  return NextResponse.json(social);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await withRetry(() => prisma.socialLink.delete({ where: { id } }));
  return NextResponse.json({ ok: true });
}
