

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";
import CheckListColumns from "./CheckListColumns";
import AddCheckList from "./AddCheckList";
import { Search } from "../../../shared/Search";
import FilterComponent from "../../../components/FilterComponent";
import Export from "../../../components/Export";
import { changeTabTitle } from "../../../utils/changeTabTitle";
import ReactTable from "../../../components/ReactTable";
import { ResetFilter } from "../../../components/ResetFilter";
import { payloadFormatDate } from "../../../utils/payloadDateFormat";

const CheckList = ({ selectedProjectId, showAddCheckListModal }) => {
  changeTabTitle("Checklists");
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [activeTab, setActiveTab] = useState("Timeframe");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [timelineFilter, setTimelineFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [appliedTimelineFilter, setAppliedTimelineFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  // const [dateRange, setDateRange] = useState(null);

  const getCheckLists = async () => {
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
      `check-lists/index/${selectedProjectId}`,
      {
        params: { ...params },
      }
    );
    return response.data;
  };
  const { data, error, isError, isLoading } = useQuery({
    queryKey: [
      "getCheckLists",
      perPage,
      search,
      sortType,
      sortColumn,
      appliedTimelineFilter,
      appliedStartDate,
      appliedEndDate,
    ],
    queryFn: getCheckLists,
    staleTime: 5 * 60 * 1000,
  });

  const applyCustomFilter = (filter, start, end) => {
    setAppliedTimelineFilter(filter);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
    setPage(1); // reset pagination
  };

  let tableColumns = useMemo(() => CheckListColumns({ search }), [search]);

  return (
    <>
      <div className="container-fluid overflow-y-auto">
        <p className="font-header ms-2 mb-3">Add Checklist</p>
        <AddCheckList selectedProjectId={selectedProjectId} />
        <div className="table-section modal-scroll">
          <div className="d-flex justify-content-between align-items-end flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 ">
            <div className="d-flex gap-3 justify-end_md align-items-center right-flex-basic"></div>
          </div>
          <div className="d-flex gap-2 justify-end_md align-items-center right-flex-basic">
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
                setPage={setPage}
                endDate={endDate}
                applyCustomFilter={applyCustomFilter}
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
                apiEndPoint={"check-lists"}
                exportApiEndPoint={"check-lists/export"}
                // timelineFilter={timelineFilter}
                timelineFilter={appliedTimelineFilter}
                startTime={appliedStartDate}
                endTime={appliedEndDate}
                search={search}
                sortType={sortType}
                sortColumn={sortColumn}
                disabled={!data?.data || data?.data?.length === 0}
                module={"checklists"}
              />
            </div>
          </div>
          {data?.pagination?.total > 0 && (
            <ReactTable
              data={data}
              columns={tableColumns}
              apiEndPoint={`check-lists/${selectedProjectId}`}
              queryKey={"getCheckLists"}
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
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CheckList;
