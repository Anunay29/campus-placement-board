// AuthContext stores "who is logged in" and shares it with every page.
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Start with the user saved in the browser (so a page refresh does not log us out)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // Called after a successful login or register
  function saveLogin(token, userData) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  // Asks the server for the latest user details (e.g. recruiter was just approved)
  async function refreshUser() {
    try {
      const { data } = await api.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      // ignore: the api interceptor already handles expired tokens
    }
  }

  // When the app opens, refresh the details of a logged-in user
  useEffect(() => {
    if (localStorage.getItem("token")) {
      refreshUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, saveLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Short way to use it in any component:  const { user } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
