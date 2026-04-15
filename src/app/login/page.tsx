"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const err = await signIn(email, password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      router.push("/shelf");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl mb-2 text-center" style={{ fontFamily: "Lora, Georgia, serif", fontWeight: 400 }}>Welcome back</h1>
        <p className="text-center mb-8 text-sm" style={{ fontFamily: "DM Sans, system-ui, sans-serif", color: "var(--foreground)", opacity: 0.5 }}>
          Log in to your bookshelf
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ fontFamily: "DM Sans, system-ui, sans-serif", color: "var(--foreground)" }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
              style={{ fontFamily: "DM Sans, system-ui, sans-serif", background: "var(--background)", color: "var(--foreground)", borderColor: "rgba(128,128,128,0.3)" }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "rgba(128,128,128,0.3)"} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ fontFamily: "DM Sans, system-ui, sans-serif", color: "var(--foreground)" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
              style={{ fontFamily: "DM Sans, system-ui, sans-serif", background: "var(--background)", color: "var(--foreground)", borderColor: "rgba(128,128,128,0.3)" }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "rgba(128,128,128,0.3)"} />
          </div>
          {error && <p className="text-red-500 text-sm" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ fontFamily: "DM Sans, system-ui, sans-serif", background: "var(--accent)" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ fontFamily: "DM Sans, system-ui, sans-serif", color: "var(--foreground)", opacity: 0.5 }}>
          No account?{" "}
          <Link href="/register" className="font-medium hover:underline" style={{ color: "var(--accent)", opacity: 1 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
