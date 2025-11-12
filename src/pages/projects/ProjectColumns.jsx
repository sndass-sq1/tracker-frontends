/** @format */

import { formatDate } from "../../utils/formatDate";
import Highlighter from "../../utils/highLighter";
import { Link } from "react-router";
import { ucFirst } from "../../utils/ucFirst";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaRegEye } from "react-icons/fa";
const ProjectColumns = ({ search, addSubProject }) => {
  let columns = [
    {
      accessorKey: "project_name",
      header: "Project Name",
      editable: true,
      enableSorting: true,
      cell: ({ row }) => {
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
      enableSorting: true,
      cell: ({ row }) => {
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
      accessorKey: "subprojects_count",
      header: "Sub Projects",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        const sub_project_count = row.original.sub_projects_count || 0;

        return (
          <div>
            <button
              onClick={() => addSubProject(row.original.id)}
              className={"cus-count text-center ms-4 cursor-default"}>
              {sub_project_count}
            </button>
          </div>
        );
      },
    },

    // {
    //   accessorKey: "check_list",
    //   header: "Checklist",
    //   editable: false,
    //   enableSorting: false,
    //   cell: ({ cell, row }) => {
    //     return (
    //       <div>
    //         <button
    //           onClick={() => addCheckList(row.original.id)}
    //           className="cus-count text-center ms-4 "
    //         >
    //           {row.original.check_list || 0}
    //         </button>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "team_count",
      header: "Teams Count",
      editable: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <>
            {row.original.team_count !== 0 ? (
              <Link
                className='text-decoration-none'
                to={`/team-count/${row.original.id}`}
                state={{
                  rows: row.original.id,
                }}>
                <div className=' cus-count text-center ms-2 '>
                  {row.original.team_count}
                </div>
              </Link>
            ) : (
              <span className='text-muted ms-2 text-theme'>NA</span>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "client_name",
      header: "Client Name",
      editable: false,
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
              <span className='mute-font'>{row.original.created_by_email}</span>
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
          <div className='created-at-width'>
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
          overlay={<Tooltip className='text-cap'>View</Tooltip>}
          placement='bottom'>
          <button>
            <Link
              to='projectProfile'
              state={{ id: row.original.id }}
              className='btn-icon'>
              <FaRegEye size={20} className='bi-view' />
            </Link>
          </button>
        </OverlayTrigger>
      ),
    },

    {
      accessorKey: "expand",
      header: "Log",
      editable: false,
      enableSorting: false,
      showLog: true,
    },
  ];
  return columns;
};
export default ProjectColumns;
