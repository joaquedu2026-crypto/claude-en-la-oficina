import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { normalizeUrl } from "@/lib/normalize-url";
import { withRetry } from "@/lib/with-retry";

export async function GET() {
  const ads = await withRetry(() => prisma.ad.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }));
  return NextResponse.json(ads);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!title || !description) {
    return NextResponse.json({ error: "Título y descripción son obligatorios" }, { status: 400 });
  }

  const ad = await withRetry(() =>
    prisma.ad.create({
      data: {
        title,
        description,
        imageUrl: typeof body?.imageUrl === "string" && body.imageUrl ? body.imageUrl : null,
        videoUrl: typeof body?.videoUrl === "string" && body.videoUrl ? normalizeUrl(body.videoUrl) : null,
        link: typeof body?.link === "string" && body.link ? normalizeUrl(body.link) : null,
        branchCategory: typeof body?.branchCategory === "string" && body.branchCategory ? body.branchCategory : null,
        mediaWidth: typeof body?.mediaWidth === "number" ? body.mediaWidth : null,
        mediaHeight: typeof body?.mediaHeight === "number" ? body.mediaHeight : null,
        fullWidth: body?.fullWidth === true,
        shape: body?.shape === "circle" ? "circle" : "card",
        published: body?.published !== false,
        order: typeof body?.order === "number" ? body.order : 0,
      },
    })
  );

  return NextResponse.json(ad, { status: 201 });
}
