

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ErrorBoundary from "../../errors/ErrorBoundary";
import Sidebar from "../navbar/Sidebar";
import Navbar from "../navbar/Navbar";

const LayoutWithNav = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const toggleSidenav = () => {
    setIsCollapsed((prevState) => !prevState);
  };
  return (
    <>
      <div className="p-0 zoom-in">
        <div className="Sidebar-layout-page">
          <div className="Side-navbar-wrapper">
            <Sidebar
              isCollapsed={isCollapsed}
              toggleSidenav={toggleSidenav}
              show={show}
              handleShow={handleShow}
              handleClose={handleClose}
            />
            <Navbar isCollapsed={isCollapsed} handleShow={handleShow} />
            <div
              className={`main-content ${
                isCollapsed ? "sidenav-collapsed" : "sidenav-expanded"
              } `}
            >
              <div className="content-wrapper pt-2 back-bg">
                <ErrorBoundary>
                  <Outlet />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LayoutWithNav;
