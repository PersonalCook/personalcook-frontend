// src/pages/Profile.jsx
import { useParams } from "react-router-dom";
import { mockUsers } from "../mock";

export default function Profile() {
  const { user_id } = useParams(); 
  const user = mockUsers.find(u => u.user_id === Number(user_id));

  if (!user) {
    return <div className="p-6">User not found.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-6 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl">
          {user.public_name[0]}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{user.public_name}</h1>
          <p className="text-gray-600">@{user.username}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">User's Recipes</h2>

      {/* MOCK – kasneje zamenjamo z API */}
      <p className="text-gray-500">No recipes yet (mock).</p>
    </div>
  );
}