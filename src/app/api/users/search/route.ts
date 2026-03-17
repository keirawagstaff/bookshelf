import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { NOT: { id: session.id } },
        { OR: [{ name: { contains: q } }, { email: { contains: q } }] },
      ],
    },
    select: { id: true, name: true, image: true },
    take: 10,
  });

  return NextResponse.json({ users });
}
