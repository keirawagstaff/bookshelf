# Bookshelf — CLAUDE.md

Social book-tracking platform where users log books, track reading status, and share shelves with friends.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | SQLite (dev) via Prisma v5 |
| Auth | NextAuth v5 (credentials — email/password) |
| Book data | Google Books API (free, key optional but needed to avoid quota) |

---

## Project Structure

```
src/
  app/
    api/
      auth/
        [...nextauth]/route.ts   — NextAuth handler
        register/route.ts        — POST: create account (bcrypt password)
      books/
        search/route.ts          — GET: proxy to Google Books API
      friends/route.ts           — GET friends list + pending, POST request, PATCH accept/reject
      shelf/route.ts             — GET/POST/DELETE/PATCH book entries
      users/
        search/route.ts          — GET: find users by name/email
        [id]/shelf/route.ts      — GET: view a friend's shelf (friendship-gated)
    friends/page.tsx             — Find users, manage requests, list friends
    login/page.tsx
    register/page.tsx
    profile/page.tsx
    search/page.tsx              — Book search with multi-shelf checkboxes
    shelf/
      page.tsx                   — Own shelf, grouped by book, tabbed by status
      [userId]/page.tsx          — Friend's shelf (read-only)
    globals.css
    layout.tsx
  components/
    BookCard.tsx                 — Displays a GroupedBook; hover overlay toggles shelves
    Navbar.tsx
    SessionProvider.tsx          — Wraps NextAuth SessionProvider (client component)
  lib/
    auth.ts                      — NextAuth config (JWT strategy)
    google-books.ts              — searchBooks() and getBook() helpers
    prisma.ts                    — Singleton PrismaClient
  types/
    next-auth.d.ts               — Extends Session to include user.id
prisma/
  schema.prisma
  migrations/
```

---

## Database Schema (Prisma)

Key models:

**BookEntry** — one row per user × book × shelf status (a book can be on multiple shelves)
- Unique key: `[userId, googleBooksId, status]`
- `status` values: `OWNED | READING | WANT_TO_READ | READ` (plain strings — SQLite doesn't support Prisma enums)

**Friendship** — directional friend request
- `status` values: `PENDING | ACCEPTED | REJECTED`
- Friends can view each other's shelves; non-friends get a 403

**User** — standard NextAuth fields + optional `bio`

> SQLite enums are not supported by Prisma. All status fields are `String` with documented valid values in comments.

---

## Conventions

### Fonts
- Headings (`h1`, `h2`, `h3`): Georgia serif (set globally in `globals.css`)
- All UI text (buttons, inputs, labels, nav): `style={{ fontFamily: "system-ui, sans-serif" }}` applied inline — Tailwind's font utilities are not used for this

### Colors
- Black and white only — no color palette
- `bg-black` / `text-white` for primary actions
- `border-gray-*` / `text-gray-*` for secondary and muted elements

### Book display
- Entries for the same book are grouped into a `GroupedBook` object before rendering
- `BookCard` takes a `GroupedBook` (not a raw `BookEntry`) — it displays all shelf badges and handles toggling via checkboxes in the hover overlay
- The `groupEntries()` helper (defined locally in shelf pages) handles the grouping

### Auth
- JWT session strategy (no database sessions table used)
- `session.user.id` is available via the custom type declaration in `src/types/next-auth.d.ts`
- All API routes call `const session = await auth()` and check `session?.user?.id`

### API patterns
- All API routes return `{ error: "..." }` with appropriate status codes on failure
- Shelf POST uses `upsert` keyed on `userId_googleBooksId_status`
- DELETE removes a single entry by `id` (removes book from one shelf, not all)

### Environment variables
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_BOOKS_API_KEY="..."   # Required for reliable search; free tier = 1000 req/day
```
`.env` is gitignored — never commit it.

### Migrations
- Use `npx prisma db push --force-reset` in development (resets the local SQLite db)
- `prisma migrate dev` is interactive and won't run in a non-TTY shell — use `db push` locally, `migrate deploy` in production

---

## Running Locally

```bash
npm install
npx prisma db push
npm run dev       # http://localhost:3000
```
