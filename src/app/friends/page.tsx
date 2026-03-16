"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Friend {
  id: string;
  name: string | null;
  image: string | null;
}

interface PendingRequest {
  id: string;
  sender: Friend;
}

export default function FriendsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/friends")
      .then((r) => r.json())
      .then((d) => {
        setFriends(d.friends ?? []);
        setPending(d.pending ?? []);
      });
  }, [status]);

  function handleUserSearch(q: string) {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setSearchResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.users ?? []);
      setSearching(false);
    }, 400);
  }

  async function sendRequest(receiverId: string) {
    await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId }),
    });
    setSearchResults((prev) => prev.filter((u) => u.id !== receiverId));
  }

  async function respondToRequest(friendshipId: string, action: "accept" | "reject") {
    await fetch("/api/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, action }),
    });
    const request = pending.find((p) => p.id === friendshipId);
    setPending((prev) => prev.filter((p) => p.id !== friendshipId));
    if (action === "accept" && request) {
      setFriends((prev) => [...prev, request.sender]);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Friends</h1>

      {/* Find people */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Find people</h2>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleUserSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full border border-gray-300 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
            style={{ fontFamily: "system-ui, sans-serif" }}
          />
          {searching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          )}
        </div>

        {searchResults.length > 0 && (
          <ul className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
            {searchResults.map((user) => (
              <li key={user.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                    {user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={() => sendRequest(user.id)}
                  className="text-xs border border-gray-300 rounded-full px-3 py-1 hover:bg-black hover:text-white hover:border-black transition-colors"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Add friend
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pending requests */}
      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">
            Pending requests{" "}
            <span className="text-gray-400 font-normal text-sm">({pending.length})</span>
          </h2>
          <ul className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
            {pending.map((req) => (
              <li key={req.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                    {req.sender.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
                    {req.sender.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondToRequest(req.id, "accept")}
                    className="text-xs bg-black text-white rounded-full px-3 py-1 hover:bg-gray-800 transition-colors"
                    style={{ fontFamily: "system-ui, sans-serif" }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToRequest(req.id, "reject")}
                    className="text-xs border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100 transition-colors"
                    style={{ fontFamily: "system-ui, sans-serif" }}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Friends list */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          My friends{" "}
          <span className="text-gray-400 font-normal text-sm">({friends.length})</span>
        </h2>

        {friends.length === 0 ? (
          <p className="text-gray-400 text-sm py-6 text-center" style={{ fontFamily: "system-ui, sans-serif" }}>
            No friends yet. Search above to connect with people.
          </p>
        ) : (
          <ul className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
            {friends.map((friend) => (
              <li key={friend.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                    {friend.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
                    {friend.name}
                  </span>
                </div>
                <Link
                  href={`/shelf/${friend.id}`}
                  className="text-xs border border-gray-300 rounded-full px-3 py-1 hover:bg-black hover:text-white hover:border-black transition-colors"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  View shelf
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
