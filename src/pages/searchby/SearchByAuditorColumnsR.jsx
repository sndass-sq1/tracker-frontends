import { formatDate } from "../../utils/formatDate";
import Truncate from "../../utils/Truncate";
import { ucFirst } from "../../utils/ucFirst";
import Highlighter from "../../utils/highLighter";

const SearchByAuditorColumnsR = ({ search }) => {
  let columns = [
    {
      accessorKey: "team_name",
      header: "Team Name",
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
      accessorKey: "coder_login_name",
      header: "Coder Login Name",
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
      accessorKey: "auditor_login_name",
      header: "Auditor Login Name",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "original_code_found",
      header: "Total HCC Category Reviewed",
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
      accessorKey: "total_errors",
      header: "Total Absolute Errors",
      editable: true,
      enableSorting: false,
    },

    {
      accessorKey: "icd_qa_score",
      header: "	Chart Level QAScore",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const quality = row.original.icd_qa_score;
        if (quality === null || quality === undefined) return "N/A";

        return Number(quality).toFixed(2);
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
export default SearchByAuditorColumnsR;
