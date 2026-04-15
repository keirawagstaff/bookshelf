"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BookCard, { GroupedBook } from "@/components/BookCard";

interface BookEntry {
  id: string;
  googleBooksId: string;
  title: string;
  author: string;
  coverImage: string | null;
  status: string;
  rating: number | null;
  review: string | null;
}

const TABS = [
  { key: "ALL", label: "All" },
  { key: "READING", label: "Reading" },
  { key: "WANT_TO_READ", label: "Want to Read" },
  { key: "READ", label: "Read" },
  { key: "OWNED", label: "Owned" },
];

function groupEntries(entries: BookEntry[]): GroupedBook[] {
  const map = new Map<string, GroupedBook>();
  for (const entry of entries) {
    if (!map.has(entry.googleBooksId)) {
      map.set(entry.googleBooksId, {
        googleBooksId: entry.googleBooksId,
        title: entry.title,
        author: entry.author,
        coverImage: entry.coverImage,
        rating: entry.rating,
        entries: [],
      });
    }
    map.get(entry.googleBooksId)!.entries.push({ id: entry.id, status: entry.status });
  }
  return [...map.values()];
}

export default function ShelfPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<BookEntry[]>([]);
  const [tab, setTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/shelf")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleRemoveFromShelf(entryId: string) {
    await fetch("/api/shelf", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entryId }),
    });
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }

  async function handleAddToShelf(googleBooksId: string, shelfStatus: string) {
    const existing = entries.find((e) => e.googleBooksId === googleBooksId);
    if (!existing) return;
    const res = await fetch("/api/shelf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        googleBooksId,
        title: existing.title,
        author: existing.author,
        coverImage: existing.coverImage,
        status: shelfStatus,
      }),
    });
    const data = await res.json();
    if (data.entry) {
      setEntries((prev) => [...prev, { ...data.entry, rating: null, review: null }]);
    }
  }

  const grouped = groupEntries(entries);
  const filtered =
    tab === "ALL" ? grouped : grouped.filter((b) => b.entries.some((e) => e.status === tab));

  const statReading = grouped.filter((b) => b.entries.some((e) => e.status === "READING")).length;
  const statWantToRead = grouped.filter((b) => b.entries.some((e) => e.status === "WANT_TO_READ")).length;
  const statRead = grouped.filter((b) => b.entries.some((e) => e.status === "READ")).length;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "Lora, Georgia, serif", fontWeight: 400, fontSize: "2rem", lineHeight: 1.2 }}>
            {user?.name?.split(" ")[0]}&apos;s Shelf
          </h1>
          <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>
            hover a cover to manage shelves
          </p>
        </div>
        <Link
          href="/search"
          className="text-white px-5 py-2 rounded-full text-sm hover:opacity-90 transition-opacity"
          style={{ fontFamily: "DM Sans, system-ui, sans-serif", background: "var(--accent)" }}
        >
          + Add books
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { value: grouped.length, label: "Total Books" },
          { value: statRead, label: "Books Read" },
          { value: statReading, label: "Reading" },
          { value: statWantToRead, label: "Want to Read" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: "var(--stat-bg)" }}
          >
            <p
              className="text-2xl"
              style={{ fontFamily: "Lora, Georgia, serif", fontWeight: 500, color: "var(--accent)" }}
            >
              {value}
            </p>
            <p
              className="text-gray-500 mt-0.5"
              style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-200" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>
        {TABS.map((t) => {
          const count = t.key === "ALL" ? grouped.length : grouped.filter((b) => b.entries.some((e) => e.status === t.key)).length;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2 text-sm transition-colors relative flex items-center gap-1.5"
              style={{
                color: active ? "var(--accent)" : "#9ca3af",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1,
                fontWeight: active ? 500 : 400,
              }}
            >
              {t.label}
              {count > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 leading-none"
                  style={{
                    fontSize: 10,
                    background: active ? "var(--accent)" : "#e5e7eb",
                    color: active ? "#fff" : "#6b7280",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📖</p>
          <p className="text-gray-500 mb-4" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>
            {tab === "ALL" ? "Your shelf is empty. Start adding books!" : "No books in this category yet."}
          </p>
          <Link href="/search" className="text-sm underline" style={{ color: "var(--accent)", fontFamily: "DM Sans, system-ui, sans-serif" }}>
            Search for books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((book) => (
            <BookCard key={book.googleBooksId} book={book}
              onRemoveFromShelf={handleRemoveFromShelf}
              onAddToShelf={handleAddToShelf} />
          ))}
        </div>
      )}
    </div>
  );
}
