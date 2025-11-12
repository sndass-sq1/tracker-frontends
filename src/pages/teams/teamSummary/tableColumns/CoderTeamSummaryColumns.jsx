import { FaRegCommentDots } from "react-icons/fa";
import { ucFirst } from "../../../../utils/ucFirst";
import { formatDate } from "../../../../utils/formatDate";
import { useState } from "react";

const CoderTeamSummaryColumns = ({ AuditComment }) => {
  let columns = [
    {
      accessorKey: "team_name",
      header: "Team Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <>
            <div className="error-grp ">
              {row.original.action === "Rejected" ? (
                <div className="text-danger">{row.original.team_name}</div>
              ) : (
                <>{row.original.team_name}</>
              )}
              <></>
            </div>
          </>
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
      accessorKey: "coder_login_name",
      header: "Login Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <>
            <div>{ucFirst(row.original.coder_login_name || "NA")}</div>
          </>
        );
      },
    },
    {
      accessorKey: "coder_name",
      header: "User Name",
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
      header: "Employee Id",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "chart_id",
      header: "Chart Id",
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
      cell: ({ row }) => {
        return <div style={{ width: "100px" }}>{row.original.dob || "NA"}</div>;
      },
    },
    {
      accessorKey: "dos",
      header: "Total DOS",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "icd",
      header: "Total ICD",
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
      accessorKey: "action",
      header: "Status",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <>
            <div className="error-grp ">
              {row.original.action === "Code Completed" ? (
                <div className="status-completed">
                  {row.original.action || "NA"}
                </div>
              ) : row.original.action === "Rejected" ? (
                <div className="status-rejected ">
                  {row.original.action || "NA"}
                </div>
              ) : row.original.action === "SAR" ? (
                <div className="status-pending ">
                  {row.original.action || "NA"}
                </div>
              ) : null}
              <></>
            </div>
          </>
        );
      },
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
              className="border-none me-2 "
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
  ];
  return columns;
};

export default CoderTeamSummaryColumns;
