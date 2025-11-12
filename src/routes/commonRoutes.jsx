import SSORedirect from "../pages/auth/SSORedirect";
import UserNotFound from "../errors/UserNotFound";
import AccessDenied from "../errors/AccessDenied";
import Login from "../pages/auth/Login";
import NotFound from "../errors/NotFound";
import Forbidden from "../errors/Forbidden";
import ServerError from "../errors/ServerError";

const commonRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/sso/zoho", element: <SSORedirect /> },
  { path: "/userNotFound", element: <UserNotFound /> },
  { path: "/accessDenied", element: <AccessDenied /> },
  { path: "/forbidden", element: <Forbidden /> },
  { path: "/server", element: <ServerError /> },
  { path: "*", element: <NotFound /> },
];

export default commonRoutes;
