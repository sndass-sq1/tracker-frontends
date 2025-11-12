import { useMemo, useState } from "react";
import ReactTable from "../../components/ReactTable";
import { Search } from "../../shared/Search";
import apiClient from "../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { changeTabTitle } from "../../utils/changeTabTitle";
import AddChart from "./AddChart";
import ChartColumns from "./ChartColumns";
import { ResetFilter } from "../../components/ResetFilter";
import ErrorCharts from "./ErrorChart";
import ChartColumnsR from "./clientR/ChartsColumnsR";
import AddClientR from "./clientR/AddClientR";
import ModalComp from "../../components/ModalComp";
import { ucFirst } from "../../utils/ucFirst";
import AddAnthem from "./anthem/AddAnthem";
import AddHumana from "./humana/AddHumana";
import ChartsColumnsAnthem from "./anthem/ChartsColumnsAnthem";
import HumanaColumns from "./humana/ChartsColumnsHumana";

const Charts = () => {
  changeTabTitle("Charts");
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const anthemElevance = Number(import.meta.env.VITE_APP_ANTHEM_ELEVANCE);
  const humana = Number(import.meta.env.VITE_APP_HUMANA);
  const libertyProjectID = Number(import.meta.env.VITE_APP_LIBERTY);
  const prominenceProjectID = Number(import.meta.env.VITE_APP_PROMINENCE);
  const humanaWave2ProjectID = Number(import.meta.env.VITE_APP_HUMANA_WAVE_2);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [page, setPage] = useState(1);
  const [timelineFilter, setTimelineFilter] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [ShowAuditCommentModal, setShowAuditCommentModal] = useState(false);
  const [selectedAuditData, setSelectedAuditData] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [project_id, setProject_id] = useState([]);

  const getCharts = async () => {
    let params = {
      page: page,
      perPage: perPage,
      search: search,
      sortOrder: sortType,
      sortBy: sortColumn,
      timeline: timelineFilter,
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined ||
          params[key] === null ||
          params[key] === "") &&
        delete params[key]
    );
    const response = await apiClient.get(`coders/charts`, {
      params: { ...params },
    });

    return response.data;
  };

  const getProjectID = async () => {
    const response = await apiClient.get("get-current-user-data");
    setProject_id(response.data.data);
    return response.data;
  };

  const { data: projectID, isLoading: projectIDLoading } = useQuery({
    queryKey: ["getProjectID"],
    queryFn: getProjectID,
    staleTime: 5 * 60 * 1000,
  });

  const { data: chartsData, isLoading } = useQuery({
    queryKey: ["getCharts", page, perPage, search, sortType, sortColumn],
    queryFn: projectID?.data?.team_id !== null && getCharts,
    // staleTime: 5 * 60 * 1000,
    enabled: !!projectID?.data,
  });

  const AuditComment = (id) => {
    setSelectedAuditData(id);
    setShowAuditCommentModal(true);
  };
  const project_name = projectID?.data?.this_project;
  let selectedProjectID = null;

  if (project_name === humana) {
    selectedProjectID = humana;
  } else if (project_name === libertyProjectID) {
    selectedProjectID = libertyProjectID;
  } else if (project_name === prominenceProjectID) {
    selectedProjectID = prominenceProjectID;
  } else if (project_name === humanaWave2ProjectID) {
    selectedProjectID = humanaWave2ProjectID;
  } else {
    selectedProjectID = "";
  }

  const tableColumns = useMemo(() => {
    if (Number(projectID?.data.this_project) == clientR) {
      return ChartColumnsR({ search, AuditComment, selectedProjectId });
    } else if (Number(projectID?.data.this_project) == anthemElevance) {
      return ChartsColumnsAnthem({ search, AuditComment, selectedProjectId });
    } else if (projectID?.data.this_project === selectedProjectID) {
      return HumanaColumns({ search, AuditComment, selectedProjectId });
    } else {
      return ChartColumns({ search, AuditComment });
    }
  }, [search, projectID?.data, selectedProjectId, selectedProjectID]);

  const getFeedback = async () => {
    const response = await apiClient.get("feedback");
    return response.data;
  };

  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ["getFeedback"],
    queryFn: getFeedback,
    staleTime: 5 * 60 * 1000,
    enabled: !!projectID?.data,
  });

  if (projectIDLoading || feedbackLoading) {
    return <div></div>;
  }

  return (
    <div className="container-fluid overflow-y-auto">
      {projectID?.data.mail_mapping === null ? (
        <div className="d-flex justify-content-center align-items-center access">
          <div className="access-head">
            <img
              src="./images/restrictedaccess.svg"
              className="access-image"
              alt="Restricted Access"
            />
            <p className="access-body1">
              The page you’re trying to access has restricted access,
            </p>
            <p className="m-t-20 access-body2">
              You are not assigned any mail!
            </p>
          </div>
        </div>
      ) : projectID?.data.team_id === null ? (
        <div className="d-flex justify-content-center align-items-center access">
          <div className="access-head">
            <img
              src="./images/restrictedaccess.svg"
              className="access-image"
              alt="Restricted Access"
            />
            <p className="access-body1">
              The page you’re trying to access has restricted access,
            </p>
            <p className="m-t-20 access-body2">
              You are not assigned any team! Contact your team lead or admin for
              access.
            </p>
          </div>
        </div>
      ) : Number(Number(projectID?.data?.this_project)) == Number(clientR) ? (
        feedbackData?.data?.length > 0 ? (
          <ErrorCharts feedbackData={feedbackData} projectID={projectID} />
        ) : (
          <>
            <div className="d-flex justify-content-between">
              <h5 className="t-title">Add Chart</h5>
            </div>
            <AddClientR project_id={project_id} />
            <div className="table-section mt-3 chartR-table darkcard">
              <div className="tableparent px-3 pb-3">
                <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 table-header-pdng chartR-header">
                  <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
                    <div className="t-title">
                      Charts
                      {chartsData?.pagination?.total ? (
                        <span className="cus-count ms-2">
                          {chartsData.pagination.total}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="d-flex gap-3 justify-end_md align-items-center right-flex-basic ">
                    <div className="search-box">
                      <Search
                        search={search}
                        setSearch={setSearch}
                        setPage={setPage}
                        placeholder="Search"
                      />
                    </div>
                    <div className="d-flex justify-content-between gap-3">
                      <ResetFilter
                        setTimelineFilter={setTimelineFilter}
                        timelineFilter={timelineFilter}
                        search={search}
                        setSearch={setSearch}
                        page={page}
                        setPage={setPage}
                      />
                    </div>
                  </div>
                </div>
                <div className="chartR-body pt-1">
                  <ReactTable
                    data={chartsData}
                    columns={tableColumns}
                    apiEndPoint="coders/charts"
                    queryKey="getCharts"
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
              {selectedAuditData?.comments ? (
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
                    {ucFirst(selectedAuditData?.comments)}
                  </div>
                </>
              ) : (
                "NA"
              )}
            </ModalComp>
          </>
        )
      ) : Number(projectID?.data?.this_project) == anthemElevance ? (
        feedbackData?.data?.length > 0 ? (
          <ErrorCharts feedbackData={feedbackData} projectID={projectID} />
        ) : (
          <>
            <div className="d-flex justify-content-between">
              <h5 className="t-title">Add Chart</h5>
            </div>
            <AddAnthem
              project_id={project_id}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
            />
            <div className="table-section mt-3 chart-table darkcard">
              <div className="tableparent px-3 pb-3">
                <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 table-header-pdng chart-header">
                  <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
                    <div className="t-title">
                      Charts
                      {chartsData?.pagination?.total ? (
                        <span className="cus-count ms-2">
                          {chartsData.pagination.total}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="d-flex gap-3 justify-end_md align-items-center right-flex-basic ">
                    <div className="search-box">
                      <Search
                        search={search}
                        setSearch={setSearch}
                        setPage={setPage}
                        placeholder="Search"
                      />
                    </div>
                    <div className="d-flex justify-content-between gap-3">
                      <ResetFilter
                        setTimelineFilter={setTimelineFilter}
                        timelineFilter={timelineFilter}
                        search={search}
                        setSearch={setSearch}
                        page={page}
                        setPage={setPage}
                      />
                    </div>
                  </div>
                </div>
                <div className="chart-body pt-1">
                  <ReactTable
                    data={chartsData}
                    columns={tableColumns}
                    apiEndPoint="coders/charts"
                    queryKey="getCharts"
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
                  isOpen={ShowAuditCommentModal}
                  onClose={() => {
                    setShowAuditCommentModal(false);
                    setSelectedAuditData(null);
                  }}
                  showActions={false}
                  className="modal-lg"
                  styleWidth="800px"
                >
                  {selectedAuditData?.comments ? (
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
                        {ucFirst(selectedAuditData?.comments)}
                      </div>
                    </>
                  ) : (
                    "NA"
                  )}
                </ModalComp>
              </div>
            </div>
          </>
        )
      ) : Number(projectID?.data?.this_project) == selectedProjectID ? (
        feedbackData?.data?.length > 0 ? (
          <ErrorCharts feedbackData={feedbackData} projectID={projectID} />
        ) : (
          <>
            <div className="d-flex justify-content-between">
              <h5 className="t-title">Add Chart</h5>
            </div>
            <AddHumana projectID={project_id} />
            <div className="table-section mt-3 chart-table darkcard">
              <div className="tableparent px-3 pb-3">
                <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 table-header-pdng chart-header">
                  <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
                    <div className="t-title">
                      Charts
                      {chartsData?.pagination?.total ? (
                        <span className="cus-count ms-2">
                          {chartsData.pagination.total}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="d-flex gap-3 justify-end_md align-items-center right-flex-basic ">
                    <div className="search-box">
                      <Search
                        search={search}
                        setSearch={setSearch}
                        setPage={setPage}
                        placeholder="Search"
                      />
                    </div>
                    <div className="d-flex justify-content-between gap-3">
                      <ResetFilter
                        setTimelineFilter={setTimelineFilter}
                        timelineFilter={timelineFilter}
                        search={search}
                        setSearch={setSearch}
                        page={page}
                        setPage={setPage}
                      />
                    </div>
                  </div>
                </div>
                <div className="chart-body pt-1">
                  <ReactTable
                    data={chartsData}
                    columns={tableColumns}
                    apiEndPoint="coders/charts"
                    queryKey="getCharts"
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
                  isOpen={ShowAuditCommentModal}
                  onClose={() => {
                    setShowAuditCommentModal(false);
                    setSelectedAuditData(null);
                  }}
                  showActions={false}
                  className="modal-lg"
                  styleWidth="800px"
                >
                  {selectedAuditData?.comments ? (
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
                        {ucFirst(selectedAuditData?.comments)}
                      </div>
                    </>
                  ) : (
                    "NA"
                  )}
                </ModalComp>
              </div>
            </div>
          </>
        )
      ) : feedbackData?.data?.length > 0 ? (
        <ErrorCharts feedbackData={feedbackData} projectID={projectID} />
      ) : (
        <>
          <div className="d-flex justify-content-between">
            <h5 className="t-title">Add Chart</h5>
          </div>
          <AddChart
            project_id={project_id}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />
          <div className="table-section mt-3 chart-table darkcard">
            <div className="tableparent px-3 pb-3">
              <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 table-header-pdng chart-header">
                <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
                  <div className="t-title">
                    Charts
                    {chartsData?.pagination?.total ? (
                      <span className="cus-count ms-2">
                        {chartsData.pagination.total}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="d-flex gap-3 justify-end_md align-items-center right-flex-basic ">
                  <div className="search-box">
                    <Search
                      search={search}
                      setSearch={setSearch}
                      setPage={setPage}
                      placeholder="Search"
                    />
                  </div>
                  <div className="d-flex justify-content-between gap-3">
                    <ResetFilter
                      setTimelineFilter={setTimelineFilter}
                      timelineFilter={timelineFilter}
                      search={search}
                      setSearch={setSearch}
                      page={page}
                      setPage={setPage}
                    />
                  </div>
                </div>
              </div>
              <div className="chart-body pt-1">
                <ReactTable
                  data={chartsData}
                  columns={tableColumns}
                  apiEndPoint="coders/charts"
                  queryKey="getCharts"
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
                isOpen={ShowAuditCommentModal}
                onClose={() => {
                  setShowAuditCommentModal(false);
                  setSelectedAuditData(null);
                }}
                showActions={false}
                className="modal-lg"
                styleWidth="800px"
              >
                {selectedAuditData?.comments ? (
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
                      {ucFirst(selectedAuditData?.comments)}
                    </div>
                  </>
                ) : (
                  "NA"
                )}
              </ModalComp>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Charts;
