import { useMemo, useState } from "react";
import apiClient from "../../../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import ReactTable from "../../../../components/ReactTable";
import Export from "../../../../components/Export";
import ModalComp from "../../../../components/ModalComp";
import AssignUser from "../../AssignUser";
import UnassignUser from "../../UnassignUser";
import FilterComponent from "../../../../components/FilterComponent";
import { ResetFilter } from "../../../../components/ResetFilter";
import { payloadFormatDate } from "../../../../utils/payloadDateFormat";
import { useAuth } from "../../../../context/AuthContext";
import RoleFilter from "../../../../components/RoleFilter";
import { useLocation } from "react-router";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useContext } from "react";
import { UserContext } from "../../../../UserContext/UserContext";
import { Search } from "../../../../shared/Search";

const TeamsTable = ({ apiEndPoint, queryKey, title, tableColumns }) => {
  const auth = useAuth();
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [timelineFilter, setTimelineFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [appliedTimelineFilter, setAppliedTimelineFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const [showAddCoderModal, setShowAddCoderModal] = useState(false);
  const [showRemoveCoderModal, setShowRemoveCoderModal] = useState(false);
  const [showAddAuditorModal, setShowAddAuditorModal] = useState(false);
  const [showRemoveAuditorModal, setShowRemoveAuditorModal] = useState(false);
  const [resetRoleFilter, setResetRoleFilter] = useState(false);
  const location = useLocation();
  const { manager_id } = location.state || {};
  const [filteredManagerId, setFilteredManagerId] = useState(
    manager_id || null
  );
  const { lead_id } = location.state || {};
  const [filteredLeadId, setFilteredLeadId] = useState(lead_id || null);
  const { project_head_id } = location.state || {};
  const [filteredProjectheadId, setFilteredProjectheadId] = useState(
    project_head_id || null
  );

  const addCoder = (id) => {
    setSelectedTeamId(id);
    setShowAddCoderModal(true);
  };

  const addAuditor = (id) => {
    setSelectedTeamId(id);
    setShowAddAuditorModal(true);
  };

  const removeCoder = (id) => {
    setSelectedTeamId(id);
    setShowRemoveCoderModal(true);
  };

  const removeAuditor = (id) => {
    setSelectedTeamId(id);
    setShowRemoveAuditorModal(true);
  };

  const getTeams = async () => {
    let params = {
      page: page,
      perPage: perPage,
      search: search,
      sortOrder: sortType,
      sortBy: sortColumn,
      ...(filteredManagerId && { manager_id: filteredManagerId }),
      ...(filteredLeadId && { lead_id: filteredLeadId }),
      ...(filteredProjectheadId && { project_head_id: filteredProjectheadId }),
    };
    if (filteredManagerId) params.manager_id = filteredManagerId;
    if (filteredLeadId) params.lead_id = filteredLeadId;
    if (filteredProjectheadId) params.project_head_id = filteredProjectheadId;

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

    const response = await apiClient.get(`${apiEndPoint}`, {
      params: { ...params },
    });
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
      manager_id,
      lead_id,
      project_head_id,
      appliedEndDate,
      filteredManagerId,
      filteredLeadId,
      filteredProjectheadId,
    ],
    queryFn: getTeams,
    staleTime: 5 * 60 * 1000,
  });

  const applyCustomFilter = (filter, start, end) => {
    setAppliedTimelineFilter(filter);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
    setPage(1); // reset pagination
  };

  const tableColumnsData = useMemo(
    () =>
      tableColumns({
        search,
        addCoder,
        addAuditor,
        removeCoder,
        removeAuditor,
      }),
    [search]
  );
  const closeAllModals = () => {
    setShowAddCoderModal(false);
    setShowRemoveCoderModal(false);
    setShowAddAuditorModal(false);
    setShowRemoveAuditorModal(false);
  };
  const { openTeamAccordion, setOpenTeamAccordion } = useContext(UserContext);

  return (
    <div className="table-section darkcard mt-3 team-table">
      <div className="tableparent px-3 pb-3 ">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 table-header-pdng team-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <div className="errorchart-head ms-2">
                <span>{data?.pagination?.total > 1 ? title + "s" : title}</span>
                {data?.pagination?.total ? (
                  <>
                    <span className="cus-count ms-2">
                      {data?.pagination?.total}
                    </span>
                  </>
                ) : null}
              </div>
              <div onClick={() => setOpenTeamAccordion(!openTeamAccordion)}>
                {openTeamAccordion ? (
                  <button
                    type="submit"
                    className="btn btn-primary custom-primary-btn font-size13 h-50 d-flex align-items-center  me-1"
                  >
                    <FaArrowUp />
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="team-btn font-size13 d-flex align-items-center"
                    >
                      Add Team
                      <FaArrowDown className="ms-2" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="d-flex gap-3 align-items-center">
              {(auth.user.role === "super_admin" ||
                auth.user.role === "project_head" ||
                auth.user.role === "manager") &&
                queryKey !== "getInactiveTeams" && (
                  <div>
                    <RoleFilter
                      setFilteredManagerId={setFilteredManagerId}
                      selectedManagerId={filteredManagerId}
                      queryKey={queryKey}
                      filteredManagerId={filteredManagerId}
                      setFilteredLeadId={setFilteredLeadId}
                      selectedLeadId={filteredLeadId}
                      filteredLeadId={filteredLeadId}
                      setFilteredProjectheadId={setFilteredProjectheadId}
                      selectedProjectheadId={filteredProjectheadId}
                      filteredProjectheadId={filteredProjectheadId}
                      resetTrigger={resetRoleFilter}
                    />
                  </div>
                )}

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
                setFilteredManagerId={setFilteredManagerId}
                filteredManagerId={filteredManagerId}
                setFilteredLeadId={setFilteredLeadId}
                filteredLeadId={filteredLeadId}
                setFilteredProjectheadId={setFilteredProjectheadId}
                filteredProjectheadId={filteredProjectheadId}
                onResetRoleFilter={() => setResetRoleFilter((prev) => !prev)}
              />
              {auth.user.role === "manager" ||
              (auth.user.role === "super_admin" &&
                queryKey !== "getInactiveTeams") ? (
                <Export
                  apiEndPoint={apiEndPoint}
                  exportApiEndPoint={`${apiEndPoint}/export`}
                  timelineFilter={appliedTimelineFilter}
                  startTime={appliedStartDate}
                  endTime={appliedEndDate}
                  search={search}
                  sortType={sortType}
                  sortColumn={sortColumn}
                  manager_id={filteredManagerId}
                  disabled={!data?.data || data?.data?.length === 0}
                  module={"teams"}
                />
              ) : (
                ""
              )}
            </div>
          </div>
        </div>

        <div className="team-body pt-1">
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
            // tableHeight={"86%"}
          />
        </div>
        {/* Modals */}
        <ModalComp
          isOpen={showAddCoderModal}
          onClose={() => setShowAddCoderModal(false)}
          showActions={false}
        >
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-3 ms-1 font-header">Add Coder </p>
            <button
              type="button"
              className="btn-close filtered-image"
              onClick={() => setShowAddCoderModal(false)}
            ></button>
          </div>
          <AssignUser
            memberType="coder"
            selectedTeamId={selectedTeamId}
            closeAllModals={closeAllModals}
          />
        </ModalComp>

        <ModalComp
          isOpen={showRemoveCoderModal}
          onClose={() => setShowRemoveCoderModal(false)}
          showActions={false}
        >
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-3 ms-3 font-header">Remove Coders</p>
            <button
              type="button"
              className="btn-close filtered-image"
              onClick={() => setShowRemoveCoderModal(false)}
            ></button>
          </div>
          <UnassignUser
            selectedTeamId={selectedTeamId}
            userType="coder"
            endpoint="coder"
            addendpoint="coders"
            fieldName="coder_id"
            label="Coder"
            closeAllModals={closeAllModals}
          />
        </ModalComp>

        <ModalComp
          isOpen={showAddAuditorModal}
          onClose={() => setShowAddAuditorModal(false)}
          showActions={false}
        >
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-3 ms-1 font-header">Add Auditor</p>
            <button
              type="button"
              className="btn-close filtered-image"
              onClick={() => setShowAddAuditorModal(false)}
            ></button>
          </div>
          <AssignUser
            memberType="auditor"
            selectedTeamId={selectedTeamId}
            closeAllModals={closeAllModals}
          />
        </ModalComp>

        <ModalComp
          isOpen={showRemoveAuditorModal}
          onClose={() => setShowRemoveAuditorModal(false)}
          showActions={false}
        >
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-3 ms-3 font-header">Remove Auditors</p>
            <button
              type="button"
              className="btn-close filtered-image"
              onClick={() => setShowRemoveAuditorModal(false)}
            ></button>
          </div>
          <UnassignUser
            selectedTeamId={selectedTeamId}
            userType="auditor"
            endpoint="auditor"
            addendpoint="auditors"
            fieldName="auditor_id"
            label="Auditor"
            closeAllModals={closeAllModals}
          />
        </ModalComp>
      </div>
    </div>
  );
};

export default TeamsTable;
