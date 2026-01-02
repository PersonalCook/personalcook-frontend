import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import searchApi from "../api/search";
import { AuthContext } from "../context/AuthContext";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: loggedInUser } = useContext(AuthContext);
  const MIN_QUERY_LEN = 2;

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < MIN_QUERY_LEN) {
      setResults([]);
      setError(null);
      return;
    }
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchApi.get("/users", {
          params: { q: trimmed, limit: 20 },
          signal: controller.signal,
        });
        if (!isMounted) return;
        const data = res.data?.results || res.data || [];
        const asArray = Array.isArray(data) ? data : data ? [data] : [];
        setResults(asArray);
        setError(null);
      } catch (err) {
        if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") return;
        console.error("User search failed", err);
        if (isMounted) {
          setError("Failed to search users");
          setResults([]);
        }
      } finally {
        isMounted && setLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Search Users</h1>

      <input
        type="text"
        placeholder="Search by username"
        className="w-full border rounded-lg px-4 py-2 mb-6"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {query.trim().length === 0 && (
        <div className="text-gray-400 text-center mt-10">
          Start typing to search
        </div>
      )}

      {error && (
        <div className="text-red-600 mb-4 text-center">{error}</div>
      )}

      {query.trim().length > 0 && !error && (
        <div className="flex flex-col gap-4">
          {loading && <div className="text-gray-500">Searching...</div>}
          {!loading &&
            (results.length === 0 ? (
              <div className="text-gray-500">No users found.</div>
            ) : (
              results.map((user) => {
                const userId = user.id || user.user_id;
                const isMe =
                  loggedInUser && loggedInUser.user_id === userId;

                return (
                  <Link
                    to={isMe ? "/" : `/profile/${userId}`}
                    key={userId}
                    className="flex items-center gap-4 border rounded-lg p-3 shadow cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                      {(user.public_name || user.username || "?")[0]}
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold">{user.username}</span>
                      <span className="text-gray-600">{user.public_name}</span>
                    </div>
                  </Link>
                );
              })
            ))}
        </div>
      )}
    </div>
  );
}
