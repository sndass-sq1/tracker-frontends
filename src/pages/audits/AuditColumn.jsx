import { useMemo, useState } from "react";
import ReactTable from "../../components/ReactTable";
import { Search } from "../../shared/Search";
import apiClient from "../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { changeTabTitle } from "../../utils/changeTabTitle";
import { ResetFilter } from "../../components/ResetFilter";
import AuditColumnsR from "./auditsClient-R/AuditColumnsR";
import ModalComp from "../../components/ModalComp";
import { FaMinusCircle, FaPlusCircle, FaUser } from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";
import getAuditColumnsList from "../audits/AuditColumnList";
import AuditColumnsAnthem from "./auditsAnthem/AuditColumnsAnthem";
import AuditsColumnsHumana from "./aduitsHumana/AuditsColumnsHumana";

const AuditColumns = () => {
  changeTabTitle("Audits");
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const anthemElevance = Number(import.meta.env.VITE_APP_ANTHEM_ELEVANCE);
  const humana = Number(import.meta.env.VITE_APP_HUMANA);
  const libertyProjectID = Number(import.meta.env.VITE_APP_LIBERTY);
  const prominenceProjectID = Number(import.meta.env.VITE_APP_PROMINENCE);
  const humanaWave2ProjectID = Number(import.meta.env.VITE_APP_HUMANA_WAVE_2);
  const [ShowAuditCommentModal, setShowAuditCommentModal] = useState(false);
  const [selectedAuditData, setSelectedAuditData] = useState(null);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [page, setPage] = useState(1);
  const [timelineFilter, setTimelineFilter] = useState("");
  const [perPage, setPerPage] = useState(10);

  const getAuditors = async () => {
    try {
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
      const response = await apiClient.get(`auditors/charts`, {
        params: { ...params },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getProjectID = async () => {
    const response = await apiClient.get("get-current-user-data");
    return response.data;
  };

  const { data: projectID, isLoading: projectIDLoading } = useQuery({
    queryKey: ["getProjectID"],
    queryFn: getProjectID,
    staleTime: 5 * 60 * 1000,
  });

  const { data: auditData, isLoading } = useQuery({
    queryKey: ["getAuditors", page, perPage, search, sortType, sortColumn],
    queryFn: projectID?.data?.this_project !== null && getAuditors,
    staleTime: 5 * 60 * 1000,
    enabled: !!projectID?.data,
  });
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

  const AuditComment = (id) => {
    setSelectedAuditData(id);
    setShowAuditCommentModal(true);
  };

  const tableColumns = useMemo(() => {
    if (Number(projectID?.data.this_project) == clientR) {
      return AuditColumnsR({ search, AuditComment });
    } else if (Number(projectID?.data.this_project) == anthemElevance) {
      return AuditColumnsAnthem({ search, AuditComment });
    } else if (projectID?.data?.this_project === selectedProjectID) {
      return AuditsColumnsHumana({ search, AuditComment });
    } else {
      return getAuditColumnsList({ search, AuditComment });
    }
  }, [search, projectID?.data, selectedProjectID]);

  if (projectIDLoading) {
    return <div></div>;
  }
  return (
    <div className="container-fluid ">
      {Number(Number(projectID?.data?.this_project)) == Number(clientR) ? (
        <>
          <div className="table-section mt-3 audit-table darkcard">
            <div className="tableparent px-3 pb-3">
              <div className="d-flex justify-content-between align-items-end flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng audit-header">
                <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
                  <div className="t-title">
                    <span>
                      {auditData?.pagination?.total > 1 ? "Audits" : "Audit"}
                    </span>
                    {auditData?.pagination?.total ? (
                      <>
                        <span className="cus-count ms-2">
                          {auditData?.pagination?.total}
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
              <div className="audit-body pt-1">
                <ReactTable
                  data={auditData}
                  columns={tableColumns}
                  apiEndPoint={"auditors/charts"}
                  queryKey={"getAuditors"}
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
                styleHeight="570px"
              >
                <div>
                  <div className="modal-header">
                    <h5 className="t-title">
                      Audit Feedback for Chart ID: {selectedAuditData?.chart_id}
                    </h5>

                    <button
                      type="button"
                      className="btn-close filtered-image"
                      onClick={() => setShowAuditCommentModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="font-size13 justify-content-between d-flex flex-wrap flex-md-wrap flex-sm-wrap gap-3 mb-3 ">
                      <span className="error-grp-btns  ">
                        <FaPlusCircle className="text-success mx-1" />
                        Added
                      </span>
                      <span className="error-grp-btns ">
                        <FaMinusCircle className="text-danger mx-1" />
                        Deleted
                      </span>
                      <span className="error-grp-btns ">
                        <FaArrowsRotate className="mx-1 text-warning" />
                        Updated
                      </span>
                      <span className="error-grp-btns ">
                        <FaUser className="mx-1 text-primary" />
                        Admin
                      </span>
                    </div>
                  </div>
                  <div className="audit-modal">
                    {selectedAuditData?.error_feedbacks?.length > 0 ? (
                      selectedAuditData.error_feedbacks.map(
                        (feedback, index) => (
                          <>
                            <div
                              key={index}
                              className="  font-size13 d-flex flex-column  justify-content-between flex-wrap flex-md-wrap flex-sm-wrap gap-3 py-3 px-1 "
                            >
                              <span className="error-grp fs-6  pointer mb-3">
                                {feedback.error_status === "added" ? (
                                  <FaPlusCircle className="text-success mx-1" />
                                ) : feedback.error_status === "deleted" ? (
                                  <FaMinusCircle className="text-danger mx-1" />
                                ) : feedback.error_status === "updated" ? (
                                  <FaArrowsRotate className="mx-1 text-warning" />
                                ) : feedback.error_status === "admin" ? (
                                  <FaUser className="mx-1 text-primary" />
                                ) : null}
                                <span className="fw-normal mx-1">
                                  {feedback.comments}
                                </span>
                              </span>
                              {/* <span className="text-secondary fw-light">
                            {feedback.comments}
                          </span> */}
                            </div>
                          </>
                        )
                      )
                    ) : (
                      <p>No feedback available.</p>
                    )}
                  </div>
                </div>
              </ModalComp>
            </div>
          </div>
        </>
      ) : projectID?.data?.this_project == anthemElevance ? (
        <>
          <div className="table-section darkcard mt-3 audit-table">
            <div className="tableparent  px-3 pt-3">
              <div className="d-flex justify-content-between align-items-end flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng audit-header">
                <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
                  <div className="t-title">
                    <span>
                      {auditData?.pagination?.total > 1 ? "Audits" : "Audit"}
                    </span>
                    {auditData?.pagination?.total ? (
                      <>
                        <span className="cus-count ms-2">
                          {auditData?.pagination?.total}
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
                      placeholder="Search chart Id"
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
              <div className="audit-body pt-1">
                <ReactTable
                  data={auditData}
                  columns={tableColumns}
                  apiEndPoint={"auditors/charts"}
                  queryKey={"getAuditors"}
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
                  tableHeight={"86%"}
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
                styleHeight="570px"
              >
                <div>
                  <div className="modal-header">
                    <h5 className="t-title">
                      Audit Feedback for Chart ID: {selectedAuditData?.chart_id}
                    </h5>

                    <button
                      type="button"
                      className="btn-close filtered-image"
                      onClick={() => setShowAuditCommentModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="font-size13 justify-content-between d-flex flex-wrap flex-md-wrap flex-sm-wrap gap-3 mb-3 ">
                      <span className="error-grp-btns ">
                        <FaPlusCircle className="text-success mx-1" />
                        Added
                      </span>
                      <span className="error-grp-btns">
                        <FaMinusCircle className="text-danger mx-1" />
                        Deleted
                      </span>
                      <span className="error-grp-btns">
                        <FaArrowsRotate className="mx-1 text-warning" />
                        Updated
                      </span>
                      <span className="error-grp-btns">
                        <FaUser className="mx-1 text-primary" />
                        Admin
                      </span>
                    </div>
                  </div>
                  <div className="audit-modal">
                    {selectedAuditData?.error_feedbacks?.length > 0 ? (
                      selectedAuditData.error_feedbacks.map(
                        (feedback, index) => (
                          <>
                            <div
                              key={index}
                              className="  font-size13 d-flex flex-column  justify-content-between flex-wrap flex-md-wrap flex-sm-wrap gap-3 py-3 px-1 "
                            >
                              <span className="error-grp fs-6  pointer mb-3">
                                {feedback.error_status === "added" ? (
                                  <FaPlusCircle className="text-success mx-1" />
                                ) : feedback.error_status === "deleted" ? (
                                  <FaMinusCircle className="text-danger mx-1" />
                                ) : feedback.error_status === "updated" ? (
                                  <FaArrowsRotate className="mx-1 text-warning" />
                                ) : feedback.error_status === "admin" ? (
                                  <FaUser className="mx-1 text-primary" />
                                ) : null}
                                <span className="fw-normal mx-1">
                                  {feedback.comments}
                                </span>
                              </span>
                            </div>
                          </>
                        )
                      )
                    ) : (
                      <p>No feedback available.</p>
                    )}
                  </div>
                </div>
              </ModalComp>
            </div>
          </div>
        </>
      ) : projectID?.data?.this_project == selectedProjectID ? (
        <>
          <div className="table-section darkcard mt-3 audit-table">
            <div className="tableparent  px-3 pt-3">
              <div className="d-flex justify-content-between align-items-end flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng audit-header">
                <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
                  <div className="t-title">
                    <span>
                      {auditData?.pagination?.total > 1 ? "Audits" : "Audit"}
                    </span>
                    {auditData?.pagination?.total ? (
                      <>
                        <span className="cus-count ms-2">
                          {auditData?.pagination?.total}
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
                      placeholder="Search chart Id"
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
              <div className="audit-body pt-1">
                <ReactTable
                  data={auditData}
                  columns={tableColumns}
                  apiEndPoint={"auditors/charts"}
                  queryKey={"getAuditors"}
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
                  tableHeight={"86%"}
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
                styleHeight="570px"
              >
                <div>
                  <div className="modal-header">
                    <h5 className="t-title">
                      Audit Feedback for Chart ID: {selectedAuditData?.chart_id}
                    </h5>

                    <button
                      type="button"
                      className="btn-close filtered-image"
                      onClick={() => setShowAuditCommentModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="font-size13 justify-content-between d-flex flex-wrap flex-md-wrap flex-sm-wrap gap-3 mb-3 ">
                      <span className="error-grp-btns ">
                        <FaPlusCircle className="text-success mx-1" />
                        Added
                      </span>
                      <span className="error-grp-btns">
                        <FaMinusCircle className="text-danger mx-1" />
                        Deleted
                      </span>
                      <span className="error-grp-btns">
                        <FaArrowsRotate className="mx-1 text-warning" />
                        Updated
                      </span>
                      <span className="error-grp-btns">
                        <FaUser className="mx-1 text-primary" />
                        Admin
                      </span>
                    </div>
                  </div>
                  <div className="audit-modal">
                    {selectedAuditData?.error_feedbacks?.length > 0 ? (
                      selectedAuditData.error_feedbacks.map(
                        (feedback, index) => (
                          <>
                            <div
                              key={index}
                              className="  font-size13 d-flex flex-column  justify-content-between flex-wrap flex-md-wrap flex-sm-wrap gap-3 py-3 px-1 "
                            >
                              <span className="error-grp fs-6  pointer mb-3">
                                {feedback.error_status === "added" ? (
                                  <FaPlusCircle className="text-success mx-1" />
                                ) : feedback.error_status === "deleted" ? (
                                  <FaMinusCircle className="text-danger mx-1" />
                                ) : feedback.error_status === "updated" ? (
                                  <FaArrowsRotate className="mx-1 text-warning" />
                                ) : feedback.error_status === "admin" ? (
                                  <FaUser className="mx-1 text-primary" />
                                ) : null}
                                <span className="fw-normal mx-1">
                                  {feedback.comments}
                                </span>
                              </span>
                            </div>
                          </>
                        )
                      )
                    ) : (
                      <p>No feedback available.</p>
                    )}
                  </div>
                </div>
              </ModalComp>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="table-section darkcard mt-3 audit-table">
            <div className="tableparent  px-3 pt-3">
              <div className="d-flex justify-content-between align-items-end flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng audit-header">
                <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
                  <div className="t-title">
                    <span>
                      {auditData?.pagination?.total > 1 ? "Audits" : "Audit"}
                    </span>
                    {auditData?.pagination?.total ? (
                      <>
                        <span className="cus-count ms-2">
                          {auditData?.pagination?.total}
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
                      placeholder="Search chart Id"
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
              <div className="audit-body pt-1">
                <ReactTable
                  data={auditData}
                  columns={tableColumns}
                  apiEndPoint={"auditors/charts"}
                  queryKey={"getAuditors"}
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
                  tableHeight={"86%"}
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
                styleHeight="570px"
              >
                <div>
                  <div className="modal-header">
                    <h5 className="t-title">
                      Audit Feedback for Chart ID: {selectedAuditData?.chart_id}
                    </h5>

                    <button
                      type="button"
                      className="btn-close filtered-image"
                      onClick={() => setShowAuditCommentModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="font-size13 justify-content-between d-flex flex-wrap flex-md-wrap flex-sm-wrap gap-3 mb-3 ">
                      <span className="error-grp-btns ">
                        <FaPlusCircle className="text-success mx-1" />
                        Added
                      </span>
                      <span className="error-grp-btns">
                        <FaMinusCircle className="text-danger mx-1" />
                        Deleted
                      </span>
                      <span className="error-grp-btns">
                        <FaArrowsRotate className="mx-1 text-warning" />
                        Updated
                      </span>
                      <span className="error-grp-btns">
                        <FaUser className="mx-1 text-primary" />
                        Admin
                      </span>
                    </div>
                  </div>
                  <div className="audit-modal">
                    {selectedAuditData?.error_feedbacks?.length > 0 ? (
                      selectedAuditData.error_feedbacks.map(
                        (feedback, index) => (
                          <>
                            <div
                              key={index}
                              className="  font-size13 d-flex flex-column  justify-content-between flex-wrap flex-md-wrap flex-sm-wrap gap-3 py-3 px-1 "
                            >
                              <span className="error-grp fs-6  pointer mb-3">
                                {feedback.error_status === "added" ? (
                                  <FaPlusCircle className="text-success mx-1" />
                                ) : feedback.error_status === "deleted" ? (
                                  <FaMinusCircle className="text-danger mx-1" />
                                ) : feedback.error_status === "updated" ? (
                                  <FaArrowsRotate className="mx-1 text-warning" />
                                ) : feedback.error_status === "admin" ? (
                                  <FaUser className="mx-1 text-primary" />
                                ) : null}
                                <span className="fw-normal mx-1">
                                  {feedback.comments}
                                </span>
                              </span>
                            </div>
                          </>
                        )
                      )
                    ) : (
                      <p>No feedback available.</p>
                    )}
                  </div>
                </div>
              </ModalComp>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default AuditColumns;
