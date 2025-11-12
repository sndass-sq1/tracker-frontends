import Highlighter from "../../../utils/highLighter";

const CheckListColumns = ({ search }) => {
    let columns = [
        {
            accessorKey: "checklist_name",
            header: "Checklist Name",
            editable: true,
            enableSorting: true,
            cell: ({ cell, row }) => {
                return (
                    <div>

                        {row.original.checklist_name ? (
                            <Highlighter
                                searchVal={search}
                                text={row.original.checklist_name}
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
        },
    ];
    return columns;
};
export default CheckListColumns;
