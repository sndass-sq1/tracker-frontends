import { ucFirst } from "../../../../utils/ucFirst";
import { formatDate } from "../../../../utils/formatDate";
import Truncate from "../../../../utils/Truncate";
import Highlighter from "../../../../utils/highLighter";

const AuditorTeamSummaryR = ({ AuditComment, search }) => {
  let columns = [
    {
      accessorKey: "team_name",
      header: "Team Name",
      eeditable: false,
      enableSorting: false,
    },

    {
      accessorKey: "project_name",
      header: "Project Name",
      eeditable: false,
      enableSorting: false,
    },
    {
      accessorKey: "sub_project_name",
      header: "Sub Project Name",
      eeditable: false,
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
      accessorKey: "chart_id",
      header: "Chase ID",
      eeditable: false,
      enableSorting: false,
    },
    {
      accessorKey: "coder_name",
      header: "Coder Name",
      eeditable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <p>{ucFirst(row.original.coder_name || "NA")}</p>
          </div>
        );
      },
    },

    {
      accessorKey: "coder_employee_id",
      header: "Coder Employee ID",
      eeditable: false,
      enableSorting: false,
    },

    {
      accessorKey: "coder_login_name",
      header: "Coder_login Name",
      eeditable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <p>{ucFirst(row.original.coder_login_name || "NA")}</p>
          </div>
        );
      },
    },

    {
      accessorKey: "coding_complete_date",
      header: "Coding Complete Date",
      eeditable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return <div>{formatDate(row.original.coding_complete_date)}</div>;
      },
    },
    {
      accessorKey: "audit_complete_date",
      header: "Audit Complete Date",
      eeditable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.audit_complete_date
              ? formatDate(row.original.audit_complete_date)
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "icd",
      header: "Total HCC Category Reviewed",
      eeditable: false,
      enableSorting: false,
    },
    {
      accessorKey: "auditor_name",
      header: "Auditor Name",
      eeditable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <p>{ucFirst(row.original.auditor_name || "NA")}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "auditor_employee_id",
      header: "Auditor Employee ID",
      eeditable: false,
      enableSorting: false,
    },
    {
      accessorKey: "auditor_login_name",
      header: "Auditor Login Name",
      eeditable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <p>{ucFirst(row.original.auditor_login_name || "NA")}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "pages",
      header: "Total Pages",
      eeditable: false,
      enableSorting: false,
    },

    {
      accessorKey: "total_errors",
      header: "Total Errors",
      eeditable: false,
      enableSorting: false,
    },
    {
      accessorKey: "error_count",
      header: "Comments",
      eeditable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const { audit_comment, error_count } = row.original;
        return (
          <div className="d-flex justify-content-center align-content-center">
            {error_count === 0 || !error_count ? (
              <div className="text-center pointer-auto created-at-width">
                {audit_comment || "NA"}
              </div>
            ) : (
              <button
                onClick={() => AuditComment(row.original)}
                className="mx-auto cus-count text-center"
              >
                <p>{error_count}</p>
              </button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "qa_score",
      header: "QA Scroe",
      eeditable: false,
      enableSorting: false,
    },
    {
      accessorKey: " coding_at",
      header: "Coding Date",
      eeditable: false,
      enableSorting: false,
    },

    {
      accessorKey: "created_at",
      header: "Created At",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.created_at
              ? formatDate(row.original.created_at)
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "time",
      header: "Time",
      eeditable: false,
      enableSorting: false,
    },
  ];
  return columns;
};

export default AuditorTeamSummaryR;
