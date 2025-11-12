import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { FaAngleDown } from "react-icons/fa";
import { MdMailOutline } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { useAuth } from "../../context/AuthContext";
import { ucFirst } from "../../utils/ucFirst";
import ModalComp from "../../components/ModalComp";
import { Link } from "react-router";
import ThemeSwitcher from "../../ThemeSwitcher";
import { UserContext } from "../../UserContext/UserContext";
import { VscAccount } from "react-icons/vsc";
import HelpSupportDropdown from "../../components/HelpSupport/HelpSupportDropdown";
import LoginThemeSwitcher from "../../LoginThemeSwitcher";

const Navbar = ({ isCollapsed, handleShow }) => {
  const auth = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [timer, setTimer] = useState(new Date());
  // const customDate = new Date().toDateString().slice(4);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    auth.logout();
  };

  useEffect(() => {
    const interval = setInterval(() => setTimer(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);
  const { theme } = useContext(UserContext);

  return (
    <div
      className={`main-content  ${
        isCollapsed ? "sidenav-collapsed" : "sidenav-expanded"
      }`}
    >
      <div className="navbar-header  navbar-fixed d-flex align-items-center bg-nav justify-content-between">
        <div className="d-flex align-items-center justify-content-start">
          {theme === "light" ? (
            <Link className="text-decoration-none" to={`/`}>
              <img
                src="/images/pro1Logo.png"
                className=" pro1-image px-3"
                alt="logo"
              />
            </Link>
          ) : (
            <>
              <Link className="text-decoration-none" to={`/`}>
                <img
                  src="/images/PRO1Logowhite.png"
                  className=" pro1-image px-3"
                  alt="logo"
                />
              </Link>
            </>
          )}
          <div className="nav-line ms-2 py-1 "></div>
          <div className=" d-flex flex-column justify-content-center align-items-center ms-3">
            <div
              className="anime-font1 fw-normal relative d-flex align-items-center"
              style={{ position: "relative" }}
            >
              {/* <img
                src="/images/popers.gif"
                alt="anime"
                className="position-absolute "
                style={{
                  width: "90px",
                  height: "90px",
                  top: -25,
                  right: 10,
                  zIndex: 10,
                }}
              /> */}
              <span className="logo-title1">Q@</span>
              <span className="logo-title2">98%</span>
            </div>

            <div className="anime-font2 fw-bolder">Work towards the goals</div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <div className="hamburger" onClick={handleShow}>
            <RxHamburgerMenu />
          </div>

          <div className="d-flex gap-2 align-items-center cus-gap">
            {/* <div className="client-logo d-flex justify-content-center align-items-center">
              <img src="/images/search-icon.svg" alt="search" />
            </div>
            <div className="client-logo d-flex justify-content-center align-items-center noti">
              <div className="noti-count">8</div>
              <img src="/images/notification.svg" alt="notification" />
            </div> */}
            {/* <div className="client-logo d-flex justify-content-center align-items-center cursor-pointer">
              <img src="./images/ques-icon.svg" alt="help" />
            </div> */}

            {/* <div className="client-logo darknavcard1 d-flex justify-content-center align-items-center">
              <img
                src="/images/calender.svg"
                alt="calender"
                className="filtered-image "
              />
              <div className="ms-3 ">
                <p className="nav-time ">{customDate} </p>
                <p className="nav-time mt-1 ">
                  
                  {timer.toLocaleTimeString()}
                </p>
              </div>
            </div> */}
            <div className="mt-2">
              {["super_admin", "manager", "project_head"].includes(
                auth?.user?.role
              ) && <HelpSupportDropdown />}
            </div>
            <div className="d-flex justify-content-center align-items-center mt-2">
              <LoginThemeSwitcher />
              {/* <ThemeSwitcher /> */}
            </div>

            {/* <div className="my-2 rounded-5 darknavcard1 d-flex justify-content-center align-items-center">
              <ThemeSwitcher />
            </div> */}
            {/* <ThemeSwitcher /> */}
            <div className="user-info" ref={dropdownRef}>
              <div className="user-sec desk-top" onClick={toggleDropdown}>
                <div className="user-profile cursor-pointer">
                  <img src="/images/user.png" alt="Profile" />
                </div>
                <div className="user-desp">
                  <p className="text-capitalize">{ucFirst(auth?.user?.name)}</p>
                  <p className="text-capitalize">
                    {ucFirst(auth?.user?.role.replace("_", " "))}
                  </p>
                </div>
                <div className="custom-dropdown-container d-flex ml-auto ">
                  <div className="cursor-pointer text-white fs-16">
                    <FaAngleDown />
                  </div>
                </div>
              </div>
              <div className="mobile-view" onClick={toggleDropdown}>
                <div className="user-profile cursor-pointer">
                  <img src="/images/user.png" alt="Profile" />
                </div>
              </div>

              {isOpen && (
                <div className="dropdown-menu-list darkcard ">
                  <div className="myProfile   overflow-hidden d-flex flex-column gap-2 align-items-start">
                    <div className="profile-sttng-navbar  hover-list px-3 py-1  ms-2 cursor-default">
                      <span className="cursor-default mx-1">
                        <MdMailOutline className="email-logo  " />
                      </span>
                      <span>{auth?.user?.email}</span>
                    </div>
                    <div className="li-divider"></div>
                    <Link
                      className="text-decoration-none d-flex align-items-center"
                      to={`/profile`}
                    >
                      <div className="profile-sttng hover-list px-3 py-1 ms-3 d-flex align-items-center ">
                        <span>
                          {/* <img
                            src="/images/sidebar/profile-user.svg"
                            alt="Profile Setting"
                            width={15}
                            height={25}
                            className="filtered-image"
                          /> */}
                          <VscAccount className=" fs-4" />
                        </span>
                        <span className=" mx-1 ">Profile</span>
                      </div>
                    </Link>
                    <div className="li-divider"></div>
                    <div
                      className="profile-sttng logout ms-3 hover-list px-3 py-1"
                      onClick={() => setShowLogoutModal(true)}
                    >
                      <span>
                        <img
                          src="/images/sidebar/logout.svg"
                          alt="Logout"
                          width={15}
                          className="px-1"
                        />
                      </span>
                      Logout
                    </div>
                    {/* <div className=" mx-auto" onClick={toggleDropdown}>
                      <ThemeSwitcher />
                    </div> */}
                  </div>
                </div>
              )}

              <ModalComp
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                confirmLabel="Logout"
                cancelLabel="Cancel"
                confirmAction={handleLogout}
              >
                <p className="logout-para  mt-3">
                  Are you sure you want to Logout? Once you logout, you need to
                  log in again.
                </p>
                <div className="d-flex justify-content-center mt-4 ">
                  <img
                    className="w-25"
                    src="/images/log-out.svg"
                    alt="Logout"
                  />
                </div>
              </ModalComp>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Navbar);
