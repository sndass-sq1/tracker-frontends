import Highlighter from "../../utils/highLighter";
import { ucFirst } from "../../utils/ucFirst";
import Truncate from "../../utils/Truncate";
const SearchByCoderColumnsR = ({ search }) => {
  let columns = [
    {
      accessorKey: "chart_id",
      header: "Chase ID",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "coder_name",
      header: "Coder Name",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => <div>{ucFirst(row.original.coder_name) || "NA"}</div>,
    },
    {
      accessorKey: "coder_employee_id",
      header: "Coder Employee ID",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "member_name",
      header: "Member Name",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <p>{ucFirst(row.original.member_name || "NA")}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "dob",
      header: "DOB",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "icd",
      header: "Total HCC Category Reviewed",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "pages",
      header: "Total Pages",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "date",
      header: "Date",
      editable: true,
      enableSorting: false,
    },

    {
      accessorKey: "project_name",
      header: "Project Name",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "sub_project_name",
      header: "Sub Project Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const value = row.original.sub_project_name;
        return (
          <div style={{ width: "100px" }}>
            <Truncate text={value} maxLength={10}>
              <Highlighter searchVal={search} text={value} />
            </Truncate>
          </div>
        );
      },
    },
    {
      accessorKey: "coder_login_name",
      header: "Login Name",
      editable: true,
      enableSorting: false,
    },

    {
      accessorKey: "status",
      header: "Chart status",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const { status } = row.original;
        return (
          <span>
            {status === "1" ? (
              <div className="status-active">{"Active"}</div>
            ) : status === "0" ? (
              <div className="status-inactive">{"Inactive"}</div>
            ) : (
              "NA"
            )}
            <></>
          </span>
        );
      },
    },

    {
      accessorKey: "is_chart_audited",
      header: "Audit Status",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <span>
            {row.original.is_chart_audited === true ? (
              <div className="status-audited">{"Audited"}</div>
            ) : row.original.is_chart_audited === false ? (
              <div className="status-notaudited">{"Not Audited"}</div>
            ) : (
              "NA"
            )}
          </span>
        );
      },
    },

    {
      accessorKey: "coding_at",
      header: "Date",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "time",
      header: "Time",
      editable: true,
      enableSorting: false,
    },
    {
      id: "actions",
      accessorKey: "actions",
      header: "Action",
      editable: true,
      showEdit: true,
      showDelete: true,
    },
  ];

  return columns;
};
export default SearchByCoderColumnsR;
