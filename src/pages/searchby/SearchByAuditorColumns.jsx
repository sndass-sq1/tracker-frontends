import { formatDate } from "../../utils/formatDate";
import Truncate from "../../utils/Truncate";
import { ucFirst } from "../../utils/ucFirst";
import Highlighter from "../../utils/highLighter";

const SearchByAuditorColumns = ({ search }) => {
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
      accessorKey: "chart_id",
      header: "Chart ID",
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
      accessorKey: "coding_complete_date",
      header: "Coding Complete Date",
      editable: true,
      enableSorting: false,
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
      editable: true,
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
      editable: true,
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
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "total_pages",
      header: "Total Pages",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "audit_type",
      header: "Audit Type",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return <div>{ucFirst(row.original.audit_type) || "NA"}</div>;
      },
    },
    {
      accessorKey: "chart_qa_score",
      header: "	Chart Level QAScore",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "dx_qa_score",
      header: "DX Level QAScore",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "original_code_found",
      header: "Original Codes Found",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "total_errors",
      header: "Total Absolute Errors",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "dx_codes_error",
      header: "No of DX codes Error",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "admin_error",
      header: "No of Admin errors",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "codes_added",
      header: "Codes Added",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "dx_codes_updated",
      header: "DX Codes Updated",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "dos_corrected",
      header: "DOS Corrected",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "pos_corrected",
      header: "POS Corrected",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "dx_level_comment_code_corrected",
      header: "DX Level Comment Code Corrected",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "rendering_provider_corrected",
      header: "Rendering Provider Corrected",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "coding_at",
      header: "Coding Date",
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
export default SearchByAuditorColumns;
