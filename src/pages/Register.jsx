import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import userApi from "../api/user";


export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [publicname, setPublicname] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await userApi.post("/auth/register", {
        email,
        password,
        username,
        publicname,
        birthdate,
      });

      setSuccess(true);
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  }
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm bg-white p-8 rounded-xl shadow flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold text-center mb-2">Register</h1>

        {success && (
          <div className="text-green-600 text-center font-semibold">
            Account created successfully!
            <div className="mt-2">
              <Link to="/login" className="text-blue-600 underline">
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {!success && (
          <>
            <input
              type = "text"
              placeholder="Full Name"
              className="border rounded p-3"
              value={publicname}
              onChange={(e) => setPublicname(e.target.value)}
             />
            <input
              type="text"
              placeholder="Username"
              className="border rounded p-3"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              className="border rounded p-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="border rounded p-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

      
            <input
              type="password"
              placeholder="Confirm Password"
              className="border rounded p-3"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            
            />

            <input
              type="date"
              className="border rounded p-3"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />

            {error && <p className="text-red-500">{error}</p>}

            <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
              Register
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}