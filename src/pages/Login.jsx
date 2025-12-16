import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, logout } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/explore");
    } catch (err) {
      setError("Invalid email or password");
    }
  }

  function handleContinueGuest() {
    logout(); // ensure any old token is cleared
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
          required
        />

        <input
          type="password"
          className="border rounded p-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-400">{error}</p>}

        <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
          Login
        </button>
        <button
          type="button"
          onClick={handleContinueGuest}
          className="border border-gray-300 text-gray-700 hover:bg-gray-100 py-3 rounded-lg"
        >
          Continue without login
        </button>
        <p className="text-center text-sm text-gray-600">
          Do not have an account?
          <Link to="/register" className="text-blue-600 hover:underline">
            {" "}
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
