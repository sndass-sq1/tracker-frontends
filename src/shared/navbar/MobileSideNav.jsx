import { useState, React } from "react";
import { useAuth } from "../../context/AuthContext";
import { Offcanvas, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import roleRoutes from "../../routes/roleRoutes";
import ModalComp from "../../components/ModalComp";
import { useContext } from "react";
import { UserContext } from "../../UserContext/UserContext";

const MobileSideNav = ({ handleClose, show, isCollapsed, toggleSidenav }) => {
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
      <div className="mobile-side-nav">
        <Offcanvas show={show} onHide={handleClose} className="bg-nav">
          <Offcanvas.Header>
            <Offcanvas.Title>
              <div className="logo-section ">
                <div className="nav-logo">
                  <Link className="text-decoration-none" to={`/`}>
                    <img src="/images/logo.png" alt="logo" />
                  </Link>
                </div>
                <span>
                  <img
                    src="/images/logo-icon.png"
                    alt="logo"
                    className="filtered-image"
                  />
                </span>
              </div>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <div className="divider-line"></div>
          <Offcanvas.Body>
            <div className="overflow">
              <ul className="menu-items">
                {allowedRoutes.map(({ path, element, menu }) => {
                  return (
                    <>
                      {menu && (
                        <li className="menu-item " key={path}>
                          <OverlayTrigger
                            overlay={
                              <Tooltip>
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
                                `menu-link  ${isActive ? "active" : ""} && ${theme === "light" ? "" : "listdark"}`
                              }
                            >
                              <span className="menu-icon">
                                <img
                                  src={`/images/sidebar/${menu}.svg`}
                                  alt={`${menu} Icon`}
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
                    overlay={<Tooltip>Logout</Tooltip>}
                    placement="right"
                    trigger={["hover", "focus"]}
                    show={isCollapsed ? undefined : false}
                  >
                    <div
                      //   onClick={user?.logout}
                      className="menu-link cursor-pointer"
                      onClick={handleShow}
                    >
                      <span className="menu-icon">
                        <img
                          src="/images/sidebar/logout.svg"
                          alt="Logout Icon"
                        />
                      </span>
                      <div>
                        <span className="menu-text listdark">Logout</span>
                      </div>
                    </div>
                  </OverlayTrigger>
                  {/* </li> */}
                </li>
              </ul>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
        <ModalComp
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          confirmLabel="Logout"
          cancelLabel="Cancel"
          confirmAction={handleLogout}
        >
          <p className="logout-para mt-3">
            Are you sure you want to Logout? Once you logout, you need to log in
            again.
          </p>
          <div className="d-flex justify-content-center mt-4">
            <img className="w-25" src="/images/log-out.svg" alt="Logout" />
          </div>
        </ModalComp>
        {/* <ToggleMenu isCollapsed={isCollapsed} toggleSidenav={toggleSidenav} /> */}
      </div>
    </>
  );
};

export default MobileSideNav;
