import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.id;
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }], status: "ACCEPTED" },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });

  const friends = friendships.map((f) => (f.senderId === userId ? f.receiver : f.sender));
  const pending = await prisma.friendship.findMany({
    where: { receiverId: userId, status: "PENDING" },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json({ friends, pending });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId } = await req.json();
  if (!receiverId) return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });
  if (receiverId === session.id) return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 });

  const existing = await prisma.friendship.findFirst({
    where: { OR: [{ senderId: session.id, receiverId }, { senderId: receiverId, receiverId: session.id }] },
  });
  if (existing) return NextResponse.json({ error: "Request already exists" }, { status: 400 });

  const friendship = await prisma.friendship.create({ data: { senderId: session.id, receiverId } });
  return NextResponse.json({ friendship });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { friendshipId, action } = await req.json();
  const friendship = await prisma.friendship.updateMany({
    where: { id: friendshipId, receiverId: session.id },
    data: { status: action === "accept" ? "ACCEPTED" : "REJECTED" },
  });
  return NextResponse.json({ friendship });
}
