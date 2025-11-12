import { useMemo, useState } from "react";
import apiClient from "../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import ReactTable from "../../components/ReactTable";
import Export from "../../components/Export";
import { Search } from "../../shared/Search";
import FilterComponent from "../../components/FilterComponent";
import { ResetFilter } from "../../components/ResetFilter";
import ModalComp from "../../components/ModalComp";
import UserLogins from "./userLogins/UserLogins";
import { payloadFormatDate } from "../../utils/payloadDateFormat";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import RoleFilter from "../../components/RoleFilter";

const Userstable = ({ apiEndPoint, queryKey, title, tableColumns }) => {
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
  const [showAddLoginsModal, setShowAddLoginsModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleterow, setDeleteRow] = useState(null);
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const location = useLocation();
  const { role_id, location_id } = location.state || {};
  const [filteredRoleId, setFilteredRoleId] = useState(role_id || null);
  const [filteredLocationId, setFilteredLocationId] = useState(
    location_id || null
  );

  const addLogins = (id) => {
    setSelectedUserId(id);
    setShowAddLoginsModal(true);
  };

  const resetLogins = (row) => {
    setSelectedUserId(row.original.id);
    setDeleteRow(row.original);
    handleShowDeleteModal();
  };

  const getUsers = async () => {
    let params = {
      page: page,
      perPage: perPage,
      search: search,
      sortOrder: sortType,
      sortBy: sortColumn,
      ...(filteredRoleId && { role_id: filteredRoleId }),
      ...(filteredLocationId && { location_id: filteredLocationId }),
    };

    if (filteredRoleId) params.role_id = filteredRoleId;
    if (filteredLocationId) params.location_id = filteredLocationId;

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

    const response = await apiClient.get(`${apiEndPoint}`, { params });
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      `${queryKey}`,
      page,
      perPage,
      search,
      sortType,
      sortColumn,
      appliedTimelineFilter,
      appliedStartDate,
      appliedEndDate,
      role_id,
      location_id,
      filteredRoleId,
      filteredLocationId,
    ],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000,
  });

  const applyCustomFilter = (filter, start, end) => {
    setAppliedTimelineFilter(filter);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
    setPage(1);
  };

  const tableColumnsData = useMemo(
    () => tableColumns({ search, addLogins, resetLogins, queryKey }),
    [search]
  );

  const closeAllModals = () => {
    setShowAddLoginsModal(false);
  };

  return (
    <div className="table-section darkcard mt-3">
      <div className="tableparent px-3 pb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 table-header-pdng">
          <div className="errorchart-head ms-2">
            <span>{data?.pagination?.total > 1 ? title + "s" : title} </span>
            {data?.pagination?.total ? (
              <span className="cus-count ms-2">{data?.pagination?.total}</span>
            ) : null}
          </div>
          <div className="d-flex gap-3 align-items-center ">
            {queryKey !== "getUsers" &&
            !["getassignUsers", "getIdleUsers", "getArchivedUsers"].includes(
              queryKey
            ) ? (
              <>
                <Search
                  search={search}
                  setSearch={setSearch}
                  setPage={setPage}
                  placeholder="Search"
                />
              </>
            ) : (
              ""
            )}
            {queryKey?.startsWith("getUsers") &&
              auth.user.role !== "lead" &&
              auth.user.role !== "project_head" && (
                <RoleFilter
                  setFilteredRoleId={setFilteredRoleId}
                  setFilteredLocationId={setFilteredLocationId}
                  selectedRoleId={filteredRoleId} // <- important to pass
                  selectedLocationId={filteredLocationId}
                  queryKey={queryKey}
                />
              )}
            <div className="main-filter">
              <FilterComponent
                timelineFilter={timelineFilter}
                setTimelineFilter={setTimelineFilter}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                setPage={setPage}
                applyCustomFilter={applyCustomFilter}
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
              setFilteredRoleId={setFilteredRoleId}
              setFilteredLocationId={setFilteredLocationId}
              filteredRoleId={filteredRoleId}
              filteredLocationId={filteredLocationId}
            />

            {(auth.user.role === "super_admin" ||
              auth.user.role === "manager" ||
              auth.user.role === "sme") &&
              !["getassignUsers", "getIdleUsers", "getArchivedUsers"].includes(
                queryKey
              ) && (
                <Export
                  apiEndPoint={apiEndPoint}
                  exportApiEndPoint={`${apiEndPoint.replace(
                    /\?.*$/,
                    ""
                  )}/export${
                    apiEndPoint.includes("?")
                      ? apiEndPoint.slice(apiEndPoint.indexOf("?"))
                      : ""
                  }`}
                  timelineFilter={appliedTimelineFilter}
                  startTime={appliedStartDate}
                  endTime={appliedEndDate}
                  search={search}
                  sortType={sortType}
                  sortColumn={sortColumn}
                  disabled={!data?.data || data?.data?.length === 0}
                  module={"users"}
                  role_id={filteredRoleId}
                  location_id={filteredLocationId}
                />
              )}
          </div>
        </div>

        <div className="user-body pt-1">
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
          />
        </div>

        <ModalComp
          isOpen={showAddLoginsModal}
          onClose={() => setShowAddLoginsModal(false)}
          showActions={false}
          className="modal-lg"
          styleWidth="800px"
          styleHeight="200px"
        >
          <UserLogins
            selectedUserId={selectedUserId}
            closeAllModals={closeAllModals}
          />
        </ModalComp>

        <ModalComp
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          confirmLabel="Reset"
          cancelLabel="Cancel"
          postEndPoint={`logins/unassign/${selectedUserId}`}
          queryKey={queryKey}
        >
          <p className="logout-para  mt-3">Are you sure want to Reset?</p>
        </ModalComp>
      </div>
    </div>
  );
};

export default Userstable;
