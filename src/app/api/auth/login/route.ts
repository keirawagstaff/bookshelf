import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password)
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  await createSession({ id: user.id, name: user.name, email: user.email });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
