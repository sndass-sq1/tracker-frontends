import Truncate from "../../utils/Truncate";
import { ucFirst } from "../../utils/ucFirst";
const DeletedCoderColumns = () => {
  let columns = [
    {
      accessorKey: "team_name",
      header: "Team Name",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "lead_name",
      header: "Lead Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <div>{ucFirst(row.original.lead_name) || "NA"}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "project_name",
      header: "Project Name",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "sub_project_name",
      header: "Sub Project",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="created-at-width-search">
            <Truncate
              text={ucFirst(row.original.sub_project_name)}
              maxLength={18}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "coder_name",
      header: "Coder Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => <div>{ucFirst(row.original.coder_name) || "NA"}</div>,
    },
    {
      accessorKey: "coder_employee_id",
      header: "Coder Employee ID",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "chart_id",
      header: "Chart ID",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "member_name",
      header: "Member Name",
      editable: false,
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
      header: "D.O.B",
      editable: false,
      enableSorting: false,
      width: 200,
    },
    {
      accessorKey: "dos",
      header: "Total Dos",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "icd",
      header: "Total ICD",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "pages",
      header: "Total Pages",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "action",
      header: "Coding Status",
      editable: false,
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
      editable: false,
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
      editable: false,
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
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "time",
      header: "Time",
      editable: false,
      enableSorting: false,
    },
  ];

  return columns;
};
export default DeletedCoderColumns;
