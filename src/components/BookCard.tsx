"use client";

import Image from "next/image";

export interface BookEntry {
  id: string;
  googleBooksId: string;
  title: string;
  author: string;
  coverImage: string | null;
  status: string;
  rating: number | null;
  review: string | null;
}

export interface GroupedBook {
  googleBooksId: string;
  title: string;
  author: string;
  coverImage: string | null;
  rating: number | null;
  entries: { id: string; status: string }[];
}

export const STATUS_LABELS: Record<string, string> = {
  OWNED: "Owned",
  READING: "Reading",
  WANT_TO_READ: "Want to Read",
  READ: "Read",
};

const STATUS_ORDER = ["READING", "WANT_TO_READ", "READ", "OWNED"];

export default function BookCard({
  book,
  onRemoveFromShelf,
  onAddToShelf,
}: {
  book: GroupedBook;
  onRemoveFromShelf?: (entryId: string) => void;
  onAddToShelf?: (googleBooksId: string, status: string) => void;
}) {
  const currentStatuses = new Set(book.entries.map((e) => e.status));

  function handleToggle(status: string) {
    if (currentStatuses.has(status)) {
      const entry = book.entries.find((e) => e.status === status);
      if (entry) onRemoveFromShelf?.(entry.id);
    } else {
      onAddToShelf?.(book.googleBooksId, status);
    }
  }

  return (
    <div className="book-card group relative flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Cover */}
      <div className="relative bg-gray-100 aspect-[2/3] w-full">
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            className="object-cover book-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-center p-3">
            <span className="text-xs font-medium leading-tight">{book.title}</span>
          </div>
        )}

        {/* Hover overlay — shelf toggles */}
        {(onRemoveFromShelf || onAddToShelf) && (
          <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center gap-1.5 p-3">
            {STATUS_ORDER.map((s) => {
              const active = currentStatuses.has(s);
              return (
                <label
                  key={s}
                  className="flex items-center gap-2 text-white text-xs cursor-pointer select-none"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleToggle(s)}
                    className="accent-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {STATUS_LABELS[s]}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex-1 flex flex-col gap-1">
        <p className="text-sm font-semibold leading-tight line-clamp-2">{book.title}</p>
        <p className="text-xs text-gray-500 line-clamp-1" style={{ fontFamily: "system-ui, sans-serif" }}>
          {book.author}
        </p>
        {book.rating && (
          <div className="flex gap-0.5 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < book.rating! ? "text-black" : "text-gray-300"} style={{ fontSize: 10 }}>
                ★
              </span>
            ))}
          </div>
        )}
        {/* Status badges */}
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {STATUS_ORDER.filter((s) => currentStatuses.has(s)).map((s) => (
            <span
              key={s}
              className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 leading-none"
              style={{ fontFamily: "system-ui, sans-serif", fontSize: 10 }}
            >
              {STATUS_LABELS[s]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
