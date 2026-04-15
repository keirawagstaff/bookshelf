"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const navLink = (href: string) => {
    const active = pathname === href;
    return {
      className: active ? "" : "text-gray-500 hover:text-gray-800 transition-colors",
      style: active
        ? { color: "var(--foreground)", borderBottom: "1.5px solid var(--accent)", paddingBottom: "2px" }
        : {},
    };
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <nav
      className="border-b border-gray-200 sticky top-0 z-50"
      style={{ background: "var(--background)", borderColor: "rgba(0,0,0,0.08)", fontFamily: "DM Sans, system-ui, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl tracking-tight" style={{ fontFamily: "Lora, Georgia, serif" }}>
          book<span style={{ fontStyle: "italic", color: "var(--accent)" }}>shelf</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-6 text-sm">
            <Link href="/shelf" {...navLink("/shelf")}>My Shelf</Link>
            <Link href="/search" {...navLink("/search")}>Search</Link>
            <Link href="/friends" {...navLink("/friends")}>Friends</Link>
            <Link
              href="/profile"
              title={user.name ?? "Profile"}
              className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
              style={{ background: "var(--accent)" }}
            >
              {initial}
            </Link>
            <button onClick={signOut} className="text-gray-400 hover:text-gray-700 transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-gray-500 hover:text-gray-900 transition-colors">Log in</Link>
            <Link
              href="/register"
              className="text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
              style={{ background: "var(--accent)" }}
            >
              Join
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
