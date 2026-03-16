"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

export default function FriendShelfPage() {
  const { userId } = useParams<{ userId: string }>();
  const { status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<BookEntry[]>([]);
  const [friendName, setFriendName] = useState("");
  const [tab, setTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/users/${userId}/shelf`)
      .then(async (r) => {
        if (!r.ok) {
          setError("You must be friends to view this shelf.");
          return;
        }
        const d = await r.json();
        setEntries(d.entries ?? []);
        setFriendName(d.user?.name ?? "");
      })
      .finally(() => setLoading(false));
  }, [status, userId]);

  const grouped = groupEntries(entries);
  const filtered =
    tab === "ALL"
      ? grouped
      : grouped.filter((b) => b.entries.some((e) => e.status === tab));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500" style={{ fontFamily: "system-ui, sans-serif" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{friendName}&apos;s Shelf</h1>
        <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: "system-ui, sans-serif" }}>
          {grouped.length} {grouped.length === 1 ? "book" : "books"} total
        </p>
      </div>

      <div className="flex gap-1 mb-8 border-b border-gray-200" style={{ fontFamily: "system-ui, sans-serif" }}>
        {TABS.map((t) => {
          const count =
            t.key === "ALL"
              ? grouped.length
              : grouped.filter((b) => b.entries.some((e) => e.status === t.key)).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm transition-colors relative ${
                tab === t.key
                  ? "text-black font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {t.label}
              {count > 0 && <span className="ml-1.5 text-xs text-gray-400">({count})</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-16" style={{ fontFamily: "system-ui, sans-serif" }}>
          Nothing here yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((book) => (
            <BookCard key={book.googleBooksId} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
