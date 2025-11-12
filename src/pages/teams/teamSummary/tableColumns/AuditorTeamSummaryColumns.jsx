import { formatDate } from "../../../../utils/formatDate";
import { ucFirst } from "../../../../utils/ucFirst";

const AuditorTeamSummaryColumns = ({ AuditComment }) => {
  let columns = [
    {
      accessorKey: "team_name",
      header: "Team Name",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "project_name",
      header: "Project Name",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "project_head_name",
      header: "Project Head",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <p>{ucFirst(row.original.project_head_name || "NA")}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "manager_name",
      header: "Manager Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <p>{ucFirst(row.original.manager_name || "NA")}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "chart_id",
      header: "Chart ID",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "coder_name",
      header: "Coder Name",
      editable: false,
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
      header: "Coder Employee Id",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "coder_login_name",
      header: "Coder Login Name",
      editable: false,
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
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return <div>{formatDate(row.original.coding_complete_date)}</div>;
      },
    },
    {
      accessorKey: "audit_complete_date",
      header: "Audit Complete Date",
      editable: false,
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
      accessorKey: "auditor_name",
      header: "Auditor Name",
      editable: false,
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
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "auditor_login_name",
      header: "Auditor Login Name",
      editable: false,
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
      accessorKey: "total_pages",
      header: "Total Pages",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "error_count",
      header: "Comments",
      editable: false,
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
      accessorKey: "audit_type",
      header: "Audit Type",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <p>{ucFirst(row.original.audit_type || "NA")}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "chart_qa_score",
      header: "Chart Level QA Score",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const quality = row.original.chart_qa_score;
        if (quality === null || quality === undefined) return "N/A";

        return Number(quality).toFixed(2);
      },
    },
    {
      accessorKey: "dx_qa_score",
      header: "DX Level QA Score",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const quality = row.original.dx_qa_score;
        if (quality === null || quality === undefined) return "N/A";

        return Number(quality).toFixed(2);
      },
    },
    {
      accessorKey: "original_code_found",
      header: "Original Codes Found",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "total_errors",
      header: "Total Absolute Errors",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "dx_codes_error",
      header: "No of DX codes Error",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "admin_error",
      header: "No of Admin errors ",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "codes_added",
      header: "Codes Added",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "codes_deleted",
      header: "Codes Deleted",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "dx_codes_updated",
      header: "DX Codes Updated",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "dos_corrected",
      header: "DOS Corrected",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "pos_corrected",
      header: "POS Corrected",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "dx_level_comment_code_corrected",
      header: "DX Level Comment Code Corrected",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "rendering_provider_corrected",
      header: "Rendering Provider Corrected",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "coding_at",
      header: "Coding Date",
      editable: false,
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
      editable: false,
      enableSorting: false,
    },
  ];
  return columns;
};

export default AuditorTeamSummaryColumns;
