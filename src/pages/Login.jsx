import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import userApi from "../api/user";
import { mockUser } from "../mock"; 

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    // -----------------------------------------------------
    /*
    try {
      const res = await userApi.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user_id", res.data.user_id);

      navigate("/explore");
    } catch (err) {
      setError("Napačen email ali geslo");
    }
    */
    // -----------------------------------------------------

    // ✅ MOCK LOGIN — vedno uspešen
    localStorage.setItem("token", mockUser.token);
    localStorage.setItem("user", JSON.stringify(mockUser));

    navigate("/explore");
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-sm bg-white p-8 rounded-xl shadow flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold text-center mb-2">Login</h1>

        <input
          type="email"
          className="border rounded p-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border rounded p-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400">{error}</p>}

        <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
          Login
        </button>
        <p className="text-center text-sm text-gray-600">Do not have an account?<Link to="/register" className="text-blue-600 hover:underline"> Register</Link></p>

      </form>
    </div>
  );
}
