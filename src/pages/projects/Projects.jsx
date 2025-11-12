import { useMemo, useState } from "react";
import apiClient from "../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import ReactTable from "../../components/ReactTable";
import ProjectColumns from "./ProjectColumns";
import { Search } from "../../shared/Search";
import AddProject from "./AddProject";
import Export from "../../components/Export";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { changeTabTitle } from "../../utils/changeTabTitle";
import ModalComp from "../../components/ModalComp";
import SubProject from "./subproject/SubProject";
import FilterComponent from "../../components/FilterComponent";
import { ResetFilter } from "../../components/ResetFilter";
import { Link } from "react-router";
import { FaUpload } from "react-icons/fa6";
import { payloadFormatDate } from "../../utils/payloadDateFormat";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Projects = () => {
  changeTabTitle("Projects");
  const auth = useAuth();

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showAddSubProjectModal, setShowAddSubProjectModal] = useState(false);
  const [showAddCheckListModal, setShowAddCheckListModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [timelineFilter, setTimelineFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [appliedTimelineFilter, setAppliedTimelineFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const addSubProject = (id) => {
    setSelectedProjectId(id);
    setShowAddSubProjectModal(true);
  };

  const addCheckList = (id) => {
    setSelectedProjectId(id);
    setShowAddCheckListModal(true);
  };
  const getProjects = async () => {
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

    const response = await apiClient("projects", { params: { ...params } });
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "getProjects",
      page,
      perPage,
      search,
      sortType,
      sortColumn,
      appliedTimelineFilter,
      appliedStartDate,
      appliedEndDate,
    ],
    queryFn: getProjects,
    staleTime: 5 * 60 * 1000,
  });

  const applyCustomFilter = (filter, start, end) => {
    setAppliedTimelineFilter(filter);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
    setPage(1); // reset pagination
  };

  let tableColumns = useMemo(
    () => ProjectColumns({ search, addSubProject, addCheckList }),
    [search, addSubProject]
  );

  return (
    <div className="container-fluid overflow-y-auto">
      <div className="d-flex justify-content-between">
        <h5 className="t-title">Add Project</h5>
        {auth.user.role === "super_admin" || auth.user.role === "manager" ? (
          <OverlayTrigger
            overlay={<Tooltip className="text-cap">Bulk Upload</Tooltip>}
            container={this}
            placement="bottom"
          >
            <Link to="/projects/bulkUpload" className="text-dark">
              <FaUpload className="fs-5 me-3 text-theme" />
            </Link>
          </OverlayTrigger>
        ) : (
          ""
        )}
      </div>
      <AddProject />

      <div className="table-section mt-3 darkcard project-table">
        <div className="tableparent px-3 pb-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng project-header">
            <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
              <div className="errorchart-head ms-2">
                <span>
                  {data?.pagination?.total > 1 ? "Projects" : "Project"}
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
                  apiEndPoint={"projects"}
                  exportApiEndPoint={"projects/export"}
                  // timelineFilter={timelineFilter}
                  timelineFilter={appliedTimelineFilter}
                  startTime={appliedStartDate}
                  endTime={appliedEndDate}
                  search={search}
                  sortType={sortType}
                  sortColumn={sortColumn}
                  disabled={!data?.data || data?.data?.length === 0}
                  module={"projects"}
                />
              </div>
            </div>
          </div>
          <div className="project-body pt-1">
            <ReactTable
              data={data}
              columns={tableColumns}
              apiEndPoint={"projects"}
              queryKey={"getProjects"}
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
            className="modal-lg"
            dialogClassName="modal-50wh"
          >
            {showAddSubProjectModal && (
              <SubProject
                selectedProjectId={selectedProjectId}
                showAddSubProjectModal={showAddSubProjectModal}
              />
            )}
          </ModalComp>

          <ModalComp
            isOpen={showAddCheckListModal}
            onClose={() => setShowAddCheckListModal(false)}
            showActions={false}
          >
            <SubProject
              selectedProjectId={selectedProjectId}
              showAddCheckListModal={showAddCheckListModal}
            />
          </ModalComp>
        </div>
      </div>
    </div>
  );
};

export default Projects;
