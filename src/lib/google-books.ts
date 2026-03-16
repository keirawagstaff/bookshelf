export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    pageCount?: number;
    publishedDate?: string;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
  };
}

export interface BookSearchResult {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  description: string | null;
  pageCount: number | null;
  publishedDate: string | null;
  categories: string[];
}

function mapBook(book: GoogleBook): BookSearchResult {
  const info = book.volumeInfo;
  const cover =
    info.imageLinks?.thumbnail?.replace("http://", "https://") ?? null;

  return {
    id: book.id,
    title: info.title,
    author: info.authors?.join(", ") ?? "Unknown Author",
    coverImage: cover,
    description: info.description ?? null,
    pageCount: info.pageCount ?? null,
    publishedDate: info.publishedDate ?? null,
    categories: info.categories ?? [],
  };
}

function apiKey() {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  return key ? `&key=${key}` : "";
}

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&printType=books${apiKey()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch books");
  const data = await res.json();
  return (data.items ?? []).map(mapBook);
}

export async function getBook(id: string): Promise<BookSearchResult | null> {
  const url = `https://www.googleapis.com/books/v1/volumes/${id}${apiKey() ? `?${apiKey().slice(1)}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data: GoogleBook = await res.json();
  return mapBook(data);
}
