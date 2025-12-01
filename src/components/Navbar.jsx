import { Link, useNavigate } from "react-router-dom";


export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate("/login");
  }

  return (
    <nav className="w-full flex items-center gap-6 p-4 bg-white shadow text-lg">
      
      {token ? (
        <>
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/feed">Feed</Link>
          <Link to="/search">Search</Link>

          <button 
            onClick={handleLogout}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </>
      ) : (
        <div className="ml-auto flex gap-4">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
}
