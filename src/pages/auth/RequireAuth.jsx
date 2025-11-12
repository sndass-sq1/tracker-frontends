import { useNavigate } from "react-router-dom";
import { decryptData } from "../../utils/cryptoUtil";

const RequireAuth = ({ children }) => {
  const navigate = useNavigate();
  const user = decryptData(localStorage.getItem("user"));
  const token = decryptData(localStorage.getItem("auth-token"));
  // const user = localStorage.getItem("user");
  // const token = localStorage.getItem("auth-token");
  if (!user && !token) {
    navigate("/login", { replace: true });
  } else {
    return children;
  }
};

export default RequireAuth;
