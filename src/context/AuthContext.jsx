import { useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { decryptData } from "../utils/cryptoUtil";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // const [user, setUser] = useState(
  //   () => decryptData(localStorage.getItem('user')) || null,
  // )
  // const [token, setToken] = useState(
  //   () => decryptData(localStorage.getItem('auth-token')) || null,
  // )
  // const [log, setLog] = useState(
  //   () => decryptData(localStorage.getItem('log')) || [],
  // )

  const [user, setUser] = useState(() => {
    const encryptedUser = localStorage.getItem("user");
    return encryptedUser ? decryptData(encryptedUser) : null;
  });

  const [token, setToken] = useState(() => {
    const encryptedToken = localStorage.getItem("auth-token");
    return encryptedToken ? decryptData(encryptedToken) : null;
  });

  const [log, setLog] = useState(() => {
    const encryptedLog = localStorage.getItem("log");
    return encryptedLog ? decryptData(encryptedLog) : [];
  });

  const logout = async () => {
    try {
      await apiClient.get("/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setToken(null);
      setLog([]);

      localStorage.removeItem("user");
      localStorage.removeItem("auth-token");
      localStorage.removeItem("log");

      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, setToken, log, setLog, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
