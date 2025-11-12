import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/apiClient";
import { encryptData } from "../../utils/cryptoUtil";

const SSORedirect = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authType = location.pathname.replace("/sso/", "");
        const { data } = await apiClient.get(`sso/login/${authType}/callback${location.search}`);

        setUser(data.user);
        setToken(data.token);
        // localStorage.setItem("auth-token", data.token);
        // localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("auth-token", encryptData(data.token));
        localStorage.setItem("user", encryptData(data.user));
        // // Role-based navigation and following naming convenstion for backend
        // const roleRoutes = {
        //   super_admin: "/",
        //   manager: "/add-teams",
        //   project_head: "/pc/dashboard",
        //   lead: "/user/dashboard",
        //   coder: "/user/dashboard",
        //   auditor: "/user/dashboard",
        // };

        navigate("/", { replace: true });
        // navigate(roleRoutes[data.user.role] || "/userNotFound", { replace: true });
      } catch {
        navigate("/userNotFound", { replace: true });
      }
    };

    fetchData();
  }, [location, navigate, setUser, setToken]);

  return null;
};

export default SSORedirect;
