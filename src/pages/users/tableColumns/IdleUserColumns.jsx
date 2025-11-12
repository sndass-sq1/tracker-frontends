import { formatDate } from "../../../utils/formatDate";
import Highlighter from "../../../utils/highLighter";
import { ucFirst } from "../../../utils/ucFirst";
import Truncate from "../../../utils/Truncate";
import { FaDotCircle } from "react-icons/fa";

const IdleUserColumns = ({ search }) => {
  let columns = [
    {
      accessorKey: "employee_id",
      header: "Emp Id",
      editable: true,
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "User Name",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const { name, email, employee_id } = row.original;
        const displayName = ucFirst(name) ?? "NA";
        const displayEmail = ucFirst(email) ?? "NA";

        return (
          <div>
            {name ? (
              <>
                <Highlighter searchVal={search} text={displayName} />
                <div className="mt-1">
                  {employee_id ? (
                    <Truncate text={displayEmail} maxLength={18} />
                  ) : (
                    "NA"
                  )}
                </div>
              </>
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "login_name",
      header: "Login Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const { login_name, login_email } = row.original;
        return (
          <div style={{ width: "165px" }}>
            {login_name ? (
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p>{login_name}</p>
                  <p>{login_email}</p>
                </div>
              </div>
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "role_name",
      header: "Role",
      editable: true,
      enableSorting: false,

      cell: ({ row }) => {
        const roleNameRaw = row.original.role_name || "NA";
        const ucWords = (str) =>
          str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
        const roleName = ucWords(roleNameRaw);
        return <div style={{ width: "100px" }}>{roleName}</div>;
      },
    },
    {
      accessorKey: "location_name",
      header: "Location",
      isMulti: false,
      editable: false,
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
              <span className="mute-font">{row.original.created_by_email}</span>
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
      cell: ({ cell, row }) => {
        return (
          <div className="created-at-width">
            {row.original.created_at
              ? formatDate(row.original.created_at)
              : "NA"}
          </div>
        );
      },
    },

    // {
    //   id: "actions",
    //   header: "Actions",
    //   accessorKey: "actions",
    //   showEdit: true,
    //   showDelete: true,
    //   cell: ({ row }) => (
    //     <>
    //       <OverlayTrigger
    //         overlay={<Tooltip className="text-cap">View</Tooltip>}
    //         container={this}
    //         placement="bottom"
    //       >
    //         <button>
    //           <Link
    //             to={`/users/${row.original.id}`}
    //             state={{
    //               rows: row.original.id,
    //             }}
    //           >
    //             <FaRegEye size={20} />
    //           </Link>
    //         </button>
    //       </OverlayTrigger>
    //     </>
    //   ),
    // },
    // {
    //   id: "actions",
    //   header: "Actions",
    //   accessorKey: "actions",
    //   showEdit: true,
    //   showDelete: true,
    //   cell: ({ row }) => {
    //     const { login_name, role_name } = row.original;
    //     const isAssigned = login_name;

    //     return (
    //       <>
    //         <>
    //           <OverlayTrigger
    //             overlay={<Tooltip className="text-cap">View</Tooltip>}
    //             container={this}
    //             placement="bottom"
    //           >
    //             <div
    //               className={`${
    //                 role_name === "coder" || role_name === "auditor"
    //                   ? ``
    //                   : "cursor-wrapper"
    //               }`}
    //             >
    //               <button
    //                 className={`${
    //                   role_name === "coder" || role_name === "auditor"
    //                     ? ``
    //                     : "wrapper-not-allowed "
    //                 }`}
    //               >
    //                 <Link
    //                   to={`/users/${row.original.id}`}
    //                   state={{
    //                     rows: row.original.id,
    //                   }}
    //                 >
    //                   <FaRegEye
    //                     size={20}
    //                     className={`${
    //                       role_name === "coder" || role_name === "auditor"
    //                         ? `bi-view`
    //                         : ""
    //                     }`}
    //                   />
    //                 </Link>
    //               </button>
    //             </div>
    //           </OverlayTrigger>
    //         </>
    //         {/* ) : (
    //           ""
    //         )} */}
    //       </>
    //     );
    //   },
    // },
    // {
    //     accessorKey: "expand",
    //     header: "Log",
    //     editable: false,
    //     enableSorting: false,
    //     showLog: true,
    // },
  ];
  return columns;
};
export default IdleUserColumns;
