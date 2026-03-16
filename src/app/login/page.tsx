"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/shelf");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-2 text-center">Welcome back</h1>
        <p className="text-gray-500 text-center mb-8 text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
          Log in to your bookshelf
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ fontFamily: "system-ui, sans-serif" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
              style={{ fontFamily: "system-ui, sans-serif" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ fontFamily: "system-ui, sans-serif" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
              style={{ fontFamily: "system-ui, sans-serif" }}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6" style={{ fontFamily: "system-ui, sans-serif" }}>
          No account?{" "}
          <Link href="/register" className="text-black font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
