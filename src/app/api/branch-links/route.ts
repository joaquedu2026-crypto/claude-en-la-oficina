import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { normalizeUrl } from "@/lib/normalize-url";
import { withRetry } from "@/lib/with-retry";

export async function GET() {
  const branchLinks = await withRetry(() =>
    prisma.branchLink.findMany({ orderBy: [{ branch: "asc" }, { category: "asc" }] })
  );
  return NextResponse.json(branchLinks);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const branch = typeof body?.branch === "string" ? body.branch.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

  if (!branch || !category || !rawUrl) {
    return NextResponse.json({ error: "Sucursal, categoría y enlace son obligatorios" }, { status: 400 });
  }

  const branchLink = await withRetry(() =>
    prisma.branchLink.create({
      data: { branch, category, url: normalizeUrl(rawUrl) },
    })
  );

  return NextResponse.json(branchLink, { status: 201 });
}
