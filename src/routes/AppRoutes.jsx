import { Routes, Route, Navigate } from "react-router-dom";
import LayoutWithoutNav from "../shared/layouts/LayoutWithoutNav";
import LayoutWithNav from "../shared/layouts/LayoutWithNav";
import RequireAuth from "../pages/auth/RequireAuth";
import { useAuth } from "../context/AuthContext";
import commonRoutes from "./commonRoutes";
import Login from "../pages/auth/Login";
import roleRoutes from "./roleRoutes";
import apiClient from "../services/apiClient";
import { decryptData } from "../utils/cryptoUtil";

function AppRoutes() {
  const { user, token } = useAuth();

  // add headers for token
  // apiClient.defaults.headers.common['Authorization'] =
  //   `Bearer ${decryptData(localStorage.getItem('auth-token')) || token}`
  const storedToken = localStorage.getItem("auth-token");
  const decryptedToken = storedToken ? decryptData(storedToken) : null;

  apiClient.defaults.headers.common["Authorization"] =
    `Bearer ${decryptedToken || token}`;
  // apiClient.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("auth-token") || token}`;

  // Redirect logged-in users to their role-based dashboard
  const loginRedirect = () => {
    if (user && token) {
      switch (user.role) {
        // case "super_admin":
        //   return <Navigate to="/" replace />;
        // case "project_head":
        //   return <Navigate to="/pc/dashboard" replace />;
        // case "manager":
        //   return <Navigate to="/add-teams" replace />;
        // case "lead":
        //   return <Navigate to="/all-users" replace />;
        // case "coder":
        //   return <Navigate to="/chart" replace />;
        // case "auditor":
        //   return <Navigate to="/audits" replace />;
        default:
          return <Navigate to='/' replace />;
      }
    }
    return <Login />; // Show login page if not authenticated
  };

  // Get role-specific routes
  const userRoutes = user?.role ? roleRoutes[user.role] || [] : [];

  return (
    <Routes>
      {/* Public Routes (Login, SSO, etc.) - Redirect if already logged in */}
      <Route element={<LayoutWithoutNav />}>
        <Route path='/login' element={loginRedirect()} />
      </Route>

      {/* Common Routes (accessible to all users) */}
      <Route element={<LayoutWithoutNav />}>
        {commonRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      {/* Role-Based Routes */}
      <Route element={<LayoutWithNav />}>
        {user && token ? (
          userRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<RequireAuth>{element}</RequireAuth>}
            />
          ))
        ) : (
          <Route path='/' element={<Navigate to='/login' replace />} />
        )}
      </Route>
    </Routes>
  );
}

export default AppRoutes;
