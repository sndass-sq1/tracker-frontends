import { FaRegCommentDots } from "react-icons/fa6";
import { formatDate } from "../../../utils/formatDate";
import { ucFirst } from "../../../utils/ucFirst";
import Truncate from "../../../utils/Truncate";
import Highlighter from "../../../utils/highLighter";

const ChartColumnsR = ({ AuditComment, search }) => {
  let columns = [
    {
      accessorKey: "chart_id",
      header: "Chase ID",
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
      accessorKey: "member_name",
      header: "Member Name",
      editable: true,
      enableSorting: false,
      width: 140,
      cell: ({ row }) => {
        return (
          <div>
            <p>{ucFirst(row.original.member_name || "NA")}</p>
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
    },

    {
      accessorKey: "dob",
      header: "D.O.B",
      editable: true,
      enableSorting: false,
      type: "date",
    },
    {
      accessorKey: "icd",
      header: "Total HCC Category Reviewed",
      editable: true,
      enableSorting: false,
      type: "number",
      width: 80,
      // textWrap: true,
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
      accessorKey: "action",
      header: "Actions",
      payloadKey: "action",
      type: "dropdown",
      editable: true,
      enableSorting: false,
      width: 180,
      staticOptions: [
        { value: "Code Completed", label: "Code Completed" },
        { value: "Rejected", label: "Rejected" },
      ],
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
              className="border-none actions-container mx-3 my-2"
              onClick={() => AuditComment(row.original)}
            >
              <FaRegCommentDots className="bi-edit fs-5" />
            </button>
          </>
        );
      },
    },

    {
      accessorKey: "created_at",
      header: "Date",
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
      accessorKey: "project_name",
      header: "Project Name",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "sub_project_name",
      header: "Sub Project Name",
      payloadKey: "sub_project_id",
      endPoint: `sub-projects/dropdown`,
      type: "dropdown",
      isMulti: false,
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="created-at-width-search">
            <Truncate
              text={ucFirst(row.original.sub_project_name) || "NA"}
              maxLength={20}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "coder_login_name",
      header: "Login Name",
      editable: false,
      enableSorting: false,
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
export default ChartColumnsR;
