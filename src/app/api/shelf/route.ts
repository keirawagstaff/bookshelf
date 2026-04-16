import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const entries = await prisma.bookEntry.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ entries });
  } catch (e) {
    console.error("GET /api/shelf error:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { googleBooksId, title, author, coverImage, description, status, pageCount, publishedDate } = body;

  if (!googleBooksId || !title || !status)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const entry = await prisma.bookEntry.upsert({
      where: { userId_googleBooksId_status: { userId: session.id, googleBooksId, status } },
      update: { coverImage, description },
      create: { userId: session.id, googleBooksId, title, author, coverImage, description, status, pageCount, publishedDate },
    });
    return NextResponse.json({ entry });
  } catch (e) {
    console.error("POST /api/shelf error:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  try {
    await prisma.bookEntry.deleteMany({ where: { id, userId: session.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/shelf error:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, googleBooksId, rating, review } = await req.json();
  try {
    // When googleBooksId is provided, update rating/review across all shelf entries for that book
    const where = googleBooksId
      ? { userId: session.id, googleBooksId }
      : { id, userId: session.id };
    await prisma.bookEntry.updateMany({ where, data: { rating: rating || null, review } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PATCH /api/shelf error:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
