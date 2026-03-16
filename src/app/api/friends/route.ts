import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get friends list
export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: "ACCEPTED",
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });

  const friends = friendships.map((f) =>
    f.senderId === userId ? f.receiver : f.sender
  );

  const pending = await prisma.friendship.findMany({
    where: { receiverId: userId, status: "PENDING" },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({ friends, pending });
}

// Send friend request
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId } = await req.json();
  if (!receiverId)
    return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });

  if (receiverId === session.user.id)
    return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 });

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId },
        { senderId: receiverId, receiverId: session.user.id },
      ],
    },
  });

  if (existing)
    return NextResponse.json({ error: "Request already exists" }, { status: 400 });

  const friendship = await prisma.friendship.create({
    data: { senderId: session.user.id, receiverId },
  });

  return NextResponse.json({ friendship });
}

// Accept/reject request
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { friendshipId, action } = await req.json();

  const friendship = await prisma.friendship.updateMany({
    where: { id: friendshipId, receiverId: session.user.id },
    data: { status: action === "accept" ? "ACCEPTED" : "REJECTED" },
  });

  return NextResponse.json({ friendship });
}
