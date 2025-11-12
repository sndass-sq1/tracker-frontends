import { formatDate } from "../../utils/formatDate";
import Highlighter from "../../utils/highLighter";
import { FaRegEye } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router";

const UserBulkUploadColumns = ({ search }) => {
    let columns = [
        {
            accessorKey: "name",
            header: "User Name",
            editable: true,
            enableSorting: false,
            cell: ({ cell, row }) => {
                return (
                    <div>
                        {row.original.name ? (
                            <Highlighter searchVal={search} text={row.original.name} />
                        ) : (
                            "NA"
                        )}
                    </div>
                );
            },
        },

        {
            accessorKey: "email",
            header: "User Email",
            editable: true,
            enableSorting: false,
            cell: ({ cell, row }) => {
                return (
                    <div>

                        {row.original.email ? (
                            <Highlighter
                                searchVal={search}
                                text={row.original.email}
                            />
                        ) : (
                            "NA"
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            editable: true,
            enableSorting: false,
        },
        {
            accessorKey: "location",
            header: "Location",
            editable: true,
            enableSorting: false,
        },
        {
            accessorKey: "work_mode",
            header: "Work Mode",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "created_at",
            header: "created at",
            editable: false,
            enableSorting: false,
            cell: ({ cell, row }) => {
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
                                to={`/users/${row.original.id}`}
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
export default UserBulkUploadColumns;
