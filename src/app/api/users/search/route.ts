import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { NOT: { id: session.user.id } },
        {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        },
      ],
    },
    select: { id: true, name: true, image: true },
    take: 10,
  });

  return NextResponse.json({ users });
}
