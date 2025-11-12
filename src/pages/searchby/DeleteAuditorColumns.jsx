import { formatDate } from "../../utils/formatDate";
import Truncate from "../../utils/Truncate";
import { ucFirst } from "../../utils/ucFirst";
const DeletedAuditorColumns = () => {
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
        return <div>{ucFirst(row.original.lead_name) || "NA"}</div>;
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
      header: "Sub Project Name",
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
      accessorKey: "chart_id",
      header: "Chart ID",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "coder_name",
      header: "Coder Name",
      editable: false,
      cell: ({ row }) => <div>{ucFirst(row.original.coder_name) || "NA"}</div>,
    },
    {
      accessorKey: "coder_employee_id",
      header: "Coder Employee ID",
      editable: false,
    },
    {
      accessorKey: "coding_complete_date",
      header: "Coding Complete Date",
      editable: false,
      cell: ({ row }) => {
        return (
          <div className="created-at-width-search">
            {row.original.coding_complete_date
              ? formatDate(row.original.coding_complete_date)
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "audit_complete_date",
      header: "Audit Complete Date",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="created-at-width-search">
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
            <div>{ucFirst(row.original.auditor_name) || "NA"}</div>
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
      accessorKey: "total_pages",
      header: "Total Pages",
      editable: false,
      enableSorting: false,
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
      header: "	Chart Level QAScore",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "dx_qa_score",
      header: "DX Level QAScore",
      editable: false,
      enableSorting: false,
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
      header: "No of Admin errors",
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
      accessorKey: "time",
      header: "Time",
      editable: false,
      enableSorting: false,
    },
  ];

  return columns;
};

export default DeletedAuditorColumns;
