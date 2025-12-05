import { createContext, useState, useEffect } from "react";
import userApi from "../api/user";  
import { mockUser } from "../mock";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     setLoading(false);
  //     return;
  //   }
  
  //   async function checkUser() {
  //     try {
  //       const res = await userApi.get("/profile/");
  //       setUser(res.data);
  //     } catch (err) {
  //       console.log("Error fetching user:", err);
  //       localStorage.removeItem("token");
  //       setUser(null);
  //     }
  //     setLoading(false);
  //   }
  
  //   checkUser();
  // }, []);

    useEffect(() => {
    const useMock = import.meta.env.VITE_USE_MOCK_API === "true";
    if (useMock) {
      setUser(mockUser);
      return;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}