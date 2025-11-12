import { formatDate } from "../../utils/formatDate";
import Highlighter from "../../utils/highLighter";
import { FaRegEye } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router";

const LoginBulkUploadColumns = ({ search }) => {
    let columns = [
        {
            accessorKey: "login_name",
            header: "Login Name",
            editable: true,
            enableSorting: false,
            cell: ({ row }) => {
                return (
                    <div>

                        {row.original.login_name ? (
                            <Highlighter
                                searchVal={search}
                                text={row.original.login_name}
                            />
                        ) : (
                            "NA"
                        )}
                    </div>
                );
            },
        },

        {
            accessorKey: "login_email",
            header: "Login Email",
            editable: true,
            enableSorting: false,
            cell: ({ row }) => {
                return (
                    <div>

                        {row.original.login_email ? (
                            <Highlighter
                                searchVal={search}
                                text={row.original.login_email}
                            />
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
                    <div>

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
                    <OverlayTrigger
                        overlay={<Tooltip className="text-cap">View</Tooltip>}
                        container={this}
                        placement="bottom"
                    >
                        <button>
                            <Link
                                to={`/logins/${row.original.id}`}
                                state={{
                                    rows: row.original.id,
                                }}
                            >
                                <FaRegEye size={20} className="bi-view " />
                            </Link>
                        </button>
                    </OverlayTrigger>
                </>
            ),
        },

    ];
    return columns;
};
export default LoginBulkUploadColumns;
