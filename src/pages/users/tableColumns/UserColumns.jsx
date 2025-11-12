import { formatDate } from "../../../utils/formatDate";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router";
import { RiResetRightFill } from "react-icons/ri";
import { ucFirst } from "../../../utils/ucFirst";
import Highlighter from "../../../utils/highLighter";
import Truncate from "../../../utils/Truncate";
import { useAuth } from "../../../context/AuthContext";
import { FaUser } from "react-icons/fa";

const UserColumns = ({ search, addLogins, resetLogins, queryKey }) => {
  const auth = useAuth();
  let columns = [
    {
      accessorKey: "employee_id",
      header: "Emp Id",
      editable: true,
      enableSorting: true,
      width: 70,
      cell: ({ cell, row }) => {
        return (
          <div>
            {row.original.employee_id ? (
              <Highlighter
                searchVal={search}
                text={ucFirst(row.original.employee_id) || "NA"}
              />
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "User Name",
      editable: true,
      enableSorting: false,

      cell: ({ row, email }) => {
        // const { name, email } = row.original;
        return (
          <div>
            {row.original.name ? (
              <>
                <Highlighter
                  searchVal={search}
                  text={ucFirst(row.original.name) || "NA"}
                ></Highlighter>
              </>
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "email",
      header: "User Email",
      editable: true,
      enableSorting: true,
      cell: ({ cell, row }) => {
        return (
          <div>
            {row.original.email ? (
              // <Truncate maxLength={18} text={row.original.email} />

              // <Truncate
              //   maxLength={25}
              //   text={
              <Highlighter searchVal={search} text={row.original.email} />
            ) : (
              //   }
              // />
              "NA"
            )}
          </div>
        );
      },
    },
    // {
    //   accessorKey: "login_email",
    //   header: "Login Email",
    //   editable: true,
    //   enableSorting: true,
    // },
    {
      accessorKey: "role_name",
      header: "Role",
      payloadKey: "role_id",
      endPoint: "roles/dropdown",
      type: "dropdown",
      isMulti: false,
      editable: true,
      enableSorting: false,
      // width: 400,
      cell: ({ row }) => {
        const roleNameRaw = row.original.role_name || "NA";

        const ucWords = (str) =>
          str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

        const roleName = ucWords(roleNameRaw);
        const roleClassMap = {
          "Super Admin": "role-super-admin",
          Manager: "role-manager",
          "Project Head": "role-project-head",
          Lead: "role-lead",
          Coder: "role-coder",
          Auditor: "role-auditor",
          Sme: "role-sme",
        };

        const roleClass = roleClassMap[roleName] || "role-default";

        return <div className={`role-text ${roleClass}`}>{roleName}</div>;
      },
    },

    {
      accessorKey: "team_name",
      header: "Team Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        // const { team_id } = row.original;
        return <div>{row.original.team_name || "NA"}</div>;
      },
    },
    {
      accessorKey: "client_name",
      header: "Client Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        // const { team_id } = row.original;
        return <div>{ucFirst(row.original.client_name) || "NA"}</div>;
      },
    },
    {
      accessorKey: "project_name",
      header: "Project Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        // const { team_id } = row.original;
        return <div>{ucFirst(row.original.project_name) || "NA"}</div>;
      },
    },
    {
      accessorKey: "login_name",
      // header: "Login Name",
      header: () => (
        <div>
          <div className="text-center">Login Name</div>
        </div>
      ),
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const { login_name, login_email } = row.original;
        const isAssigned = login_name;
        return (
          <div>
            {login_name ? (
              <div className="d-flex  justify-content-between align-items-center ">
                <div>
                  <p>{login_name}</p>
                  <Truncate text={login_email} maxLength={15} />
                </div>
                <div className="m-2">
                  <OverlayTrigger
                    overlay={<Tooltip className="text-cap ">Reset</Tooltip>}
                    container={this}
                    placement="bottom"
                  >
                    <div
                      className={`text-center ms-2 ${
                        !isAssigned ? " cursor-wrapper" : " "
                      }`}
                    >
                      <p
                        className={`text-center ms-2 ${
                          !isAssigned
                            ? " text-secondary disable-cus-count"
                            : " cus-count "
                        }`}
                        disabled={!isAssigned}
                        onClick={() => {
                          resetLogins(row);
                        }}
                      >
                        <RiResetRightFill />
                      </p>
                    </div>
                  </OverlayTrigger>
                </div>
              </div>
            ) : row.original.role_name === "coder" ||
              row.original.role_name === "auditor" ? (
              <div className="d-flex justify-content-center">
                <button
                  onClick={() => addLogins(row.original.id)}
                  className="assign text-center ms-4 "
                >
                  Assign
                </button>
              </div>
            ) : (
              <p className="text-center">NA</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "location_name",
      header: "Location",
      payloadKey: "location_id",
      endPoint: "locations/dropdown",
      type: "dropdown",
      isMulti: false,
      editable: true,
      enableSorting: false,
      cell: ({ cell, row }) => {
        const { location_name } = row.original;
        return (
          <span>
            {location_name === "Thanjavur" ? (
              <div className="location-user2 ">
                {ucFirst(row.original.location_name) || "NA"}
              </div>
            ) : location_name === "Madurai" ? (
              <div className="location-user3 ">
                {ucFirst(row.original.location_name) || "NA"}
              </div>
            ) : location_name === "Chennai" ? (
              <div className="location-user1">
                {ucFirst(row.original.location_name) || "NA"}
              </div>
            ) : location_name === "Thoothukudi" ? (
              <div className="location-user4 ">
                {ucFirst(row.original.location_name) || "NA"}
              </div>
            ) : location_name === "Thirunelveli" ? (
              <div className="location-user5">
                {ucFirst(row.original.location_name) || "NA"}
              </div>
            ) : (
              ""
            )}
            <></>
          </span>
        );
      },
    },
    {
      accessorKey: "work_mode",
      header: "Work Mode",
      payloadKey: "work_mode_id",
      type: "dropdown",
      editable: true,
      enableSorting: false,
      width: 120,
      staticOptions: [
        { label: "On-Site", value: 1 },
        { label: "Remote", value: 2 },
        { label: "Hybrid", value: 3 },
      ],
      cell: ({ cell, row }) => {
        const { work_mode } = row.original;
        return (
          <span className="d-flex align-items-center">
            {work_mode === "onsite" ? (
              <div className="work-user2 ">
                {/* <FaDotCircle className=" me-1 " /> */}
                <img
                  src="/images/on-site.svg"
                  alt="Onsite"
                  className="on-site me-1"
                />
                {ucFirst(row.original.work_mode) || "NA"}
              </div>
            ) : work_mode === "remote" ? (
              <div className="work-user1 ">
                {/* <FaDotCircle className=" me-1 " /> */}
                <img
                  src="/images/remote.svg"
                  alt="Remote"
                  className="remote me-1"
                />
                {ucFirst(row.original.work_mode) || "NA"}
              </div>
            ) : work_mode === "hybrid" ? (
              <div className="work-user3">
                {/* <FaDotCircle className=" me-1 " /> */}
                <img
                  src="/images/hybrid.svg"
                  alt="Hybrid"
                  className="remote me-1"
                />
                {ucFirst(row.original.work_mode) || "NA"}
              </div>
            ) : (
              ""
            )}
            <></>
          </span>
        );
      },
    },

    {
      accessorKey: "created_by_name",
      header: "Created By Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.created_by_name ? (
              <>
                <div>{ucFirst(row.original.created_by_name)}</div>
                {/* <Truncate text={created_by_email} maxLength={20} /> */}
              </>
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_by_email",
      header: "Created By Email",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.created_by_email ? (
              <span className="mute-font">
                {/* <div>{created_by_name}</div> */}
                <Truncate text={row.original.created_by_email} maxLength={20} />
              </span>
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "created at",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="created-at-width">
            {row.original.created_at
              ? formatDate(row.original.created_at)
              : "NA"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      accessorKey: "actions",
      showEdit: true,
      showDelete: true,
      cell: ({ row }) => {
        const { role_name, team_name } = row.original;
        return (
          <>
            {role_name === "coder" && team_name == null ? (
              ""
            ) : (
              <OverlayTrigger
                overlay={<Tooltip className="text-cap">View</Tooltip>}
                container={this}
                placement="bottom"
              >
                <div
                  className={`${role_name === "coder" ? `` : "cursor-wrapper"}`}
                >
                  <button
                    className={`${
                      role_name === "coder" ? `` : "wrapper-not-allowed "
                    }`}
                  >
                    <Link
                      to={`/users/${row.original.id}`}
                      state={{
                        rows: row.original.id,
                      }}
                    >
                      <FaUser
                        size={15}
                        className={`${role_name === "coder" ? `bi-view` : ""}`}
                      />
                    </Link>
                  </button>
                </div>
              </OverlayTrigger>
              // </div>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "expand",
      header: "Log",
      editable: false,
      enableSorting: false,
      showLog: true,
    },
  ];
  if (auth.user.role === "project_head") {
    columns = columns.filter((column) => column.accessorKey !== "expand");
  }
  if (auth.user.role === "lead") {
    columns = columns.filter((column) => column.accessorKey !== "expand");
  }
  if (queryKey === "getassignUsers") {
    columns = columns.filter(
      (column) =>
        column.accessorKey !== "expand" && column.accessorKey !== "actions"
    );
  }
  return columns;
};
export default UserColumns;
