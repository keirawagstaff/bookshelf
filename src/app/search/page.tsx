"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface BookResult {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  description: string | null;
  pageCount: number | null;
  publishedDate: string | null;
}

const STATUS_OPTIONS = [
  { value: "WANT_TO_READ", label: "Want to Read" },
  { value: "READING", label: "Reading" },
  { value: "READ", label: "Read" },
  { value: "OWNED", label: "Owned" },
];

interface BookShelfState {
  selected: Set<string>;
  added: Set<string>;
  saving: boolean;
}

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookStates, setBookStates] = useState<Record<string, BookShelfState>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  function getState(bookId: string): BookShelfState {
    return bookStates[bookId] ?? { selected: new Set(), added: new Set(), saving: false };
  }

  function toggleStatus(bookId: string, statusValue: string) {
    setBookStates((prev) => {
      const state = prev[bookId] ?? { selected: new Set(), added: new Set(), saving: false };
      if (state.added.has(statusValue)) return prev;
      const next = new Set(state.selected);
      if (next.has(statusValue)) next.delete(statusValue);
      else next.add(statusValue);
      return { ...prev, [bookId]: { ...state, selected: next } };
    });
  }

  async function addToShelves(book: BookResult) {
    const state = getState(book.id);
    if (state.selected.size === 0 || state.saving) return;

    setBookStates((prev) => ({
      ...prev,
      [book.id]: { ...getState(book.id), saving: true },
    }));

    const responses = await Promise.all(
      [...state.selected].map((s) =>
        fetch("/api/shelf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleBooksId: book.id,
            title: book.title,
            author: book.author,
            coverImage: book.coverImage,
            description: book.description,
            pageCount: book.pageCount,
            publishedDate: book.publishedDate,
            status: s,
          }),
        }).then(async (r) => ({ status: s, ok: r.ok }))
      )
    );

    const succeeded = new Set(responses.filter((r) => r.ok).map((r) => r.status));

    setBookStates((prev) => {
      const state = prev[book.id];
      const newAdded = new Set([...state.added, ...succeeded]);
      const remaining = new Set([...state.selected].filter((s) => !succeeded.has(s)));
      return { ...prev, [book.id]: { selected: remaining, added: newAdded, saving: false } };
    });
  }

  function handleSearch(q: string) {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setBookStates({});
      setLoading(false);
    }, 400);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Search Books</h1>
      <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: "system-ui, sans-serif" }}>
        Powered by Google Books — search by title, author, or ISBN
      </p>

      <div className="relative mb-8">
        <input type="text" value={query} onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a book…"
          className="w-full border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-black transition-colors pr-12"
          style={{ fontFamily: "system-ui, sans-serif" }} autoFocus />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((book) => {
            const state = getState(book.id);
            return (
              <div key={book.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                <div className="relative w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                  {book.coverImage ? (
                    <Image src={book.coverImage} alt={book.title} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">📖</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight">{book.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5" style={{ fontFamily: "system-ui, sans-serif" }}>
                    {book.author}
                    {book.publishedDate && ` · ${book.publishedDate.slice(0, 4)}`}
                    {book.pageCount && ` · ${book.pageCount} pages`}
                  </p>
                  {book.description && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2" style={{ fontFamily: "system-ui, sans-serif" }}>
                      {book.description}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 flex flex-col justify-center gap-1.5 min-w-[130px]" style={{ fontFamily: "system-ui, sans-serif" }}>
                  {STATUS_OPTIONS.map((opt) => {
                    const isAdded = state.added.has(opt.value);
                    const isChecked = state.selected.has(opt.value) || isAdded;
                    return (
                      <label key={opt.value}
                        className={`flex items-center gap-2 text-xs cursor-pointer select-none ${isAdded ? "text-gray-400" : "text-gray-700 hover:text-black"}`}>
                        <input type="checkbox" checked={isChecked} disabled={isAdded}
                          onChange={() => toggleStatus(book.id, opt.value)} className="accent-black" />
                        {opt.label}
                        {isAdded && <span className="text-gray-300">✓</span>}
                      </label>
                    );
                  })}
                  <button onClick={() => addToShelves(book)}
                    disabled={state.selected.size === 0 || state.saving}
                    className="mt-1 text-xs bg-black text-white rounded px-2 py-1 hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ fontFamily: "system-ui, sans-serif" }}>
                    {state.saving ? "Adding…" : "Add to shelf"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <p className="text-center text-gray-400 py-12" style={{ fontFamily: "system-ui, sans-serif" }}>
          No results for &ldquo;{query}&rdquo;
        </p>
      )}

      {!query && (
        <div className="text-center py-24 text-gray-300">
          <p className="text-5xl mb-3">🔍</p>
          <p style={{ fontFamily: "system-ui, sans-serif" }}>Type to search millions of books</p>
        </div>
      )}
    </div>
  );
}
