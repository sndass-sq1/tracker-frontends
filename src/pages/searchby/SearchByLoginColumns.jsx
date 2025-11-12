const SearchByLoginColumns = () => {
  let columns = [
    {
      accessorKey: "login_name",
      header: "Login Name",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "login_email",
      header: "Login Email",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      editable: true,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="error-grp">
            {row.original.status === "active" ? (
              <div className="status-completed">{"Active"}</div>
            ) : (
              <div className="status-rejected ">{"Inactive"}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "user_name",
      header: "User Name",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "employee_id",
      header: "User Employee ID",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "user_email",
      header: "User Email",
      editable: true,
      enableSorting: false,
    },

    {
      accessorKey: "team_lead",
      header: "Lead Name",
      editable: true,
      enableSorting: false,
    },
  ];

  return columns;
};
export default SearchByLoginColumns;
