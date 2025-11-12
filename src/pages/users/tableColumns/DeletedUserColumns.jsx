import { formatDate } from "../../../utils/formatDate";
import Highlighter from "../../../utils/highLighter";
import Truncate from "../../../utils/Truncate";
import { ucFirst } from "../../../utils/ucFirst";
import { FaDotCircle } from "react-icons/fa";

const DeletedUserColumns = ({ search }) => {
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
        const { email } = row.original;
        return (
          <div>
            {row.original.name ? (
              <>
                <Highlighter
                  searchVal={search}
                  text={ucFirst(row.original.name) || "NA"}
                ></Highlighter>
                <div>
                  {row.original.employee_id ? (
                    <Highlighter
                      searchVal={search}
                      text={ucFirst(email) || "NA"}
                    />
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
      accessorKey: "role",
      header: "Role",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const roleNameRaw = row.original.role || "NA";
        const ucWords = (str) =>
          str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
        const roleName = ucWords(roleNameRaw);
        // const roleColorMap = {
        //   "Super Admin": "#e60000",
        //   Manager: "#005ce6",
        //   "Project Head": "#8e44ad",
        //   Lead: "#e67e22",
        //   Coder: "#27ae60",
        //   Auditor: "#fb49b1",
        //   Sme: "#6c3483",
        // };
        // const textColor = roleColorMap[roleName] || "black";
        return <div style={{ width: "100px" }}>{roleName}</div>;
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      isMulti: false,
      editable: false,
      enableSorting: false,
      cell: ({ cell, row }) => {
        const { location } = row.original;
        return (
          <span>
            {location === "thanjavur" ? (
              <div className="location-user2 ">{ucFirst(location) || "NA"}</div>
            ) : location === "madurai" ? (
              <div className="location-user3 ">{ucFirst(location) || "NA"}</div>
            ) : location === "chennai" ? (
              <div className="location-user1">{ucFirst(location) || "NA"}</div>
            ) : location === "thoothukudi" ? (
              <div className="location-user4 ">{ucFirst(location) || "NA"}</div>
            ) : location === "thirunelveli" ? (
              <div className="location-user5">{ucFirst(location) || "NA"}</div>
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
      accessorKey: "reason",
      header: "Reason",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const reason = row.original.reason || "NA";
        // const normalizedReason = reason.trim().toLowerCase();

        // const colorMap = {
        //   terminated: "#e74c3c",
        //   relieved: "#f39c12",
        //   absconded: "#8e44ad",
        // };

        // const textColor = colorMap[normalizedReason] || "#555";

        return <div className="default-col-width">{ucFirst(reason)}</div>;
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
    //     accessorKey: "expand",
    //     header: "Log",
    //     editable: false,
    //     enableSorting: false,
    //     showLog: true,
    // },
  ];
  return columns;
};
export default DeletedUserColumns;
