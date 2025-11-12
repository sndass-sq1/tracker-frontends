import { formatDate } from "../../../utils/formatDate";
import Truncate from "../../../utils/Truncate";
import { ucFirst } from "../../../utils/ucFirst";
import Highlighter from "../../../utils/highLighter";

const AuditsColumnsHumana = ({ search, AuditComment }) => [
  {
    accessorKey: "chart_uid",
    header: "File Name",
    editable: false,
    enableSorting: false,
    cell: ({ row }) => {
      const value = row.original.chart_uid;
      return (
        <div style={{ width: "160px" }}>
          <Truncate text={value} maxLength={15}>
            <Highlighter searchVal={search} text={value} />
          </Truncate>
        </div>
      );
    },
  },
  {
    accessorKey: "member_id",
    header: "Member ID",
    editable: false,
    enableSorting: false,
    width: 110,
    cell: ({ row }) => {
      const value = row.original.member_id;
      return (
        <div style={{ width: "150px" }}>
          <Truncate text={value} maxLength={15}>
            <Highlighter searchVal={search} text={value} />
          </Truncate>
        </div>
      );
    },
  },
  {
    accessorKey: "audit_mode",
    header: "Audit Mode",
    editable: false,
    enableSorting: false,
    cell: ({ row }) => (
      <div>
        {ucFirst(
          row.original.audit_mode == "default_audit"
            ? "Default Audit"
            : "Manual Audit"
        ) || "NA"}
      </div>
    ),
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
    accessorKey: "coder_login_name",
    header: "Coder Login Name",
    editable: false,
    enableSorting: false,
    cell: ({ row }) => (
      <div>{ucFirst(row.original.coder_login_name) || "NA"}</div>
    ),
  },
  {
    accessorKey: "coding_complete_date",
    header: "Coding Complete Date",
    editable: false,
    enableSorting: false,
    cell: ({ row }) => {
      const timestamp = row.original.coding_complete_date;
      if (!timestamp) return <div className="created-at-width-search">-</div>;
      const [date] = timestamp.split("T");
      return <div>{date}</div>;
    },
  },
  {
    accessorKey: "audit_complete_date",
    header: "Audit Complete Date",
    editable: false,
    enableSorting: false,
    cell: ({ row }) => {
      const timestamp = row.original.audit_complete_date;
      if (!timestamp) return <div className="created-at-width-search">-</div>;
      const [date] = timestamp.split("T");
      return <div>{date}</div>;
    },
  },
  {
    accessorKey: "auditor_employee_id",
    header: "Audit Employee ID",
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
    accessorKey: "error_count",
    header: "Audit Comment",
    editable: false,
    enableSorting: false,
    cell: ({ row }) => {
      const { audit_comment, error_count } = row.original;
      return (
        <div className="d-flex justify-content-center align-content-center">
          {error_count === 0 || !error_count ? (
            <div className="text-center pointer-auto ">
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
    payloadKey: "audit_type",
    type: "dropdown",
    editable: true,
    enableSorting: false,
    staticOptions: [
      { value: "traditional", label: "traditional" },
      { value: "traditional_lookback", label: "traditional_lookback" },
      { value: "lookback", label: "lookback" },
    ],
    cell: ({ row }) => (
      <div className="">
        {row.original.audit_type ? ucFirst(row.original.audit_type) : "NA"}
      </div>
    ),
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
    header: "Original Code Found",
    editable: false,
    enableSorting: false,
  },
  {
    accessorKey: "total_errors",
    header: "Total Absolute Error",
    editable: false,
    enableSorting: false,
  },
  {
    accessorKey: "dx_codes_error",
    header: "No Of DX Codes Error",
    editable: false,
    enableSorting: false,
  },
  {
    accessorKey: "admin_error",
    header: "Number Of Admin Errors",
    editable: true,
    type: "number",
    enableSorting: true,
    width: 75,
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
    editable: true,
    type: "number",
    enableSorting: false,
    width: 75,
  },
  {
    accessorKey: "pos_corrected",
    header: "POS Corrected",
    editable: true,
    enableSorting: false,
    width: 75,
    type: "number",
  },
  {
    accessorKey: "dx_level_comment_code_corrected",
    header: "DX Level Comment Code Corrected",
    editable: true,
    enableSorting: false,
    width: 75,
    type: "number",
  },
  {
    accessorKey: "rendering_provider_corrected",
    header: "Rendering Provider Corrected",
    editable: true,
    enableSorting: false,
    width: 75,
    type: "number",
  },
  {
    accessorKey: "coding_at",
    header: "Coding Date",
    editable: false,
    enableSorting: false,
    cell: ({ row }) => (
      <div className="created-at-width-search">
        {row.original.coding_at ? formatDate(row.original.coding_at) : "-"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    accessorKey: "actions",
    showEdit: true,
    showDelete: true,
  },
];

export default AuditsColumnsHumana;
