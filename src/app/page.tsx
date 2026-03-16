import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Hero */}
      <section className="pt-24 pb-16 text-center">
        <h1 className="text-6xl font-bold tracking-tight mb-6 leading-tight">
          Your books,
          <br />
          <span className="italic font-normal">beautifully kept.</span>
        </h1>
        <p
          className="text-gray-500 text-xl max-w-xl mx-auto mb-10"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          Log what you own, track what you&apos;re reading, and share your
          shelf with friends who love books too.
        </p>

        {session ? (
          <Link
            href="/shelf"
            className="bg-black text-white px-8 py-3 rounded-full text-lg hover:bg-gray-800 transition-colors"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Go to my shelf →
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-black text-white px-8 py-3 rounded-full text-lg hover:bg-gray-800 transition-colors"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Start your shelf
            </Link>
            <Link
              href="/login"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full text-lg hover:border-black transition-colors"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Log in
            </Link>
          </div>
        )}
      </section>

      <div className="border-t border-gray-200 my-8" />

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12">
        <div>
          <div className="text-3xl mb-3">📚</div>
          <h3 className="text-lg font-semibold mb-2">Log your library</h3>
          <p
            className="text-gray-500 text-sm leading-relaxed"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Catalog every book you own, want, or have read. Search millions of
            titles via Google Books.
          </p>
        </div>
        <div>
          <div className="text-3xl mb-3">👁</div>
          <h3 className="text-lg font-semibold mb-2">Track your reading</h3>
          <p
            className="text-gray-500 text-sm leading-relaxed"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Move books between &ldquo;Want to read,&rdquo; &ldquo;Reading,&rdquo; and
            &ldquo;Read.&rdquo; Leave ratings and reviews.
          </p>
        </div>
        <div>
          <div className="text-3xl mb-3">🤝</div>
          <h3 className="text-lg font-semibold mb-2">Share with friends</h3>
          <p
            className="text-gray-500 text-sm leading-relaxed"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Connect with friends and browse their shelves for your next great
            read.
          </p>
        </div>
      </section>

      {/* Quote */}
      <section className="border-t border-b border-gray-200 py-12 text-center">
        <blockquote className="text-2xl italic text-gray-600 max-w-2xl mx-auto">
          &ldquo;A room without books is like a body without a soul.&rdquo;
        </blockquote>
        <cite
          className="text-gray-400 text-sm mt-3 block"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          — Marcus Tullius Cicero
        </cite>
      </section>
    </div>
  );
}
