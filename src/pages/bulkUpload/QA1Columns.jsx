import { ucFirst } from "../../utils/ucFirst";

const QA1Columns = () => {
    let columns = [
        {
            accessorKey: "chart_id",
            header: "Chart ID",
            editable: false,
            enableSorting: false,
        },

        {
            accessorKey: "coder_name",
            header: "Coder Name",
            editable: false,
            enableSorting: false,
            cell: ({ row }) => (
                <div>{ucFirst(row.original.coder_name) || "NA"}</div>
            ),
        },
        {
            accessorKey: "coder_employee_id",
            header: "Coder Employee ID",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "coder_login_name",
            header: "Coder Login Name",
            editable: false,
            enableSorting: false,
            cell: ({ row }) => {
                return (
                    <div>
                        <div>{ucFirst(row.original.coder_login_name) || "NA"}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "audit_complete_date",
            header: "Audit Complete Date",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "total_pages",
            header: "Total Pages",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "audit_comments",
            header: "Auditor Comments",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "audit_type",
            header: "Audit Type",
            editable: false,
            enableSorting: false,
            cell: ({ row }) => {
                return (
                    <div>
                        <div>{ucFirst(row.original.audit_type) || "NA"}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "chart_level_qa_score",
            header: "Chart Level QA Score",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "dx_level_qa_score",
            header: "DX Level QA Score",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "original_codes_found",
            header: "Original Codes Found",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "total_absolute_errors",
            header: "Total Absolute Errors",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "no_of_dx_codes_error",
            header: "DX Codes Errors",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "no_of_admin_errors",
            header: "Admin Errors",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "codes_added",
            header: "Codes Added",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "dx_codes_updated",
            header: "DX Codes Updated",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "dos_corrected",
            header: "DOS Corrected",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "pos_corrected",
            header: "POS Corrected",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "dx_level_comment_code_corrected",
            header: "DX Level Comment Code Corrected",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "rendering_provider_corrected",
            header: "Rendering Provider Corrected",
            editable: false,
            enableSorting: false,
        },
        {
            accessorKey: "coding_date",
            header: "Coding Date",
            editable: false,
            enableSorting: false,
        },

    ];
    return columns;
};
export default QA1Columns;
