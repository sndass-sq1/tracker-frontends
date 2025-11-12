import Highlighter from "../../utils/highLighter";
import { FaRegEye } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router";

const ProjectBulkUploadColumns = ({ search }) => {
    let columns = [
        {
            accessorKey: "client_name",
            header: "Client Name",
            editable: true,
            enableSorting: false,
            cell: ({ cell, row }) => {
                return (
                    <div>

                        {row.original.client_name ? (
                            <Highlighter
                                searchVal={search}
                                text={row.original.client_name}
                            />
                        ) : (
                            "NA"
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "project_name",
            header: "Project Name",
            editable: true,
            enableSorting: false,
            cell: ({ cell, row }) => {
                return (
                    <div>

                        {row.original.project_name ? (
                            <Highlighter
                                searchVal={search}
                                text={row.original.project_name}
                            />
                        ) : (
                            "NA"
                        )}
                    </div>
                );
            },
        },

        {
            accessorKey: "project_code",
            header: "Project Code",
            editable: true,
            enableSorting: false,
            cell: ({ cell, row }) => {
                return (
                    <div>

                        {row.original.project_code ? (
                            <Highlighter
                                searchVal={search}
                                text={row.original.project_code}
                            />
                        ) : (
                            "NA"
                        )}
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
                                to={`/projects/${row.original.id}`}
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
export default ProjectBulkUploadColumns;
