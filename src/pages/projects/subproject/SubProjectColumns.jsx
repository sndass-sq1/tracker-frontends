import Highlighter from "../../../utils/highLighter";
import { ucFirst } from "../../../utils/ucFirst";

const SubProjectColumns = ({ search }) => {
  let columns = [
    {
      accessorKey: "sub_project_name",
      header: "Subproject Name",
      editable: true,
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.sub_project_name ? (
              <Highlighter
                searchVal={search}
                text={ucFirst(row.original.sub_project_name)}
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
export default SubProjectColumns;
