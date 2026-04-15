import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "bookshelf_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret-change-in-production"
);

const PROTECTED = ["/shelf", "/search", "/friends", "/profile"];
const AUTH_ONLY = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(COOKIE)?.value;
  let authenticated = false;
  if (token) {
    try {
      await jwtVerify(token, secret);
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !authenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthOnly && authenticated) {
    return NextResponse.redirect(new URL("/shelf", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/shelf/:path*", "/search", "/friends", "/profile", "/login", "/register"],
};
