"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href
      ? "border-b-2 border-black font-semibold"
      : "text-gray-500 hover:text-black transition-colors";

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
          bookshelf
        </Link>

        {user ? (
          <div className="flex items-center gap-6 text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
            <Link href="/shelf" className={isActive("/shelf")}>My Shelf</Link>
            <Link href="/search" className={isActive("/search")}>Search</Link>
            <Link href="/friends" className={isActive("/friends")}>Friends</Link>
            <Link href="/profile" className={isActive("/profile")}>
              {user.name?.split(" ")[0] ?? "Profile"}
            </Link>
            <button onClick={signOut} className="text-gray-400 hover:text-black transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
            <Link href="/login" className="text-gray-500 hover:text-black transition-colors">Log in</Link>
            <Link href="/register" className="bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors">
              Join
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
