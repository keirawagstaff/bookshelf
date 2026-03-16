"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";

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

export default function SearchPage() {
  const { status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  function handleSearch(q: string) {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setLoading(false);
    }, 400);
  }

  async function addToShelf(book: BookResult, status: string) {
    setAdding(book.id);
    await fetch("/api/shelf", {
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
        status,
      }),
    });
    setAdded((prev) => new Set([...prev, book.id]));
    setAdding(null);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Search Books</h1>
      <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: "system-ui, sans-serif" }}>
        Powered by Google Books — search by title, author, or ISBN
      </p>

      {/* Search input */}
      <div className="relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a book…"
          className="w-full border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-black transition-colors pr-12"
          style={{ fontFamily: "system-ui, sans-serif" }}
          autoFocus
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((book) => (
            <div
              key={book.id}
              className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
            >
              {/* Cover */}
              <div className="relative w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                    📖
                  </div>
                )}
              </div>

              {/* Info */}
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

              {/* Add button */}
              <div className="flex-shrink-0 flex items-center">
                {added.has(book.id) ? (
                  <span className="text-xs text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>
                    ✓ Added
                  </span>
                ) : (
                  <div className="flex flex-col gap-1">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => addToShelf(book, opt.value)}
                        disabled={adding === book.id}
                        className="text-xs border border-gray-300 rounded px-2 py-0.5 hover:bg-black hover:text-white hover:border-black transition-colors disabled:opacity-50"
                        style={{ fontFamily: "system-ui, sans-serif" }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
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
