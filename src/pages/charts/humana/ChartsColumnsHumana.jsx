import { FaRegCommentDots } from "react-icons/fa";
import { ucFirst } from "../../../utils/ucFirst";
import { formatDate } from "../../../utils/formatDate";
import Highlighter from "../../../utils/highLighter";
import Truncate from "../../../utils/Truncate";

const HumanaColumns = ({ AuditComment, search }) => {
  let columns = [
    {
      accessorKey: "chart_uid",
      header: "File Name",
      editable: true,
      enableSorting: false,
      width: 110,
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
      editable: true,
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
      accessorKey: "project_name",
      payloadKey: "project_id",
      header: "Project Name",
      endPoint: `projects/dropdown/coder-humana-project`,
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
      accessorKey: "member_name",
      header: "PT Name",
      editable: true,
      enableSorting: false,
      width: 140,
      cell: ({ row }) => {
        return <> {ucFirst(row.original.member_name) || "NA"}</>;
      },
    },
    {
      accessorKey: "dob",
      header: "PT DOB",
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
    // {
    //   accessorKey: "no_of_dx_found_in_extractor",
    //   header: "Total DX Found in Extractor",
    //   editable: true,
    //   enableSorting: false,
    //   type: "number",
    //   width: 80,
    // },
    {
      accessorKey: "action",
      header: "Coding Status",
      payloadKey: "action",
      type: "dropdown",
      editable: true,
      enableSorting: false,
      width: 180,
      staticOptions: [
        { value: "Code Completed", label: "Code Completed" },
        { value: "Rejected", label: "Rejected" },
        { value: "SAR", label: "SAR" },
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
      accessorKey: "coding_at",
      header: "Coding Date",
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
      accessorKey: "coder_name",
      header: "Coder Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const { coder_name } = row.original;

        return (
          <>
            <p>{coder_name}</p>
          </>
        );
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
      id: "actions",
      header: "Actions",
      accessorKey: "actions",
      showEdit: true,
      showDelete: true,
    },
  ];
  return columns;
};
export default HumanaColumns;
