import { formatDate } from "../../../utils/formatDate";
import Truncate from "../../../utils/Truncate";
import { ucFirst } from "../../../utils/ucFirst";
import Highlighter from "../../../utils/highLighter";

const AuditColumnsR = ({ AuditComment, search }) => {
  let columns = [
    {
      accessorKey: "chart_id",
      header: "Chase ID",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div style={{ width: "100px" }}>
            {row.original.chart_id ? (
              <Highlighter
                searchVal={search}
                text={row.original.chart_id || "NA"}
              />
            ) : (
              "NA"
            )}
          </div>
        );
      },
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
      accessorKey: "coder_name",
      header: "Coder Name",
      editable: true,
      enableSorting: false,
      width: 75,
      cell: ({ row }) => <div>{ucFirst(row.original.coder_name) || "NA"}</div>,
    },
    {
      accessorKey: "coder_employee_id",
      header: "Coder Employee ID",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "coder_login_name",
      header: "Coder Login Name",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "coding_complete_date",
      header: "Coding Complete Date",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
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
          <div>
            {row.original.audit_complete_date
              ? formatDate(row.original.audit_complete_date)
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "original_code_found",
      header: "Total HCC Category Reviewed",
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
      accessorKey: "total_errors",
      header: "Total Errors",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "audit_comment",
      header: "Auditor Comments",
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
    // {
    //   accessorKey: "icd_qa_score",
    //   header: "Quality Score",
    //   editable: false,
    //   enableSorting: false,
    //   cell: ({ row }) => {
    //     const quality = row.original.icd_qa_score;
    //     if (quality === null || quality === undefined) return "N/A";

    //     return Number(quality).toFixed(2);
    //   },
    // },
    {
      accessorKey: "chart_qa_score",
      header: "Error Percentage",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const quality = row.original.chart_qa_score;
        if (quality === null || quality === undefined) return "N/A";

        return Number(quality).toFixed(2);
      },
    },

    {
      accessorKey: "coding_at",
      header: "Coding Date",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.coding_at ? formatDate(row.original.coding_at) : "-"}
          </div>
        );
      },
    },
    // {
    //   id: "actions",
    //   header: "Actions",
    //   accessorKey: "actions",
    //   showEdit: true,
    //   showDelete: true,
    // },
  ];
  return columns;
};
export default AuditColumnsR;
