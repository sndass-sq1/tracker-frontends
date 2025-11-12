import { FaRegCommentDots } from "react-icons/fa";
import { ucFirst } from "../../../../utils/ucFirst";
import { formatDate } from "../../../../utils/formatDate";
import Truncate from "../../../../utils/Truncate";
import Highlighter from "../../../../utils/highLighter";

const CoderTeamSummaryR = ({ AuditComment, search }) => {
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
      accessorKey: "project_head_name",
      header: "Project Head Name",
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
      accessorKey: "coder_login_name",
      header: "Login Name",
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
      header: "Coder Employee ID",
      editable: false,
      enableSorting: false,
    },

    {
      accessorKey: "chart_id",
      header: "Chase ID",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "member_name",
      header: "Member Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <p>{ucFirst(row.original.member_name || "NA")}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "dob",
      header: "D.O.B",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "icd",
      header: "Total HCC Category Reviewed",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "pages",
      header: "Total Pages",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "comments",
      header: "Comments",
      editable: false,
      enableSorting: false,
      type: "textarea",
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
      accessorKey: "chart_quality",
      header: "Quality",
      cell: ({ row }) => {
        const quality = row.original.chart_quality;
        if (quality === null || quality === undefined) return "N/A";

        return Number(quality).toFixed(2);
      },
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

    // {
    //   accessorKey: "logs",
    //   header: "Log",
    //   editable: false,
    //   enableSorting: false,
    // },
  ];
  return columns;
};

export default CoderTeamSummaryR;
