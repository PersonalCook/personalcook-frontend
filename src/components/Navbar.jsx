import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div
      className="
        fixed left-0 top-0
        w-56 h-screen
        bg-white border-r border-gray-200
        flex flex-col
        px-6 py-8
      "
    >
      <img 
          src="/ChatGPT Image Dec 5, 2025 at 12_31_14 PM.png" 
          alt="PersonalCook Logo"
          className="w-40 mx-auto"
        />


      <nav className="flex flex-col gap-4 text-gray-700 text-lg mt-14">
        <SidebarLink to="/" label="Home" />
        <SidebarLink to="/explore" label="Explore" />
        <SidebarLink to="/feed" label="Feed" />
        <SidebarLink to="/search" label="Search Profiles" />
      </nav>

      <div className="mt-auto">
        {user ? (
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 text-left"
          >
            Logout
          </button>
        ) : (
          <NavLink
            to="/login"
            className="text-blue-600 hover:text-blue-800"
          >
            Login
          </NavLink>
        )}
      </div>
    </div>
  );
}

function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        px-4 py-2 rounded-xl transition
        ${isActive ? "bg-gray-200 font-semibold text-gray-900" : "hover:bg-gray-100"}
        `
      }
    >
      {label}
    </NavLink>
  );
}
