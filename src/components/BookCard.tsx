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

// Priority order for determining the dominant status (left-border color)
const STATUS_ORDER = ["READING", "WANT_TO_READ", "READ", "OWNED"];

const STATUS_BORDER_COLOR: Record<string, string> = {
  READING: "#4a7ab5",
  WANT_TO_READ: "#d4890a",
  READ: "#c95050",
  OWNED: "#b89060",
};

const STATUS_BADGE: Record<string, { background: string; color: string }> = {
  READ: { background: "#e8f5e0", color: "#3d6b22" },
  READING: { background: "#deeaf7", color: "#2c5f9e" },
  WANT_TO_READ: { background: "#fef3dc", color: "#8b6020" },
  OWNED: { background: "#f0e8d8", color: "#6b5030" },
};

export default function BookCard({
  book,
  onRemoveFromShelf,
  onAddToShelf,
  onRateBook,
}: {
  book: GroupedBook;
  onRemoveFromShelf?: (entryId: string) => void;
  onAddToShelf?: (googleBooksId: string, status: string) => void;
  onRateBook?: (googleBooksId: string, rating: number) => void;
}) {
  const currentStatuses = new Set(book.entries.map((e) => e.status));
  const dominantStatus = STATUS_ORDER.find((s) => currentStatuses.has(s));
  const borderColor = dominantStatus ? STATUS_BORDER_COLOR[dominantStatus] : "transparent";

  function handleToggle(status: string) {
    if (currentStatuses.has(status)) {
      const entry = book.entries.find((e) => e.status === status);
      if (entry) onRemoveFromShelf?.(entry.id);
    } else {
      onAddToShelf?.(book.googleBooksId, status);
    }
  }

  return (
    <div
      className="book-card group relative flex flex-col rounded-lg overflow-hidden"
      style={{
        background: "var(--card-bg)",
        border: "1px solid rgba(0,0,0,0.07)",
        borderLeft: `4px solid ${borderColor}`,
      }}
    >
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
            <span className="text-xs font-medium leading-tight" style={{ fontFamily: "Lora, Georgia, serif" }}>
              {book.title}
            </span>
          </div>
        )}

        {/* Hover overlay — shelf toggles + rating */}
        {(onRemoveFromShelf || onAddToShelf || onRateBook) && (
          <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center gap-1.5 p-3">
            {STATUS_ORDER.map((s) => {
              const active = currentStatuses.has(s);
              return (
                <label
                  key={s}
                  className="flex items-center gap-2 text-white text-xs cursor-pointer select-none"
                  style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
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
            {onRateBook && (
              <div className="mt-1.5 pt-1.5 border-t border-white/20">
                <p className="text-white/60 mb-1" style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10 }}>
                  Your rating
                </p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRateBook(book.googleBooksId, star === book.rating ? 0 : star);
                      }}
                      style={{
                        fontSize: 18,
                        color: book.rating && star <= book.rating ? "var(--accent)" : "rgba(255,255,255,0.35)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex-1 flex flex-col gap-1">
        <p className="text-sm font-semibold leading-tight line-clamp-2" style={{ fontFamily: "Lora, Georgia, serif" }}>
          {book.title}
        </p>
        <p className="text-xs text-gray-500 line-clamp-1" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>
          {book.author}
        </p>
        {book.rating && (
          <div className="flex gap-0.5 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ fontSize: 10, color: i < book.rating! ? "var(--accent)" : "#d1d5db" }}>
                ★
              </span>
            ))}
          </div>
        )}
        {/* Status badges */}
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {STATUS_ORDER.filter((s) => currentStatuses.has(s)).map((s) => {
            const badge = STATUS_BADGE[s] ?? { background: "#f3f4f6", color: "#6b7280" };
            return (
              <span
                key={s}
                className="rounded px-1.5 py-0.5 leading-none"
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 10,
                  background: badge.background,
                  color: badge.color,
                }}
              >
                {STATUS_LABELS[s]}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
