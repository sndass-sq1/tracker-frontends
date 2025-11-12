import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaRegEye } from "react-icons/fa";
import { Link } from "react-router";
import { ucFirst } from "../../../utils/ucFirst";
const AuditorTabColumns = () => {
  let columns = [
    {
      accessorKey: "user_name",
      header: "Auditor Name",
      editable: false,
      enableSorting: false,
      stickyLeft: 0,
      cell: ({ row }) => {
        return (
          <div style={{ width: "210px" }}>
            <p>{ucFirst(row.original.user_name || "NA")}</p>
          </div>
        );
      },
    },

    {
      accessorKey: "employee_id",
      header: "Employee Id",
      editable: false,
      enableSorting: false,
      stickyLeft: 226,
      cell: ({ row }) => {
        return (
          <div style={{ width: "120px" }}>
            <p>{row.original.employee_id || "NA"}</p>
          </div>
        );
      },
    },

    {
      accessorKey: "login_name",
      header: "Login Name",
      editable: false,
      enableSorting: false,
      stickyLeft: 360,
      cell: ({ row }) => {
        return (
          <div style={{ width: "150px" }}>
            <p>{ucFirst(row.original.login_name || "NA")}</p>
          </div>
        );
      },
    },

    {
      accessorKey: "today_chart_count",
      scrollKey: true,
      header: () => (
        <div className=" timeframetable-body">
          <div style={{ width: "250px" }}>
            <div className="timeframetable-header mx-5">Today Charts</div>
            <div className="timeframetable-subheader">
              <span className="mx-auto">Audits</span>
              <span className="mx-auto">Errors</span>
              <span className="mx-auto">Pages </span>
            </div>
          </div>
        </div>
      ),
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="timeframetable-body">
            <div style={{ width: "250px" }}>
              <div className="timeframetable-subheader">
                <span className="mx-auto">
                  {row.original.today_chart_count ?? "NA"}
                </span>
                <span className="mx-auto">
                  {row.original.today_total_errors ?? "NA"}
                </span>
                <span className="mx-auto">
                  {row.original.today_pages ?? "NA"}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "hourlyCounts",
      scrollKey: true,
      header: ({ table }) => {
        const firstRow = table.options.data[0];
        const hours = firstRow?.hourlyCounts || [];
        return (
          <div className=" timeframetable-body ">
            {hours.map((hour, index) => (
              <>
                <div className="d-flex flex-column" style={{ width: "190px" }}>
                  <div key={index} className=" timeframetable-header mx-5">
                    {hour.time}
                  </div>

                  <div className="timeframetable-subheader">
                    <span className="mx-auto">Audits</span>
                    <span className="mx-auto">Errors</span>
                    <span className="mx-auto">Pages </span>
                  </div>
                </div>
              </>
            ))}
          </div>
        );
      },
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const hours = row.original.hourlyCounts;

        return (
          <>
            <div className=" timeframetable-body ">
              {hours.map((hour) => (
                <>
                  <div
                    className="d-flex flex-column"
                    style={{ width: "190px" }}
                  >
                    <div className=" col timeframetable-subheader">
                      <span className="mx-auto">
                        {hour.chart_count ?? "NA"}
                      </span>
                      <span className="mx-auto">{hour.icd_count ?? "NA"}</span>
                      <span className="mx-auto">
                        {hour.pages_count ?? "NA"}
                      </span>
                    </div>
                  </div>
                </>
              ))}
            </div>
          </>
        );
      },
    },

    {
      accessorKey: "total_chart_count",
      header: () => (
        <div style={{ width: "120px" }}>
          <div>Total Charts</div>
        </div>
      ),
      editable: false,
      enableSorting: false,
      stickyRight: 65,
      cell: ({ row }) => {
        return (
          <div style={{ width: "120px" }}>
            <button className="cus-count text-center ms-4 pe-none">
              {row.original.total_chart_count || 0}
            </button>
          </div>
        );
      },
    },

    {
      id: "actions",
      header: "View",
      accessorKey: "actions",
      showEdit: true,
      showDelete: true,
      stickyRight: 0,
      cell: ({ row }) => (
        <>
          {row.original.total_chart_count !== 0 ? (
            <OverlayTrigger
              overlay={<Tooltip className="text-cap">View</Tooltip>}
              container={this}
              placement="bottom"
            >
              <button>
                <Link
                  to={`/auditor/charts/${row.original.user_log_id}`}
                  state={{
                    rows: row.original,
                    memberType: "teams_summary_auditor",
                  }}
                >
                  <FaRegEye size={20} className="bi-view" />
                </Link>
              </button>
            </OverlayTrigger>
          ) : (
            <button className="disable-cus-count">
              <FaRegEye size={20} className="" />
            </button>
          )}
        </>
      ),
    },
  ];
  return columns;
};

export default AuditorTabColumns;
