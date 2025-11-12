import { ucFirst } from "../../utils/ucFirst";
import Truncate from "../../utils/Truncate";
import Highlighter from "../../utils/highLighter";
const SearchByCoderColumns = ({ search }) => {
  let columns = [
    {
      accessorKey: "team_name",
      header: "Team Name",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "lead_name",
      header: "Lead Name",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => <div>{ucFirst(row.original.lead_name) || "NA"}</div>,
    },
    {
      accessorKey: "project_name",
      header: "Project Name",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "sub_project_name",
      header: "Sub Project",
      editable: true,
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
      accessorKey: "chart_id",
      header: "Chart ID",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "member_name",
      header: "Member Name",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => <div>{ucFirst(row.original.member_name) || "NA"}</div>,
    },
    {
      accessorKey: "dob",
      header: "D.O.B",
      editable: true,
      enableSorting: false,
      width: 200,
    },
    {
      accessorKey: "dos",
      header: "Total Dos",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "icd",
      header: "Total ICD",
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
      accessorKey: "action",
      header: "Coding Status",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="error-grp">
            {row.original.action === "Code Completed" ? (
              <div className="status-completed">
                {ucFirst(row.original.action) || "NA"}
              </div>
            ) : row.original.action === "Rejected" ? (
              <div className="status-rejected ">
                {ucFirst(row.original.action) || "NA"}
              </div>
            ) : row.original.action === "SAR" ? (
              <div className="status-pending ">
                {ucFirst(row.original.action) || "NA"}
              </div>
            ) : null}
            <></>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Chart Status",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const { status } = row.original;
        return (
          <span>
            {status === 1 ? (
              <div className="status-active">{"Active"}</div>
            ) : status === 0 ? (
              <div className="status-inactive">{"Inactive"}</div>
            ) : (
              "NA"
            )}
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
              <div className="status-audited ">{"Audited"}</div>
            ) : row.original.is_chart_audited === false ? (
              <div className="status-notaudited ">{"Not Audited"}</div>
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
      header: "Actions",
      editable: true,
      showEdit: true,
      showDelete: true,
      enableSorting: false,
    },
  ];

  return columns;
};
export default SearchByCoderColumns;
