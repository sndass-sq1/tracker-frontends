import { useState, useMemo } from "react";
import apiClient from "../../services/apiClient";
import ReactTable from "../../components/ReactTable";
import { useQuery } from "@tanstack/react-query";
import SmeConflictColumns from "./SmeConflictColumns";
import FilterComponent from "../../components/FilterComponent";
import { payloadFormatDate } from "../../utils/payloadDateFormat";
import { ResetFilter } from "../../components/ResetFilter";
import RoleFilter from "../../components/RoleFilter";
import { useLocation } from "react-router";
import Export from "../../components/Export";
// import Export from "../../components/Export";

const ConflictPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [timelineFilter, setTimelineFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [appliedTimelineFilter, setAppliedTimelineFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const location = useLocation();
  const { project_id } = location.state || {};
  const [filteredAssignId, setFilteredAssignId] = useState(project_id || null);

  const smefeedbackItems = async () => {
    let params = {
      page: page,
      perPage: perPage,
      search: search,
      sortOrder: sortType,
      sortBy: sortColumn,
      ...(filteredAssignId && { project_id: filteredAssignId }),
    };
    if (filteredAssignId) params.project_id = filteredAssignId;
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
    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined ||
          params[key] === null ||
          params[key] === "") &&
        delete params[key]
    );
    const response = await apiClient.get(`feedback/list`, {
      params: { ...params },
    });
    return response.data;
  };

  const { data: feedbackData, isLoading } = useQuery({
    queryKey: [
      "smefeedbackItems",
      page,
      perPage,
      search,
      sortType,
      sortColumn,
      appliedTimelineFilter,
      appliedStartDate,
      appliedEndDate,
      project_id,
      filteredAssignId,
    ],
    queryFn: smefeedbackItems,
    staleTime: 5 * 60 * 1000,
  });

  const tableColumns = useMemo(() => {
    return SmeConflictColumns({ search });
  }, [search]);

  const applyCustomFilter = (filter, start, end) => {
    setAppliedTimelineFilter(filter);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
    setPage(1); // reset pagination
  };

  return (
    <div className="container-fluid">
      <div className="table-section darkcard mt-3 feedback-table">
        <div className="tableparent px-3 pt-3 ">
          <div className="d-flex justify-content-between align-items-center flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng ">
            <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
              <div className="errorchart-head">
                <span>
                  {feedbackData?.pagination?.total > 1
                    ? "Error Conflicts"
                    : "Error Conflict"}
                </span>
                {feedbackData?.pagination?.total ? (
                  <>
                    <span className="cus-count ms-2">
                      {feedbackData?.pagination?.total}
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="d-flex gap-3 justify-end_md align-items-center right-flex-basic">
              <div>
                <RoleFilter
                  setFilteredAssignId={setFilteredAssignId}
                  selectedAssignId={filteredAssignId}
                  queryKey={"smefeedbackItems"}
                  filteredAssignId={filteredAssignId}
                />
              </div>
              {/* <div className="main-filter">
                <FilterComponent
                  timelineFilter={timelineFilter}
                  setTimelineFilter={setTimelineFilter}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setPage={setPage}
                  setEndDate={setEndDate}
                  showCustomDatePicker={showCustomDatePicker}
                  setShowCustomDatePicker={setShowCustomDatePicker}
                  applyCustomFilter={applyCustomFilter}
                />
              </div> */}
              <div className="d-flex justify-content-between gap-3">
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
                  setFilteredAssignId={setFilteredAssignId}
                  filteredAssignId={filteredAssignId}
                />
              </div>
              <div className="d-flex justify-content-between gap-3">
                <Export
                  exportApiEndPoint={"sme-conflicts/export"}
                  timelineFilter={appliedTimelineFilter}
                  startTime={appliedStartDate}
                  endTime={appliedEndDate}
                  search={search}
                  sortType={sortType}
                  sortColumn={sortColumn}
                  project_id={filteredAssignId}
                  disabled={
                    !feedbackData?.data || feedbackData?.data?.length === 0
                  }
                  module={"smeDetails"}
                />
              </div>
            </div>
          </div>

          <div className="feedback-body pt-1">
            <ReactTable
              data={feedbackData}
              columns={tableColumns}
              apiEndPoint="feedback/list"
              queryKey="smefeedbackItems"
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
              tableHeight={"84%"}
            />
          </div>
        </div>
      </div>

      <div></div>
    </div>
  );
};

export default ConflictPage;
