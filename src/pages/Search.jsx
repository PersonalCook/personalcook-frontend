import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { mockUsers, mockUser } from "../mock";

import { AuthContext } from "../context/AuthContext";

export default function Search() {
  const [query, setQuery] = useState("");
  const { user: loggedInUser } = useContext(AuthContext);

  const users = [...mockUsers, mockUser];

  const filtered =
    query.trim().length > 0
      ? users.filter((user) => {
          const q = query.toLowerCase();
          return (
            user.username.toLowerCase().includes(q) ||
            user.public_name.toLowerCase().includes(q)
          );
        })
      : [];

  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Search Users</h1>

      <input
        type="text"
        placeholder="Search by username or name…"
        className="w-full border rounded-lg px-4 py-2 mb-6"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {query.trim().length === 0 && (
        <div className="text-gray-400 text-center mt-10">
          Start typing to search…
        </div>
      )}

      {query.trim().length > 0 && (
        <div className="flex flex-col gap-4">
          {filtered.length === 0 ? (
            <div className="text-gray-500">No users found.</div>
          ) : (
            filtered.map((user) => {
              const isMe =
                loggedInUser && loggedInUser.user_id === user.user_id;

              return (
                <Link
                  to={isMe ? "/" : `/profile/${user.user_id}`}
                  key={user.user_id}
                  className="flex items-center gap-4 border rounded-lg p-3 shadow cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                    {user.public_name[0]}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-semibold">{user.username}</span>
                    <span className="text-gray-600">{user.public_name}</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}