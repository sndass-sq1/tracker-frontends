import { useContext, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ToggleMenu from "./ToggleMenu";
import MobileSideNav from "./MobileSideNav";
import roleRoutes from "../../routes/roleRoutes";
import { useAuth } from "../../context/AuthContext";
import ModalComp from "../../components/ModalComp";
import { UserContext } from "../../UserContext/UserContext";

const Sidebar = ({ isCollapsed, toggleSidenav, handleClose, show }) => {
  const auth = useAuth();
  const userRole = auth?.user?.role;

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    auth.logout();
  };

  const handleShow = () => setShowLogoutModal(true);
  //   const decrypytActiveRole = useDecrypt(user?.activeRole);

  // Get allowed routes for the user role
  const allowedRoutes = roleRoutes[userRole] || [];
  const { theme } = useContext(UserContext);

  return (
    <>
      <div
        className={`sidenav bg-nav ${theme === "light" ? "" : " "} && ${
          isCollapsed ? "collapsed" : ""
        } `}
      >
        <Link className="text-decoration-none" to={`/`}>
          <div className="logo-section ">
            <div className="nav-logo ">
              <img
                src="/images/logo.png"
                alt="logo"
                // className={`  ${theme === "dark" ? "" : ""}`}
                // className="filtered-image"
              />
            </div>

            {!isCollapsed && (
              <span className="nav-logo">
                <img
                  src="/images/logo-icon.png"
                  alt="logo"
                  // className={`${theme === "light" ? "" : "icon-darktheme"}`}
                  className="filtered-image"
                />
              </span>
            )}
          </div>
        </Link>
        <div className="divider-line  "></div>
        <div className="overflow">
          <ul className="menu-items  ">
            {allowedRoutes.map(({ path, element, menu }) => {
              return (
                <>
                  {menu && (
                    <li className="menu-item" key={path}>
                      <OverlayTrigger
                        overlay={
                          <Tooltip className={`${theme === "dark" ? "" : ""}`}>
                            <span className="text-capitalize">{menu}</span>
                          </Tooltip>
                        }
                        placement="right"
                        trigger={["hover", "focus"]}
                        show={isCollapsed ? undefined : false}
                      >
                        <NavLink
                          to={path}
                          className={({ isActive }) =>
                            `menu-link  ${isActive ? "active" : ""} &&
                            ${theme === "light" ? "" : "listdark"}
                            }`
                          }
                        >
                          <span className="menu-icon">
                            <img
                              src={`/images/sidebar/${menu}.svg`}
                              alt={`${menu} Icon`}
                              // className={`${
                              //   theme === "light" ? "" : "icon-darktheme"
                              // }`}
                              className="filtered-image"
                            />
                          </span>
                          <span className="menu-text text-capitalize">
                            {menu}
                          </span>
                        </NavLink>
                      </OverlayTrigger>
                    </li>
                  )}
                </>
              );
            })}
            <li className="menu-item" title="">
              <OverlayTrigger
                overlay={
                  <Tooltip
                    className={`${theme === "light" ? "" : "custom-tooltip"}`}
                  >
                    Logout
                  </Tooltip>
                }
                placement="right"
                trigger={["hover", "focus"]}
                show={isCollapsed ? undefined : false}
              >
                <div
                  //   onClick={user?.logout}

                  className={`menu-link cursor-pointer ${
                    theme === "light" ? "  " : "listdark "
                  }`}
                  onClick={handleShow}
                >
                  <span className="menu-icon">
                    <img src="/images/sidebar/logout.svg" alt="Logout Icon" />
                  </span>

                  <span className="menu-text">Logout</span>
                </div>
              </OverlayTrigger>
              {/* </li> */}
            </li>
          </ul>
        </div>
      </div>
      <ModalComp
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        confirmLabel="Logout"
        cancelLabel="Cancel"
        confirmAction={handleLogout}
      >
        <p className="logout-para mt-3 ">
          Are you sure you want to Logout? Once you logout, you need to log in
          again.
        </p>
        <div className="d-flex justify-content-center mt-4">
          <img className="w-25" src="/images/log-out.svg" alt="Logout" />
        </div>
      </ModalComp>
      <MobileSideNav handleClose={handleClose} show={show} />
      <ToggleMenu isCollapsed={isCollapsed} toggleSidenav={toggleSidenav} />
    </>
  );
};

export default Sidebar;
