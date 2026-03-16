import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await prisma.bookEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ entries });
}

// Add a book to one shelf (called once per status)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { googleBooksId, title, author, coverImage, description, status, pageCount, publishedDate } = body;

  if (!googleBooksId || !title || !status)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const entry = await prisma.bookEntry.upsert({
    where: {
      userId_googleBooksId_status: {
        userId: session.user.id,
        googleBooksId,
        status,
      },
    },
    update: { coverImage, description },
    create: {
      userId: session.user.id,
      googleBooksId,
      title,
      author,
      coverImage,
      description,
      status,
      pageCount,
      publishedDate,
    },
  });

  return NextResponse.json({ entry });
}

// Remove a book from one specific shelf by entry id
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  await prisma.bookEntry.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, rating, review } = await req.json();

  const entry = await prisma.bookEntry.updateMany({
    where: { id, userId: session.user.id },
    data: { rating, review },
  });

  return NextResponse.json({ entry });
}
