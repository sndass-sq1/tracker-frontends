import { useQuery } from "@tanstack/react-query";
import Export from "../../components/Export";
import ReactTable from "../../components/ReactTable";
import { Search } from "../../shared/Search";
import { changeTabTitle } from "../../utils/changeTabTitle";
import AddLogin from "./AddLogin";
import LoginsColumns from "./LoginsColumns";
import { useMemo, useState } from "react";
import apiClient from "../../services/apiClient";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import ModalComp from "../../components/ModalComp";
import FilterComponent from "../../components/FilterComponent";
import { ResetFilter } from "../../components/ResetFilter";
import { FaUpload } from "react-icons/fa6";
import { Link } from "react-router";
import { payloadFormatDate } from "../../utils/payloadDateFormat";

const Logins = () => {
  changeTabTitle("Logins");
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showAddSubProjectModal, setShowAddSubProjectModal] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [appliedTimelineFilter, setAppliedTimelineFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const getLogins = async () => {
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
    const response = await apiClient("logins", { params: { ...params } });
    return response.data;
  };
  const { data, isLoading } = useQuery({
    queryKey: [
      "getLogins",
      page,
      perPage,
      search,
      sortType,
      sortColumn,
      appliedTimelineFilter,
      appliedStartDate,
      appliedEndDate,
    ],
    queryFn: getLogins,
    staleTime: 5 * 60 * 1000,
  });

  const applyCustomFilter = (filter, start, end) => {
    setAppliedTimelineFilter(filter);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
    setPage(1); // reset pagination
  };
  let tableColumns = useMemo(() => LoginsColumns({ search }), [search]);
  return (
    <div className="container-fluid overflow-y-auto">
      <div className="d-flex justify-content-between">
        <h5 className="t-title">Add Login</h5>
        <OverlayTrigger
          overlay={<Tooltip className="text-cap">Bulk Upload</Tooltip>}
          container={this}
          placement="bottom"
        >
          <Link to="/logins/bulkUpload" className="text-dark">
            <FaUpload className="fs-5 me-3 text-theme" />
          </Link>
        </OverlayTrigger>
      </div>
      <AddLogin />
      <div className="table-section darkcard  mt-3 logins-table">
        <div className="tableparent px-3 pb-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng logins-header">
            <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
              <div className="errorchart-head ms-2">
                <span>{data?.pagination?.total > 1 ? "Logins" : "Login"}</span>
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
              <div className="search-box">
                <Search
                  search={search}
                  setSearch={setSearch}
                  setPage={setPage}
                  placeholder="Search"
                />
              </div>
              <div>
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
                    // setDateRange={setDateRange}
                  />
                </div>
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
                />
                <Export
                  apiEndPoint={"logins"}
                  exportApiEndPoint={"logins/export"}
                  // timelineFilter={timelineFilter}
                  timelineFilter={appliedTimelineFilter}
                  startTime={appliedStartDate}
                  endTime={appliedEndDate}
                  search={search}
                  sortType={sortType}
                  sortColumn={sortColumn}
                  disabled={!data?.data || data?.data?.length === 0}
                  module={"logins"}
                />
              </div>
            </div>
          </div>
          <div className="logins-body pt-1">
            <ReactTable
              data={data}
              columns={tableColumns}
              apiEndPoint={"logins"}
              queryKey={"getLogins"}
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
              tableHeight={"88%"}
            />
          </div>
          <ModalComp
            isOpen={showAddSubProjectModal}
            onClose={() => setShowAddSubProjectModal(false)}
            showActions={false}
          >
            {/* <SubProject selectedProjectId={selectedProjectId} /> */}
          </ModalComp>
        </div>
      </div>
    </div>
  );
};

export default Logins;
