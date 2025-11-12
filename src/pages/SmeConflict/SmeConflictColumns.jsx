import { ucFirst } from "../../utils/ucFirst";
import { useAuth } from "../../context/AuthContext";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router";
import { FaRegEye } from "react-icons/fa";
import Truncate from "../../utils/Truncate";
const SmeConflictColumns = () => {
  const auth = useAuth();

  let columns = [
    {
      accessorKey: "auditor_chart",
      header: "Chart ID",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const { chart_id, chart_uid } = row?.original?.auditor_chart;

        if (chart_id == null || chart_id == "") {
          return <div className="chart-id">{chart_uid || "NA"}</div>;
        } else {
          return <div className="chart-id">{chart_id || "NA"}</div>;
        }
      },
    },

    {
      accessorKey: "auditor_chart.coder_chart.user_id",
      header: "Feedback Action",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const feedbackList = row.original.error_feedback || [];
        let buttonClass = "error-count-completed";

        if (auth.user.role === "sme") {
          if (feedbackList.some((item) => item.sme_status === null)) {
            buttonClass = "error-count";
          }
        }

        const allResolved =
          feedbackList.length > 0 &&
          feedbackList.every(
            (item) => item.sme_status !== null && item.sme_comment !== null
          );

        return (
          <div className="px-2 py-1 rounded border-0">
            <p className={` ${buttonClass}`}>
              {allResolved ? "Resolved" : "Unresolved"}
            </p>
          </div>
        );
      },
    },

    {
      accessorKey: "auditor_chart.coder_chart.project.project_name",
      header: "Project Name",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const projectname =
          row.original.auditor_chart?.coder_chart?.project?.project_name;
        return <div>{projectname || "NA"}</div>;
      },
    },
    {
      accessorKey: "auditor_chart.coder_chart.sub_project.sub_project_name",
      header: "Sub Project",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const subprojectname =
          row.original.auditor_chart?.coder_chart?.sub_project
            ?.sub_project_name;
        return (
          <div className="created-at-width-search">
            <Truncate text={subprojectname || "NA"} maxLength={25} />
          </div>
        );
      },
    },
    {
      accessorKey: "auditor_chart.coder_chart.project_type",
      header: "Project Type ",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const projecttype =
          row.original.auditor_chart?.coder_chart?.project_type;
        return <div>{projecttype || "NA"}</div>;
      },
    },

    {
      accessorKey: "auditor_chart.user.name",
      header: "Auditor Name",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const auditorname = row.original.auditor_chart?.user?.name;
        return <div>{ucFirst(auditorname || "NA")}</div>;
      },
    },
    {
      accessorKey: "auditor_chart.auditor_login_email.login_name",
      header: "Auditor Login Name ",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const auditorloginname =
          row.original.auditor_chart?.auditor_login_email?.login_name;
        return <div>{ucFirst(auditorloginname || "NA")}</div>;
      },
    },
    {
      accessorKey: "auditor_chart.coder_chart.user.name",
      header: "Coder Name",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const codername = row.original.auditor_chart?.coder_chart?.user?.name;
        return <div>{ucFirst(codername || "NA")}</div>;
      },
    },
    {
      accessorKey: "auditor_chart.coder_chart.coder_login_email.login_name",
      header: "Coder Login Name",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        const coderloginname =
          row.original.auditor_chart?.coder_chart?.coder_login_email
            ?.login_name;
        return <div>{ucFirst(coderloginname || "NA")}</div>;
      },
    },
    // {
    //   accessorKey: "auditor_chart.coder_chart.user_id",
    //   header: "Status",
    //   editable: false,
    //   enableSorting: false,
    //   cell: ({ row }) => {
    //     const feedbackList = row.original.error_feedback || [];
    //     let buttonClass = "status-completed";

    //     if (auth.user.role === "coder") {
    //       if (feedbackList.some(item => item.coder_status === null)) {
    //         buttonClass = "status-pending";
    //       }
    //     } else if (auth.user.role === "auditor") {
    //       if (feedbackList.some(item => item.auditor_status === null)) {
    //         buttonClass = "status-pending";
    //       }
    //     } else {
    //       if (
    //         feedbackList.some(
    //           item => item.coder_status === null || item.auditor_status === null
    //         )
    //       ) {
    //         buttonClass = "status-pending";
    //       }
    //     }

    //     return (
    //       <div
    //         className="px-2 py-1 rounded border-0"
    //         onClick={() => AuditComment(row.original)}
    //       >
    //         <p className={`${buttonClass}`}>
    //           {buttonClass ? "Completed" : "Pending"}
    //         </p>
    //       </div>
    //     );
    //   },
    //   // cell: ({ row }) => {
    //   //   const feedbackList = row.original.error_feedback || [];
    //   //   return <div>{feedbackList.length || "NA"}</div>;
    //   // },
    // },
    {
      id: "actions",
      header: "Actions",
      accessorKey: "actions",
      showEdit: true,
      showDelete: true,
      cell: ({ row }) => (
        <>
          <OverlayTrigger
            overlay={<Tooltip className="text-cap">View</Tooltip>}
            container={this}
            placement="bottom"
          >
            <button>
              <Link
                state={{ row: row.original }}
                to={`/details/${row.original.auditor_chart.chart_id}`}
              >
                <FaRegEye size={20} className="bi-view" />
              </Link>
            </button>
          </OverlayTrigger>
        </>
      ),
    },
  ];

  return columns;
};

export default SmeConflictColumns;
