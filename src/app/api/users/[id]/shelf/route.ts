import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: targetUserId } = await params;

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: session.id, receiverId: targetUserId, status: "ACCEPTED" },
        { senderId: targetUserId, receiverId: session.id, status: "ACCEPTED" },
      ],
    },
  });

  if (!friendship && targetUserId !== session.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, image: true },
  });

  const entries = await prisma.bookEntry.findMany({
    where: { userId: targetUserId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ user, entries });
}
