import { useQuery } from "@tanstack/react-query";
import Export from "../../components/Export";
import ReactTable from "../../components/ReactTable";
import apiClient from "../../services/apiClient";
import AddGuideline from "./AddGuideline";
import GuideLineColumns from "./GuideLineColumns";
import { useMemo, useState } from "react";
import { changeTabTitle } from "../../utils/changeTabTitle";
import FilterComponent from "../../components/FilterComponent";
import { ResetFilter } from "../../components/ResetFilter";
import { payloadFormatDate } from "../../utils/payloadDateFormat";
import { useAuth } from "../../context/AuthContext";
import ModalComp from "../../components/ModalComp";
import { ucFirst } from "../../utils/ucFirst";
import { useLocation } from "react-router";

const GuideLines = () => {
  changeTabTitle("Guidelines");
  const auth = useAuth();
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [page, setPage] = useState(1);
  const [appliedTimelineFilter, setAppliedTimelineFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const [perPage, setPerPage] = useState(10);
  const [timelineFilter, setTimelineFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [ShowAuditCommentModal, setShowAuditCommentModal] = useState(false);
  const [selectedAuditData, setSelectedAuditData] = useState(null);
  const location = useLocation();
  const { project_id } = location.state || {};
  const [filteredProjectId, setFilteredProjectId] = useState(
    project_id || null
  );

  const getGuidelines = async () => {
    let params = {
      page: page,
      perPage: perPage,
      search: search,
      sortOrder: sortType,
      sortBy: sortColumn,
      ...(filteredProjectId && { project_id: filteredProjectId }),
    };
    if (filteredProjectId) params.project_id = filteredProjectId;
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

    const response = await apiClient("guidelines", { params: { ...params } });
    return response.data;
  };
  const AuditComment = (row) => {
    setSelectedAuditData(row);
    setShowAuditCommentModal(true);
  };

  const { data, isLoading } = useQuery({
    page,
    queryKey: [
      "getGuidelines",
      page,
      perPage,
      search,
      sortType,
      sortColumn,
      appliedTimelineFilter,
      appliedStartDate,
      appliedEndDate,
      project_id,
      filteredProjectId,
    ],
    queryFn: getGuidelines,
    staleTime: 5 * 60 * 1000,
  });

  const applyCustomFilter = (filter, start, end) => {
    setAppliedTimelineFilter(filter);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
    setPage(1); // reset pagination
  };

  let tableColumns = useMemo(
    () => GuideLineColumns({ search, AuditComment }),
    [search]
  );

  return (
    <div className="container-fluid overflow-y-auto">
      {auth.user.role === "super_admin" || auth.user.role === "sme" ? (
        <>
          <h5 className="t-title">Add GuideLine</h5>

          <AddGuideline />
        </>
      ) : (
        ""
      )}
      <div className="table-section darkcard mt-3 guide-container guide-table">
        <div className="tableparent px-3 pb-3 ">
          <div className="d-flex guide-header justify-content-between align-items-center flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng">
            <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
              <div className="errorchart-head ms-2">
                <span>
                  {data?.pagination?.total > 1 ? "GuideLines" : "GuideLine"}
                </span>
                {data?.pagination?.total ? (
                  <>
                    <span className="cus-count ms-2">
                      {data?.pagination?.total}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="d-flex gap-3 justify-end_md align-items-center right-flex-basic">
              {/* {auth.user.role === "super_admin" ||
              auth.user.role === "sme" ||
              auth.user.role === "manager" ||
              auth.user.role === "project_head" ? (
                <RoleFilter
                  setFilteredProjectId={setFilteredProjectId}
                  selectedProjectId={filteredProjectId}
                  queryKey={"getGuidelines"}
                  filteredProjectId={filteredProjectId}
                />
              ) : (
                ""
              )} */}
              <div className="main-filter">
                <FilterComponent
                  timelineFilter={timelineFilter}
                  setTimelineFilter={setTimelineFilter}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                  setPage={setPage}
                  endDate={endDate}
                  applyCustomFilter={applyCustomFilter}
                />
              </div>

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
                  setFilteredProjectId={setFilteredProjectId}
                  filteredProjectId={filteredProjectId}
                />
                {auth.user.role === "super_admin" ||
                auth.user.role === "manager" ||
                auth.user.role === "sme" ? (
                  <Export
                    apiEndPoint={"guidelines"}
                    exportApiEndPoint={"guidelines/export"}
                    timelineFilter={appliedTimelineFilter}
                    startTime={appliedStartDate}
                    endTime={appliedEndDate}
                    search={search}
                    sortType={sortType}
                    sortColumn={sortColumn}
                    disabled={!data?.data || data?.data?.length === 0}
                    module={"guidelines"}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
          <div className="guide-body pt-1">
            <ReactTable
              data={data}
              columns={tableColumns}
              apiEndPoint={"guidelines"}
              queryKey={"getGuidelines"}
              search={search}
              setSearch={setSearch}
              page={page}
              setPage={setPage}
              perPage={perPage}
              setPerPage={setPerPage}
              setSortType={setSortType}
              setSortColumn={setSortColumn}
              isLoading={isLoading}
              sortType={sortType}
              sortColumn={sortColumn}
              tableHeight={"88%"}
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
            {selectedAuditData?.description ? (
              <>
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom">
                  <p className="t-title mb-2">Comments</p>
                  <button
                    type="button"
                    className="btn-close filtered-image"
                    onClick={() => setShowAuditCommentModal(false)}
                  ></button>
                </div>
                <div className="audit-modal p-3">
                  {ucFirst(selectedAuditData.description)}
                </div>
              </>
            ) : (
              "NA"
            )}
          </ModalComp>
        </div>
      </div>
    </div>
  );
};

export default GuideLines;
