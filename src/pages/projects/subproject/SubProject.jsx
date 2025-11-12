import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";
import SubProjectColumns from "./SubProjectColumns";
import AddSubProject from "./AddSubProject";
import { Search } from "../../../shared/Search";
import FilterComponent from "../../../components/FilterComponent";
import Export from "../../../components/Export";
import { changeTabTitle } from "../../../utils/changeTabTitle";
import ReactTable from "../../../components/ReactTable";
import { ResetFilter } from "../../../components/ResetFilter";
import { payloadFormatDate } from "../../../utils/payloadDateFormat";

const SubProject = ({ selectedProjectId }) => {
  changeTabTitle("Subprojects");
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [appliedTimelineFilter, setAppliedTimelineFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [timelineFilter, setTimelineFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const getSubProjects = async () => {
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
    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined ||
          params[key] === null ||
          params[key] === "") &&
        delete params[key]
    );
    const response = await apiClient.get(
      `sub-projects/index/${selectedProjectId}`,
      {
        params: { ...params },
      }
    );
    return response.data;
  };
  const { data, isLoading } = useQuery({
    queryKey: [
      "getSubProjects",
      selectedProjectId,
      page,
      perPage,
      search,
      sortType,
      sortColumn,
      // startDate,
      // endDate,
      appliedTimelineFilter,
      appliedStartDate,
      appliedEndDate,
    ],
    queryFn: getSubProjects,
    staleTime: 5 * 60 * 1000,
  });
  const applyCustomFilter = (filter, start, end) => {
    setAppliedTimelineFilter(filter);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
    setPage(1); // reset pagination
  };
  let tableColumns = useMemo(() => SubProjectColumns({ search }), [search]);
  return (
    <>
      <div className="p-1">
        <h5 className="t-title">Add Subproject</h5>
        <AddSubProject selectedProjectId={selectedProjectId} />
        <div className="table-section darkcard mt-3 sub-project-table">
          <div className="tableparent">
            <div className="d-flex justify-content-between align-items-end flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng sub-project-header">
              <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
                <div className="errorchart-head ms-4">
                  <span>
                    {data?.pagination?.total > 1 ? "Subprojects" : "Subproject"}
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
              <div className="d-flex gap-2 justify-content-end align-items-center right-flex-basic px-2 pt-1 ">
                <div className="search-box">
                  <Search
                    search={search}
                    setSearch={setSearch}
                    setPage={setPage}
                    placeholder="Search"
                  />
                </div>
                <div className="main-filter ">
                  <FilterComponent
                    timelineFilter={timelineFilter}
                    setTimelineFilter={setTimelineFilter}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    endDate={endDate}
                    setPage={setPage}
                    applyCustomFilter={applyCustomFilter}
                    // setDateRange={setDateRange}
                  />
                </div>
                <div className="d-flex justify-content-between gap-2">
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
                  />
                  <Export
                    apiEndPoint={`sub-projects/${selectedProjectId}`}
                    exportApiEndPoint={`sub-projects/export/${selectedProjectId}`}
                    timelineFilter={timelineFilter}
                    search={search}
                    sortType={sortType}
                    sortColumn={sortColumn}
                    disabled={!data?.data || data?.data?.length === 0}
                    module={"subprojects"}
                  />
                </div>
              </div>
            </div>
            <div className="sub-project-body modal-scroll overflow-x-hidden px-3 pb-3 ">
              <ReactTable
                data={data}
                columns={tableColumns}
                apiEndPoint={`sub-projects`}
                queryKey={"getSubProjects"}
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
                from="subproject"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubProject;
