import { createContext, useState, useEffect } from "react";
import userApi from "../api/user";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    async function checkUser() {
      try {
        const storedId = localStorage.getItem("user_id");
        if (!storedId) throw new Error("Missing user_id");
        const res = await userApi.get(`/users/${storedId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, []);

  async function login(email, password) {
    try {
      const res = await userApi.post("/auth/login", { email, password });
      const token = res.data?.access_token || res.data?.token;
      const userId = res.data?.user_id;
      if (!token || !userId) throw new Error("Missing token or user_id");
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", userId);
      const profile = await userApi.get(`/users/${userId}`);
      setUser(profile.data);
    } catch (err) {
      console.error("Login failed", err);
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
