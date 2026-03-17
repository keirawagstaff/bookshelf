"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-3xl mx-auto mb-4">
        {user.name?.[0]?.toUpperCase() ?? "?"}
      </div>
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: "system-ui, sans-serif" }}>{user.email}</p>

      <div className="mt-10 border-t border-gray-200 pt-8">
        <button onClick={signOut}
          className="w-full border border-gray-300 rounded-lg py-2.5 text-sm text-gray-600 hover:border-black hover:text-black transition-colors"
          style={{ fontFamily: "system-ui, sans-serif" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
