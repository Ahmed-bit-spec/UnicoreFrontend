import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const AuthContext = createContext();

// Your /auth/me response returns `id`, but the rest of the app (PostCard,
// Feed, UserDetailsPage, socket event matching, etc.) all compare against
// `user._id` (the Mongo convention). Rather than hunt down every `_id`
// reference across the app, normalize once here so both keys always work.
const normalizeUser = (u) => {
  if (!u) return u;
  return { ...u, _id: u._id ?? u.id };
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const checkAuth = async () => {
      try {
        console.log("[AuthContext] checking /auth/me with credentials");
        const { data } = await axios.get("/api/v1/auth/me", { withCredentials: true });
        const userObj = normalizeUser(data.data || data.user);
        console.log("[AuthContext] auth check success", userObj);
        setUser(userObj);
      } catch (err) {
        console.error("[AuthContext] auth check failed", err?.response?.status, err?.message);
        // If no server session, allow a persisted guest session (from Enter as Guest)
        const guestRaw = localStorage.getItem("guestUser");
        if (guestRaw) {
          try {
            const guestObj = normalizeUser(JSON.parse(guestRaw));
            console.log("[AuthContext] restoring guest session", guestObj);
            setUser(guestObj);
          } catch (parseErr) {
            console.warn("[AuthContext] invalid guestUser in localStorage, clearing");
            localStorage.removeItem("guestUser");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    // clear any guest marker when a real user logs in
    localStorage.removeItem("guestUser");
    setUser(normalizeUser(userData));
  };

  const logout = async () => {
    // clear guest marker too
    localStorage.removeItem("guestUser");
    setUser(null);
    try {
      await axios.post("/api/v1/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const updateUser = (userData) => {
    setUser(normalizeUser(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export const useAuth = () => useContext(AuthContext);