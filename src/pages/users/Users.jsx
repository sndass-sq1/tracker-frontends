/** @format */

import { changeTabTitle } from "../../utils/changeTabTitle";
import AddUser from "./AddUser";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import UsersTable from "./UsersTable";
import UserColumns from "./tableColumns/UserColumns";
import DeletedUserColumns from "./tableColumns/DeletedUserColumns";
import IdleUserColumns from "./tableColumns/IdleUserColumns";
import { Link, useLocation, useNavigate } from "react-router";
import { FaUpload } from "react-icons/fa6";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Users = () => {
  changeTabTitle("Users");

  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const roleId = searchParams.get("role_id");
  const locationId = searchParams.get("location_id");
  const pathTab = location.pathname.includes("idle")
    ? "idleUsers"
    : location.pathname.includes("deleted")
      ? "deletedUsers"
      : location.pathname.includes("assign")
        ? "assignUsers"
        : "users";

  const [activeTab, setActiveTab] = useState(pathTab);
  const handleTabSelect = (selectedKey) => {
    setActiveTab(selectedKey);
    // const newPath =
    //   selectedKey === "idleUsers"
    //     ? "/users/idle"
    //     : selectedKey === "deletedUsers"
    //       ? "/users/deleted"
    //       : selectedKey === "assignUsers"
    //         ? "/users/assign"
    //         : "/users";
    // navigate(newPath);
  };

  return (
    <div className='container-fluid'>
      <div className='d-flex justify-content-between'>
        <h5 className='t-title'>Add User</h5>
        {auth.user.role === "super_admin" ||
        auth.user.role === "manager" ||
        auth.user.role === "project_head" ||
        auth.user.role !== "lead" ? (
          <OverlayTrigger
            overlay={<Tooltip className='text-cap'>Bulk Upload</Tooltip>}
            container={this}
            placement='bottom'>
            <Link to='/users/bulkUpload' className='text-dark'>
              <FaUpload className='fs-5 me-3 text-theme' />
            </Link>
          </OverlayTrigger>
        ) : (
          ""
        )}
      </div>

      <AddUser />

      {auth.user.role === "super_admin" || auth.user.role === "manager" ? (
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          id='uncontrolled-tab-example'
          className='mt-3 px-3 darkcard py-0 w-auto border-none '>
          <Tab eventKey='users' title='User'>
            {activeTab === "users" && (
              <UsersTable
                apiEndPoint={`users${
                  roleId || locationId
                    ? `?${roleId ? `role_id=${roleId}` : ""}${
                        locationId
                          ? `${roleId ? "&" : ""}location_id=${locationId}`
                          : ""
                      }`
                    : ""
                }`}
                exportApiEndPoint={`users/export${
                  roleId || locationId
                    ? `?${roleId ? `role_id=${roleId}` : ""}${
                        locationId
                          ? `${roleId ? "&" : ""}location_id=${locationId}`
                          : ""
                      }`
                    : ""
                }`}
                queryKey={`getUsers-${roleId || "all"}-${locationId || "all"}`}
                title='User'
                tableColumns={UserColumns}
              />
            )}
          </Tab>
          <Tab eventKey='assignUsers' title='Assigned User'>
            {activeTab === "assignUsers" && (
              <UsersTable
                // apiEndPoint="users/assigned-users"
                apiEndPoint={`users/assigned-users${
                  roleId || locationId
                    ? `?${roleId ? `role_id=${roleId}` : ""}${
                        locationId
                          ? `${roleId ? "&" : ""}location_id=${locationId}`
                          : ""
                      }`
                    : ""
                }`}
                exportApiEndPoint='users'
                queryKey='getassignUsers'
                title='Assigned User'
                tableColumns={UserColumns}
              />
            )}
          </Tab>
          <Tab eventKey='idleUsers' title='Unassigned User'>
            {activeTab === "idleUsers" && (
              <UsersTable
                // apiEndPoint="users/unassigned-users"
                apiEndPoint={`users/unassigned-users${
                  roleId || locationId
                    ? `?${roleId ? `role_id=${roleId}` : ""}${
                        locationId
                          ? `${roleId ? "&" : ""}location_id=${locationId}`
                          : ""
                      }`
                    : ""
                }`}
                exportApiEndPoint='users'
                queryKey='getIdleUsers'
                title='Unassigned User'
                tableColumns={IdleUserColumns}
              />
            )}
          </Tab>

          <Tab eventKey='deletedUsers' title='Deleted User'>
            {activeTab === "deletedUsers" && (
              <UsersTable
                apiEndPoint='users/archived-users'
                exportApiEndPoint='users'
                queryKey='getArchivedUsers'
                title='Deleted User'
                tableColumns={DeletedUserColumns}
              />
            )}
          </Tab>
        </Tabs>
      ) : (
        <UsersTable
          apiEndPoint={`users${
            roleId || locationId
              ? `?${roleId ? `role_id=${roleId}` : ""}${
                  locationId
                    ? `${roleId ? "&" : ""}location_id=${locationId}`
                    : ""
                }`
              : ""
          }`}
          exportApiEndPoint={`users/export${
            roleId || locationId
              ? `?${roleId ? `role_id=${roleId}` : ""}${
                  locationId
                    ? `${roleId ? "&" : ""}location_id=${locationId}`
                    : ""
                }`
              : ""
          }`}
          queryKey={`getUsers-${roleId || "all"}`}
          title='User'
          tableColumns={UserColumns}
        />
      )}
    </div>
  );
};

export default Users;
