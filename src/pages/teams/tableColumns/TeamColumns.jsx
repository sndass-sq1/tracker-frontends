/** @format */

import { FaRegEye } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router";
import { MdAdd } from "react-icons/md";
import { RiSubtractFill } from "react-icons/ri";
import { formatDate } from "../../../utils/formatDate";
import { ucFirst } from "../../../utils/ucFirst";
import { useAuth } from "../../../context/AuthContext";
import Highlighter from "../../../utils/highLighter";

const TeamColumns = ({
  search,
  addCoder,
  addAuditor,
  removeCoder,
  removeAuditor,
}) => {
  const auth = useAuth();
  let columns = [
    {
      accessorKey: "team_name",
      payloadKey: "id",
      header: "Team Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.team_name ? (
              <Highlighter searchVal={search} text={row.original.team_name} />
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "lead_name",
      header: "Lead Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            <div>{ucFirst(row.original.lead_name) || "NA"}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "manager_name",
      payloadKey: "manager_id",
      header: "Manager Name",
      endPoint: "managers/dropdown",
      type: "dropdown",
      isMulti: false,
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return <div>{ucFirst(row.original.manager_name) || "NA"}</div>;
      },
    },

    {
      accessorKey: "project_head_name",
      payloadKey: "project_head_id",
      header: "Project Head Name",
      endPoint: "project-heads/dropdown",
      type: "dropdown",
      isMulti: false,
      editable:
        auth.user.role === "super_admin" || auth.user.role === "manager"
          ? true
          : false,
      enableSorting: false,

      cell: ({ row }) => {
        return <div>{ucFirst(row.original.project_head_name) || "NA"}</div>;
      },
    },
    {
      accessorKey: "project_name",
      header: "Project Name",
      editable: false,
      enableSorting: false,

      cell: ({ row }) => {
        return <div>{ucFirst(row.original.project_name) || "NA"}</div>;
      },
    },
    {
      accessorKey: "sme_name",
      payloadKey: "sme_id",
      header: "SME Name",
      endPoint: "sme/dropdown",
      type: "dropdown",
      isMulti: false,
      editable: true,
      enableSorting: false,
      width: "150px",
      cell: ({ row }) => {
        return <div>{ucFirst(row.original.sme_name) || "NA"}</div>;
      },
    },
    {
      accessorKey: "coder_count",
      header: "Coders",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="d-flex justify-content-between gap-1">
            {row.original.coder_count === 0 ||
            row.original.coder_count == null ? (
              <>
                <button
                  onClick={() => addCoder(row.original.id)}
                  className="  actions-team-container  "
                  aria-label="Add coder"
                >
                  <MdAdd className="bi-add  cosdom-tabicon" />
                </button>
                <Link
                  className={`text-decoration-none ${
                    row.original.coder_count === 0 ||
                    row.original.coder_count == null
                      ? "wrapper-not-allowed "
                      : ""
                  }`}
                  to="#"
                  state={{
                    rows: row.original.id,
                    activeTab: "coders",
                  }}
                >
                  <div className="text-center count mx-2 ">NA</div>
                </Link>
                <button
                  onClick={() => removeCoder(row.original.id)}
                  className={`text-decoration-none ${
                    row.original.coder_count === 0 ||
                    row.original.coder_count == null
                      ? "disable-cus-count-team   actions-team-container "
                      : ""
                  }`}
                  aria-label="Remove coder"
                  disabled
                >
                  <RiSubtractFill className="  cosdom-tabicon" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => addCoder(row.original.id)}
                  className="  actions-team-container"
                  aria-label="Add coder"
                >
                  <MdAdd className="bi-add  cosdom-tabicon" />
                </button>
                <Link
                  className="text-decoration-none"
                  to={`/production/coders/${row.original.id}`}
                  state={{
                    rows: row.original.id,
                    activeTab: "coders",
                  }}
                >
                  <div className="text-center count mx-2 cus-count ">
                    {row.original.coder_count}
                  </div>
                </Link>
                <button
                  onClick={() => removeCoder(row.original.id)}
                  className="   actions-team-container"
                  aria-label="Remove coder"
                >
                  <RiSubtractFill className="bi-minus  cosdom-tabicon" />
                </button>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "auditor_count",
      header: "Auditors",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="d-flex justify-content-between gap-1">
            {row.original.auditor_count === 0 ||
            row.original.auditor_count == null ? (
              <>
                <button
                  onClick={() => addAuditor(row.original.id)}
                  className="  actions-team-container"
                >
                  <MdAdd className="bi-add  cosdom-tabicon" />
                </button>
                <Link
                  className={`text-decoration-none ${
                    row.original.auditor_count === 0 ||
                    row.original.auditor_count == null
                      ? "wrapper-not-allowed"
                      : ""
                  }`}
                  to="#"
                  state={{
                    rows: row.original.id,
                    activeTab: "auditors",
                  }}
                >
                  <div className="text-center count mx-2">NA</div>
                </Link>
                <button
                  onClick={() => removeAuditor(row.original.id)}
                  className={`text-decoration-none ${
                    row.original.auditor_count === 0 ||
                    row.original.auditor_count == null
                      ? "disable-cus-count-team   actions-team-container"
                      : ""
                  }`}
                  aria-label="Remove auditor"
                  disabled
                >
                  <RiSubtractFill className=" cosdom-tabicon" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => addAuditor(row.original.id)}
                  className="  actions-team-container"
                >
                  <MdAdd className="bi-add  cosdom-tabicon" />
                </button>
                <Link
                  className="text-decoration-none"
                  to={`/production/auditors/${row.original.id}`}
                  state={{
                    rows: row.original.id,
                    activeTab: "auditors",
                  }}
                >
                  <div className="text-center count mx-2 cus-count">
                    {row.original.auditor_count}
                  </div>
                </Link>
                <button
                  onClick={() => removeAuditor(row.original.id)}
                  className="  actions-team-container "
                >
                  <RiSubtractFill className="bi-minus cosdom-tabicon" />
                </button>
              </>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "created_by_name",
      header: "Created By Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.created_by_name ? (
              <>
                <div>{ucFirst(row.original.created_by_name)}</div>
              </>
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_by_email",
      header: "Created By Email",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.created_by_email ? (
              <span className="mute-font">{row.original.created_by_email}</span>
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "created at",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="created-at-width">
            {row.original.created_at
              ? formatDate(row.original.created_at)
              : "NA"}
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
      cell: ({ row }) => (
        <OverlayTrigger
          overlay={<Tooltip className="text-cap">View</Tooltip>}
          placement="bottom"
        >
          <button>
            <Link
              to="TeamProfile"
              state={{ id: row.original.id }}
              className="btn-icon"
            >
              <FaRegEye size={20} className="bi-view" />
            </Link>
          </button>
        </OverlayTrigger>
      ),
    },
  ];

  // if (auth.user.role === "project_head") {
  //   columns = columns.filter((column) => column.id !== "sme_name");
  // }
  // if (auth.user.role === "project_head") {
  //   columns = columns.filter((column) => column.accessorKey !== "sme_name");
  // }
  return columns;
};
export default TeamColumns;
