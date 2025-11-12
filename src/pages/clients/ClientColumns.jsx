/** @format */

import { Link } from "react-router";
import Highlighter from "../../utils/highLighter";
import { formatDate } from "../../utils/formatDate";
import Truncate from "../../utils/Truncate";
import { ucFirst } from "../../utils/ucFirst";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaRegEye } from "react-icons/fa";
const ClientColumns = ({ search }) => {
  let columns = [
    {
      accessorKey: "client_name",
      header: "Client Name",
      editable: true,
      enableSorting: true,
      cell: ({ cell, row }) => {
        return (
          <div style={{ width: "100px" }}>
            {row.original.client_name ? (
              <Highlighter searchVal={search} text={row.original.client_name} />
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "client_code",
      header: "Client Code",
      editable: true,
      enableSorting: true,
      cell: ({ cell, row }) => {
        return (
          <div>
            {row.original.client_code ? (
              <Highlighter searchVal={search} text={row.original.client_code} />
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "project_count",
      header: "Projects",
      editable: false,
      enableSorting: false,
      cell: ({ cell, row }) => {
        return (
          <>
            {row.original.project_count !== 0 ? (
              <Link
                className="text-decoration-none"
                to={`/clients/project-count/${row.original.id}`}
                state={{
                  rows: row.original.id,
                }}
              >
                <div className=" cus-count text-center ms-2 ">
                  {row.original.project_count}
                </div>
              </Link>
            ) : (
              <span className="text-muted ms-2 text-theme">NA</span>
            )}
          </>
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
                {row.original.created_by_email}
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
    {
      id: "actions",
      header: "Actions",
      accessorKey: "actions",
      showEdit: true,
      showDelete: true,
      cell: ({ row }) => (
        <OverlayTrigger
          overlay={<Tooltip className="text-cap">View</Tooltip>}
          placement="bottom"
        >
          <button>
            <Link
              to={`clientProfile`}
              state={{ rows: row.original.id }}
              className="btn-icon"
            >
              <FaRegEye size={20} className="bi-view" />
            </Link>
          </button>
        </OverlayTrigger>
      ),
    },
    {
      accessorKey: "expand",
      header: "Log",
      editable: false,
      enableSorting: false,
      showLog: true,
    },
  ];
  // if (auth.user.role === "manager") {
  //   columns = columns.filter((column) => column.accessorKey !== "actions");
  // }
  return columns;
};
export default ClientColumns;
