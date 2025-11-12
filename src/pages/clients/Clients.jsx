import { useMemo, useState } from "react";
import apiClient from "../../services/apiClient";
import { changeTabTitle } from "../../utils/changeTabTitle";
import AddClient from "./AddClient";
import { useQuery } from "@tanstack/react-query";
import ReactTable from "../../components/ReactTable";
import ClientColumns from "./ClientColumns";
import { Search } from "../../shared/Search";
import Export from "../../components/Export";
import FilterComponent from "../../components/FilterComponent";
import { ResetFilter } from "../../components/ResetFilter";
import { FaUpload } from "react-icons/fa6";
import { Link } from "react-router";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { payloadFormatDate } from "../../utils/payloadDateFormat";
import { useAuth } from "../../context/AuthContext";

const Clients = () => {
  //   Change the title
  changeTabTitle("Clients");
  const auth = useAuth();
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
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  const getClients = async () => {
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
    const response = await apiClient.get(`clients`, {
      params: { ...params },
    });
    return response.data;
  };
  const { data, isLoading } = useQuery({
    queryKey: [
      "getClients",
      page,
      perPage,
      search,
      sortType,
      sortColumn,
      appliedTimelineFilter,
      appliedStartDate,
      appliedEndDate,
    ],
    queryFn: getClients,
    staleTime: 5 * 60 * 1000,
  });

  const applyCustomFilter = (filter, start, end) => {
    setAppliedTimelineFilter(filter);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
    setPage(1); // reset pagination
  };

  let tableColumns = useMemo(() => ClientColumns({ search }), [search]);

  return (
    <div className="container-fluid   overflow-y-auto">
      <div className="d-flex justify-content-between">
        <h5 className="t-title">Add Client</h5>
        {auth.user.role === "super_admin" || auth.user.role === "manager" ? (
          <OverlayTrigger
            overlay={<Tooltip className="text-cap">Bulk Upload</Tooltip>}
            container={this}
            placement="bottom"
          >
            <Link to="/clients/bulkUpload" className="text-dark">
              <FaUpload className="fs-5 me-3 text-theme" />
            </Link>
          </OverlayTrigger>
        ) : (
          ""
        )}
      </div>

      <AddClient />

      <div className="table-section darkcard mt-3 client-table ">
        <div className="tableparent px-3 pb-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng client-header ">
            <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
              <div className="errorchart-head ms-2">
                <span>
                  {data?.pagination?.total > 1 ? "Clients" : "Client"}
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
              <div className="search-box">
                <Search
                  search={search}
                  setSearch={setSearch}
                  setPage={setPage}
                  placeholder="Search"
                />
              </div>
              <div className="main-filter">
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
                  apiEndPoint={"clients"}
                  exportApiEndPoint={"clients/export"}
                  timelineFilter={appliedTimelineFilter}
                  startTime={appliedStartDate}
                  endTime={appliedEndDate}
                  search={search}
                  sortType={sortType}
                  sortColumn={sortColumn}
                  disabled={!data?.data || data?.data?.length === 0}
                  module="clients"
                />
              </div>
            </div>
          </div>
          <div className="client-body pt-1">
            <ReactTable
              data={data}
              columns={tableColumns}
              apiEndPoint="clients"
              queryKey="getClients"
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
        </div>
      </div>
    </div>
  );
};

export default Clients;
