import axios from "axios";
import { createContext, useEffect, useState } from "react";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [registerData, setRegisterData] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshAuthContext, setRefreshAuthContext] = useState(false);
  const [loading, setLoading] = useState(true); 
  const apiUrl = import.meta.env.VITE_API_URL
  useEffect(() => {
  setLoading(true);
  axios
    .get(`${apiUrl}/api/v1/auth/me`, {
      withCredentials: true,
    })
    .then((res) => {
      setUser({
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role,
        createdAt: res.data.user.createdAt,
        id: res.data.user._id,
      });
      setIsAuthenticated(true);
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
      } else {
        console.error("Auth error:", err.response?.data?.message || err.message);
      }
    })
    .finally(() => {
      setLoading(false);
    });
}, [refreshAuthContext]);
  const isAdmin = (user, role) => {
    if(role?.includes(user?.role)){
      return true;
    }
    return false;
  }
  const logout = async () => {
    try {
      await axios.get(`${apiUrl}/api/v1/auth/logout`, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
      setRefreshAuthContext(!refreshAuthContext);
    }
  };

  const refreshAuthContextHandler = () => {
    setRefreshAuthContext(!refreshAuthContext);
  }
  return (
    <AuthContext.Provider 
      value={{
        registerData,
        setRegisterData,
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        setRefreshAuthContext,
        loading,
        isAdmin,
        logout,
        refreshAuthContextHandler,
        refreshAuthContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
