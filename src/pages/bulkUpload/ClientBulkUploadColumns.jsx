import { formatDate } from "../../utils/formatDate";
import Highlighter from "../../utils/highLighter";

const ClientBulkUploadColumns = ({ search }) => {
  let columns = [
    {
      accessorKey: "client_name",
      header: "Client Name",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.client_name ? (
              <Highlighter searchVal={search} text={row.original.client_name} />
            ) : (
              "NA"
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "client_code",
      header: "Client Code",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.client_code ? (
              <Highlighter searchVal={search} text={row.original.client_code} />
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
          <div className="">
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
    },
  ];
  return columns;
};
export default ClientBulkUploadColumns;
