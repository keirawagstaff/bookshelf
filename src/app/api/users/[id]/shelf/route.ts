import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: targetUserId } = await params;

  // Only friends can see each other's shelves
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: targetUserId, status: "ACCEPTED" },
        { senderId: targetUserId, receiverId: session.user.id, status: "ACCEPTED" },
      ],
    },
  });

  if (!friendship && targetUserId !== session.user.id)
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
