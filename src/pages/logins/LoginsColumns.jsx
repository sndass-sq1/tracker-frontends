import { formatDate } from "../../utils/formatDate";
import Highlighter from "../../utils/highLighter";
import { ucFirst } from "../../utils/ucFirst";
import { useAuth } from "../../../src/context/AuthContext";

const LoginsColumns = ({ search }) => {
  const auth = useAuth();
  let columns = [
    {
      accessorKey: "login_name",
      header: "Login Name",
      editable: true,
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <div className="">
            {row.original.login_name ? (
              <Highlighter
                searchVal={search}
                text={ucFirst(row.original.login_name) || "NA"}
              />
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "login_email",
      header: "Login Email",
      editable: true,
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <div className="">
            {row.original.login_email ? (
              <Highlighter
                searchVal={search}
                text={ucFirst(row.original.login_email) || "NA"}
              />
            ) : (
              "NA"
            )}
          </div>
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
              <div>{ucFirst(row.original.created_by_name)}</div>
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
            {row.original.created_by_name ? (
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
  return columns;
};
export default LoginsColumns;
