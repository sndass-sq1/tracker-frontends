import { useMemo, useState, useEffect } from "react";
import apiClient from "../../../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import ReactTable from "../../../../components/ReactTable";
import Export from "../../../../components/Export";
import FilterComponent from "../../../../components/FilterComponent";
import { ResetFilter } from "../../../../components/ResetFilter";
import { payloadFormatDate } from "../../../../utils/payloadDateFormat";
import CoderTeamSummaryR from "../tableColumns/CoderTeamSummaryR";
import AuditorTeamSummaryR from "../tableColumns/AuditorTeamSummaryR";
import { payloadFormatDateTime } from "../../../../utils/payloadFormatDateTime";
import ModalComp from "../../../../components/ModalComp";
import { ucFirst } from "../../../../utils/ucFirst";
import { FaMinusCircle, FaPlusCircle, FaUser } from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";

const ProductionTable = ({
  apiEndPoint,
  queryKey,
  title,
  tableColumns,
  exportApiEndPoint,
  onUserIdChange,
  onProjectIdChange,
  hourlyCoderExportApi,
  hourlyAuditorExportApi,
  module,
  coderName,
  auditorName,
  setCoustomheader,
  from,
  setThis_project,
}) => {
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [timelineFilter, setTimelineFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [appliedTimelineFilter, setAppliedTimelineFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [ShowAuditCommentModal, setShowAuditCommentModal] = useState(false);
  const [selectedAuditData, setSelectedAuditData] = useState(null);
  const [projectId, setProjectId] = useState(null);

  const getProduction = async () => {
    let params = {
      page: page,
      perPage: perPage,
      search: search,
      sortOrder: sortType,
      sortBy: sortColumn,
    };

    if (
      appliedTimelineFilter === "custom" &&
      appliedStartDate instanceof Date &&
      appliedEndDate instanceof Date
    ) {
      params.timeline = "custom";
      params["customDates[0]"] = payloadFormatDate(appliedStartDate);
      params["customDates[1]"] = payloadFormatDate(appliedEndDate);
    } else if (appliedTimelineFilter) {
      params.timeline = appliedTimelineFilter;
    }
    if (timelineFilter === "custom_date_with_time" && startTime && endTime) {
      params["customDates[0]"] = payloadFormatDateTime(startTime);
      params["customDates[1]"] = payloadFormatDateTime(endTime);
    }
    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined ||
          params[key] === null ||
          params[key] === "") &&
        delete params[key]
    );

    const response = await apiClient.get(`${apiEndPoint}`, {
      params: { ...params },
    });

    setProjectId(response.data?.this_project);
    return response.data;
  };
  const { data, isLoading } = useQuery({
    queryKey: [
      `${queryKey}`,
      apiEndPoint,
      page,
      perPage,
      search,
      sortType,
      sortColumn,
      appliedTimelineFilter,
      appliedStartDate,
      appliedEndDate,
    ],
    queryFn: getProduction,
    staleTime: 5 * 60 * 1000,
  });

  const applyCustomFilter = (filter, start, end) => {
    setAppliedTimelineFilter(filter);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
    setPage(1);
  };

  useEffect(() => {
    if (data?.data?.length > 0) {
      const userId = data.data[0].user_id;
      if (userId && onUserIdChange) {
        onUserIdChange(userId);
      }
    }

    if (data?.project_id && onProjectIdChange) {
      onProjectIdChange(data?.project_id);
    }

    setCoustomheader && setCoustomheader(data);
  }, [data, onUserIdChange, data?.project_id, data?.this_project, projectId]);

  // setThis_project(data?.this_project);
  useEffect(() => {
    if (data?.this_project && setThis_project) {
      setThis_project(data.this_project);
      setProjectId(data.this_project);
    }
  }, [data?.this_project]);

  const getLeadName = data?.data[0]?.lead_name;

  const AuditComment = (id) => {
    setSelectedAuditData(id);
    setShowAuditCommentModal(true);
  };
  const tableColumnsData = useMemo(() => {
    if (projectId == true) {
      if (module === "Coder team summary" || module === "Coder summary")
        return CoderTeamSummaryR({ search, AuditComment });
      if (module === "Auditor team summary" || module === "Auditor summary")
        return AuditorTeamSummaryR({ search, AuditComment });
    }

    return tableColumns({ search, AuditComment });
  }, [search, tableColumns, module, projectId]);

  return (
    <div className="table-section darkcard production-table">
      <div className="tableparent px-3 pb-3 ">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 table-header-pdng production-header ">
          <div className="errorchart-head">
            <span>
              {data?.pagination?.total > 1 ? title : title.slice(0, -1)}
            </span>
            {data?.pagination?.total ? (
              <>
                <span className="cus-count ms-2">
                  {data?.pagination?.total}
                </span>
              </>
            ) : null}
          </div>

          <div className="text-center mx-auto t-title">
            {/* {customLeadName?.data[0].lead_name} */}
            {getLeadName && (
              <div className="text-center mx-auto t-title">
                {
                  queryKey === "getCoderTab"
                    ? `Lead Name: ${data.data[0].lead_name || "NA"}`
                    : queryKey === "getAuditorTab" &&
                      `Lead Name: ${data.data[0].lead_name || "NA"}`
                  // : (coderName === "coderName" || auditorName === "auditorName")
                  // && `Lead Name: ${customLeadName?.data?.lead_name || "NA"}`
                }
              </div>
            )}
          </div>

          <div className="d-flex gap-3 align-items-center">
            {/* <Search
            search={search}
            setSearch={setSearch}
            setPage={setPage}
            placeholder="Search"
          /> */}
            {module === "production" && (
              <Export
                exportApiEndPoint={
                  apiEndPoint.includes("role=coder") ||
                  apiEndPoint.includes("coder-chart")
                    ? hourlyCoderExportApi
                    : hourlyAuditorExportApi
                }
                module={module}
                // timelineFilter={timelineFilter}
                // search={search}
                // sortType={sortType}
                // sortColumn={sortColumn}
                timelineFilter={appliedTimelineFilter}
                startTime={appliedStartDate}
                endTime={appliedEndDate}
                disabled={!data?.data || data?.data?.length === 0}
              />
            )}
            {module !== "production" ? (
              <>
                {/* <Search
                search={search}
                setSearch={setSearch}
                setPage={setPage}
                placeholder='Search'
              /> */}

                <div className="main-filter ">
                  <FilterComponent
                    from={from}
                    timelineFilter={timelineFilter}
                    setTimelineFilter={setTimelineFilter}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    applyCustomFilter={applyCustomFilter}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    setPage={setPage}
                  />
                </div>
                <ResetFilter
                  setTimelineFilter={setTimelineFilter}
                  setAppliedTimelineFilter={setAppliedTimelineFilter}
                  setAppliedStartDate={setAppliedStartDate}
                  setAppliedEndDate={setAppliedEndDate}
                  timelineFilter={timelineFilter}
                  appliedTimelineFilter={appliedTimelineFilter}
                  appliedStartDate={appliedStartDate}
                  appliedEndDate={appliedEndDate}
                  search={search}
                  setSearch={setSearch}
                  page={page}
                  setPage={setPage}
                  startTime={startTime}
                  endTime={endTime}
                  setStartTime={setStartTime}
                  setEndTime={setEndTime}
                />
                <Export
                  apiEndPoint={
                    apiEndPoint.includes("role=coder") ||
                    apiEndPoint.includes("coder-chart")
                      ? "coders"
                      : "auditors"
                  }
                  module={module}
                  exportApiEndPoint={exportApiEndPoint}
                  timelineFilter={appliedTimelineFilter}
                  startTime={appliedStartDate}
                  endTime={appliedEndDate}
                  search={search}
                  sortType={sortType}
                  sortColumn={sortColumn}
                  disabled={!data?.data || data?.data?.length === 0}
                />
                {/* <Link className="text-decoration-none" to={`/teams`}>
                  <button
                    className="btn btn-primary custom-primary-btn back-btn font-size13"
                    onClick={() => Navigate(`./ProductionTable.jsx`)}
                  >
                    <IoMdArrowRoundBack className="fs-5" />
                  </button>
                </Link> */}
              </>
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="production-body pt-1">
          <ReactTable
            data={data}
            columns={tableColumnsData}
            apiEndPoint={apiEndPoint}
            queryKey={queryKey}
            search={search}
            setSearch={setSearch}
            page={page}
            setPage={setPage}
            perPage={perPage}
            setPerPage={setPerPage}
            isLoading={isLoading}
            setSortType={setSortType}
            setSortColumn={setSortColumn}
            sortType={sortType}
            sortColumn={sortColumn}
            // tableHeight={tableHeight}
            tableHeight={"84%"}
          />
        </div>
        <ModalComp
          isOpen={ShowAuditCommentModal}
          onClose={() => {
            setShowAuditCommentModal(false);
            setSelectedAuditData(null);
          }}
          showActions={false}
          className="modal-lg"
          styleWidth="800px"
        >
          {!selectedAuditData?.comments
            ? selectedAuditData?.error_feedbacks?.length > 0
              ? selectedAuditData.error_feedbacks.map((feedback, index) => (
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
              : "NA"
            : selectedAuditData?.comments && (
                <>
                  <div className="d-flex justify-content-between align-items-center audit-modal-header border-bottom pb-2">
                    <p className="t-title mb-2">Comments</p>
                    <button
                      type="button"
                      className="btn-close filtered-image"
                      onClick={() => setShowAuditCommentModal(false)}
                    ></button>
                  </div>
                  <div className="audit-modal p-3">
                    {ucFirst(selectedAuditData.comments) || "NA"}
                  </div>
                </>
              )}

          {/* {selectedAuditData?.comments ? (
          <>
            <div className="modal-header">
              <p className="t-title">Comments</p>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAuditCommentModal(false)}
              ></button>
            </div>
            <div className="audit-modal p-3">
              {ucFirst(selectedAuditData.comments) || "NA"}
            </div>
          </>
        ) : (
          "NA"
        )} */}
        </ModalComp>
      </div>
    </div>
  );
};

export default ProductionTable;
