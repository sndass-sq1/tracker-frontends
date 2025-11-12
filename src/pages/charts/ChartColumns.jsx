import { formatDate } from "../../utils/formatDate";
import { ucFirst } from "../../utils/ucFirst";
import { FaRegCommentDots } from "react-icons/fa";
import Highlighter from "../../utils/highLighter";

const ChartColumns = ({ AuditComment, search }) => {
  let columns = [
    {
      accessorKey: "chart_id",
      header: "Chart ID",
      editable: true,
      enableSorting: true,
      width: 110,
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
      accessorKey: "project_type",
      header: "Project Type",
      editable: false,
      enableSorting: false,
      type: "dropdown",
      staticOptions: [
        { value: "HCC", label: "HCC" },
        { value: "No HCC", label: "No HCC" },
      ],
      width: 180,
    },
    {
      accessorKey: "member_name",
      header: "Member Name",
      editable: true,
      enableSorting: false,
      width: 140,
      cell: ({ row }) => {
        return <> {ucFirst(row.original.member_name) || "NA"}</>;
      },
    },
    {
      accessorKey: "dob",
      header: "D.O.B",
      editable: true,
      enableSorting: false,
      type: "date",
      width: 100,
    },
    {
      accessorKey: "dos",
      header: "Total DOS",
      editable: true,
      enableSorting: false,
      type: "number",
      width: 80,
    },
    {
      accessorKey: "icd",
      header: "Total ICD",
      editable: true,
      enableSorting: false,
      type: "number",
      width: 80,
    },
    {
      accessorKey: "pages",
      header: "Total Pages",
      editable: true,
      enableSorting: false,
      type: "number",
      width: 80,
    },
    {
      accessorKey: "no_of_dx_found_in_extractor",
      header: "Total DX Found in Extractor",
      editable: true,
      enableSorting: false,
      type: "number",
      width: 80,
    },
    {
      accessorKey: "action",
      header: "Coding Status",
      payloadKey: "action",
      type: "dropdown",
      editable: true,
      enableSorting: false,
      width: 180,
      staticOptions: [
        { value: "Code Completed", label: "Audit Completed" },
        { value: "Rejected", label: "Rejected" },
        { value: "SAR", label: "SAR" },
      ],
      cell: ({ row }) => {
        return (
          <div className="error-grp">
            {row.original.action === "Code Completed" ? (
              <div className="status-completed">
                {ucFirst(row.original.action) || "NA"}
                {/* {" Audit Completed" || "NA"} */}
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
      accessorKey: "comments",
      payloadKey: "comments",
      header: "Comments",
      editable: true,
      enableSorting: false,
      type: "textarea",
      isMandatory: true,
      cell: ({ row }) => {
        return (
          <>
            <button
              className="border-none actions-container "
              onClick={() => AuditComment(row.original)}
            >
              <FaRegCommentDots className="bi-edit fs-5" />
            </button>
          </>
        );
      },
    },
    {
      accessorKey: "project_name",
      payloadKey: "project_id",
      header: "Project Name",
      endPoint: `projects/dropdown/coder-project`,
      type: "dropdown",
      isMulti: false,
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return <div>{ucFirst(row.original.project_name) || "NA"}</div>;
      },
    },
    {
      accessorKey: "sub_project_name",
      header: "Sub Project Name",
      payloadKey: "sub_project_id",
      endPoint: `sub-projects/dropdown`,
      type: "dropdown",
      editType: "subProEdit",
      isMulti: false,
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return <div>{ucFirst(row.original.sub_project_name) || "NA"}</div>;
      },
    },
    {
      accessorKey: "coder_login_name",
      header: "Login Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const { coder_login_name } = row.original;

        return (
          <>
            <p>{coder_login_name}</p>
          </>
        );
      },
    },
    {
      accessorKey: "coder_login_email",
      header: "Login Email",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const { coder_login_email } = row.original;

        return (
          <>
            <p>{coder_login_email}</p>
          </>
        );
      },
    },
    {
      accessorKey: "coding_at",
      header: "Date",
      editable: false,
      enableSorting: false,
      width: 50,
      cell: ({ row }) => {
        return (
          <div className="table-date w-132">
            {row.original.coding_at ? formatDate(row.original.coding_at) : "NA"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      accessorKey: "actions",
      showEdit: true,
      showDelete: true,
    },
  ];
  return columns;
};
export default ChartColumns;
