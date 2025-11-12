import { ToastContainer } from "react-toastify";
import AppRoutes from "./routes/AppRoutes";
import "react-tabs/style/react-tabs.css";
import IdleLogout from "./utils/IdleLogout";
import { UserProvider } from "./UserContext/UserContext";
function App() {
  return (
    <>
      {/* <IdleLogout timeout={900000}> */}
      <UserProvider>
        <IdleLogout>
          <AppRoutes />
        </IdleLogout>
        <ToastContainer />
      </UserProvider>
    </>
  );
}

export default App;
