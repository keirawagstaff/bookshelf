"use client";

import Image from "next/image";

interface BookEntry {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  status: string;
  rating: number | null;
  review: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  OWNED: "Owned",
  READING: "Reading",
  WANT_TO_READ: "Want to Read",
  READ: "Read",
};

export default function BookCard({
  book,
  onRemove,
  onStatusChange,
}: {
  book: BookEntry;
  onRemove?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}) {
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

        {/* Hover overlay */}
        {(onRemove || onStatusChange) && (
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
            {onStatusChange && (
              <select
                value={book.status}
                onChange={(e) => onStatusChange(book.id, e.target.value)}
                className="w-full text-xs bg-white text-black rounded px-2 py-1"
                style={{ fontFamily: "system-ui, sans-serif" }}
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(book.id)}
                className="text-xs text-white/70 hover:text-white"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Remove
              </button>
            )}
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
          <div className="flex gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < book.rating! ? "text-black" : "text-gray-300"} style={{ fontSize: 10 }}>
                ★
              </span>
            ))}
          </div>
        )}
        <span
          className="text-xs text-gray-400 mt-auto pt-1"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {STATUS_LABELS[book.status]}
        </span>
      </div>
    </div>
  );
}
