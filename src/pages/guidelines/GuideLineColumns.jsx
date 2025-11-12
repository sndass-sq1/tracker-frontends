import { formatDate } from "../../utils/formatDate";
import Highlighter from "../../utils/highLighter";
import { FaRegCommentDots, FaRegEye } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router";
import {
  IoIosCheckmarkCircleOutline,
  IoIosCloseCircleOutline,
} from "react-icons/io";
import { MdOutlinePending } from "react-icons/md";
import { ucFirst } from "../../utils/ucFirst";
import { useAuth } from "../../context/AuthContext";

const GuideLineColumns = ({ AuditComment, search }) => {
  const auth = useAuth();
  let columns = [
    {
      accessorKey: "project_name",
      header: "Project Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.project_name ? (
              <Highlighter
                searchVal={search}
                text={ucFirst(row.original.project_name) || "NA"}
              />
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <>
            <div>{ucFirst(row.original.title) || "NA"}</div>
          </>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <button
            className="border-none actions-container mx-3 my-2"
            onClick={() => AuditComment(row.original)}
          >
            <FaRegCommentDots className="bi-edit fs-5" />
          </button>
        );
      },
    },
    {
      accessorKey: "flag",
      header: "Status",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const {
          flag,
          approver_name,
          approver_role_name,
          rejecter_name,
          rejecter_role_name,
        } = row.original;

        return (
          <>
            <div>
              {flag === 1 ? (
                <OverlayTrigger
                  overlay={
                    <Tooltip>
                      Approved by {approver_name} ({approver_role_name})
                    </Tooltip>
                  }
                >
                  <IoIosCheckmarkCircleOutline className="guide-icon-success" />
                </OverlayTrigger>
              ) : flag === 0 ? (
                <OverlayTrigger overlay={<Tooltip>Pending</Tooltip>}>
                  <MdOutlinePending className="guide-icon-pending" />
                </OverlayTrigger>
              ) : (
                flag === 2 && (
                  <OverlayTrigger
                    overlay={
                      <Tooltip>
                        Rejected by {rejecter_name} ({rejecter_role_name})
                      </Tooltip>
                    }
                  >
                    <IoIosCloseCircleOutline className="guide-icon-rejected" />
                  </OverlayTrigger>
                )
              )}
            </div>
          </>
        );
      },
    },
    {
      accessorKey: "file_type",
      header: "File Type",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const { file_type } = row.original;

        return (
          <>
            {file_type === ".pdf" ? (
              <p>PDF File</p>
            ) : file_type === ".jpeg" ? (
              <p>Image</p>
            ) : file_type === ".jpg" ? (
              <p>Image</p>
            ) : file_type === ".png" ? (
              <p>Image</p>
            ) : file_type === ".xls" ? (
              <p>Excel File</p>
            ) : file_type === ".xlsx" ? (
              <p>Excel File</p>
            ) : file_type === ".csv" ? (
              <p>Excel File</p>
            ) : (
              <p>Unknown file type</p>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "uploader_name",
      header: "Created By Name",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const { uploader_name } = row.original;
        return (
          <div>
            {uploader_name ? (
              <>
                <div>{ucFirst(row.original.uploader_name) || "NA"}</div>

                {/* <div>{uploader_email}</div> */}
              </>
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "uploader_email",
      header: "Created By Email",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const { uploader_email } = row.original;
        return (
          <div>
            {uploader_email ? (
              <div className="mute-font">{uploader_email}</div>
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
        <>
          {row.original.pdf_url === null ||
          row.original.flag === 0 ||
          row.original.flag === 1 ? (
            <OverlayTrigger
              overlay={<Tooltip className="text-cap">View</Tooltip>}
              container={this}
              placement="bottom"
            >
              <button>
                <Link
                  to={`/view-guide/${row.original.id}`}
                  state={{ pdfurl: row.original.pdf_url, row: row.original }}
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
  if (
    auth.user.role === "project_head" ||
    auth.user.role === "lead" ||
    auth.user.role === "auditor" ||
    auth.user.role === "coder"
  ) {
    columns = columns.filter((column) => column.accessorKey !== "flag");
  }
  return columns;
};
export default GuideLineColumns;
