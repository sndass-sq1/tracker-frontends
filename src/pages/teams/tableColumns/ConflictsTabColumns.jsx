import { useMemo, useState } from "react";
import ReactTable from "../../../components/ReactTable";
import apiClient from "../../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import ModalComp from "../../../components/ModalComp";
import { FaMinusCircle, FaPlusCircle, FaUser } from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";
const ConflictsTabColumns = () => {
  const [Page, setPage] = useState(1);
  const [ShowConflictsCommentModal, setShowConflictsCommentModal] =
    useState(false);
  const [selectedConflictData, setSelectedConflictData] = useState(null);
  const getConflictsDataID = async () => {
    const response = await apiClient.get("get-current-user-data");
    return response.data;
  };

  const { data: conflictsData } = useQuery({
    queryKey: ["getConflictsDataID "],
    queryFn: getConflictsDataID,
    staleTime: 5 * 60 * 1000,
  });
  const columnsList = () => [
    {
      accessorKey: "ChartId",
      header: "ChartId",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Project Name",
      header: "Project Name",
      editable: true,
      enableSorting: true,
    },
    {
      accessorKey: "Coder Name",
      header: "Coder Name",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Coder Employee ID",
      header: "Coder Employee ID",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Coder Login Name",
      header: "Coder Login Name",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Coding Complete Date",
      header: "Coding Complete Date",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Auditor Name",
      header: "Auditor Name",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Audit Employee ID",
      header: "Audit Employee ID",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Auditor Login Name",
      header: "Auditor Login Name",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Audit Complete Date",
      header: "Audit Complete Date",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Chart Level QA Score",
      header: "Chart Level QA Score",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "No Of DX Codes Error",
      header: "No Of DX Codes Error",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Number Of Admin Errors",
      header: "Number Of Admin Errors",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Original Code Found",
      header: "Original Code Found",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "DX Level QA Score",
      header: "DX Level QA Score",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Total Absolute Error",
      header: "Total Absolute Error",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Codes Added",
      header: "Codes Added",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Codes Deleted",
      header: "Codes Deleted",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "DOS Corrected",
      header: "DOS Corrected",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "DX Level Comment Code Corrected",
      header: "DX Level Comment Code Corrected",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Rendering Provider Corrected",
      header: "Rendering Provider Corrected",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Number Of Admin Errors",
      header: "Number Of Admin Errors",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Member Name",
      header: "Member Name",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "DOB",
      header: "DOB",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Total ICD",
      header: "Total ICD",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Total Pages",
      header: "Total Pages",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Coding status",
      header: "Coding status",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "DX Codes Updated",
      header: "DX Codes Updated",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "POS Corrected",
      header: "POS Corrected",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Audit Type",
      header: "Audit Type",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "Audit Comment",
      header: "Audit Comment",
      editable: true,
      enableSorting: false,
    },
  ];
  let tableColumns = useMemo(() => columnsList(), [Page]);

  return (
    <div>
      <div className="table-section mt-3 ">
        <div className="d-flex justify-content-between align-items-end flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng">
          <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
            <div className="t-title">Conflicts</div>
          </div>
        </div>
        <ReactTable
          data={conflictsData}
          columns={tableColumns}
          Page={Page}
          setPage={setPage}
        />
        <ModalComp
          isOpen={ShowConflictsCommentModal}
          onClose={() => {
            setShowConflictsCommentModal(false);
            setSelectedConflictData(null);
          }}
          showActions={false}
          className="modal-lg"
          styleWidth="800px"
          styleHeight="570px"
        >
          <div>
            <div className="modal-header">
              <h5 className="t-title">
                Audit Feedback for Chart ID: {selectedConflictData?.chart_id}
              </h5>

              <button
                type="button"
                className="btn-close filtered-image"
                onClick={() => setShowConflictsCommentModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="font-size13 justify-content-between d-flex flex-wrap flex-md-wrap flex-sm-wrap gap-3 mb-3 ">
                <span className="error-grp-btns   pointer">
                  <FaPlusCircle className="text-success mx-1" />
                  Added
                </span>
                <span className="error-grp-btns  pointer">
                  <FaMinusCircle className="text-danger mx-1" />
                  Deleted
                </span>
                <span className="error-grp-btns  pointer">
                  <FaArrowsRotate className="mx-1 text-warning" />
                  Updated
                </span>
                <span className="error-grp-btns  pointer">
                  <FaUser className="mx-1 text-primary" />
                  Admin
                </span>
              </div>
            </div>
            <div className="audit-modal">
              {selectedConflictData?.error_feedbacks?.length > 0 ? (
                selectedConflictData.error_feedbacks.map((feedback, index) => (
                  <>
                    <div
                      key={index}
                      className="  font-size13 d-flex flex-column  justify-content-between flex-wrap flex-md-wrap flex-sm-wrap gap-3 py-3 px-1 "
                    >
                      <span className="error-grp fs-6  pointer mb-3">
                        {feedback.error_status === "added" ? (
                          <FaPlusCircle className="text-success mx-1" />
                        ) : feedback.error_status === "deleted" ? (
                          <FaMinusCircle className="text-danger mx-1" />
                        ) : feedback.error_status === "updated" ? (
                          <FaArrowsRotate className="mx-1 text-warning" />
                        ) : feedback.error_status === "admin" ? (
                          <FaUser className="mx-1 text-primary" />
                        ) : null}
                        <span className="fw-normal mx-1">
                          {feedback.comments}
                        </span>
                      </span>
                    </div>
                  </>
                ))
              ) : (
                <p>No feedback available.</p>
              )}
            </div>
          </div>
        </ModalComp>
      </div>
    </div>
  );
};

export default ConflictsTabColumns;
