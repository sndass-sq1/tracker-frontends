/** @format */

import { useEffect, useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";
import { Link, useLocation } from "react-router";
import { formatDate } from "../../utils/formatDate";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ucFirst } from "../../utils/ucFirst";
import { useFormik } from "formik";
import * as Yup from "yup";
import Modal from "react-bootstrap/Modal";
import ModalComp from "../../components/ModalComp";
import PostPayloadDelete from "../guidelines/PostPayloadDelete";
import Truncate from "../../utils/Truncate";
import { IoMdArrowRoundBack } from "react-icons/io";
import {
  FaCheckCircle,
  FaClipboardList,
  FaExclamationTriangle,
  FaFileMedical,
  FaFileAlt,
  FaFolder,
  FaUserTie,
  FaUserCheck,
  FaCalendarAlt,
  FaBug,
  FaCode,
  FaClipboardCheck,
  FaUserMd,
  FaProjectDiagram,
  FaTasks,
  FaUsers,
  FaExclamationCircle,
  FaCalendarDay,
  FaCalendarCheck,
  FaCommentAlt,
  FaUserShield,
  FaFolderOpen,
  FaUserEdit,
  FaChartBar,
  FaUserCog,
  FaChartLine,
  FaBookOpen,
  FaEdit,
  FaCommentMedical,
  FaRegCalendarCheck,
  FaHospital,
} from "react-icons/fa";
const ConflictDetails = () => {
  const location = useLocation();
  const auth = useAuth();
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const anthemId = Number(import.meta.env.VITE_APP_ANTHEM_ELEVANCE);
  const details = location?.state?.row;
  const [data, setData] = useState("");
  const [agreeId, setAgreeId] = useState(null);
  const [showAgreeModal, setShowAgreeModal] = useState(false);
  const [showDisagreeModal, setShowDisagreeModal] = useState(false);
  const [agreeType, setAgreeType] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");

  const feedbackItems = async () => {
    let params = {
      page: page,
      perPage: perPage,
      search: search,
      sortOrder: sortType,
      sortBy: sortColumn,
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined ||
          params[key] === null ||
          params[key] === "") &&
        delete params[key]
    );
    const response = await apiClient.get(`feedback/list`, {
      params: { ...params },
    });
    return response.data;
  };

  const { data: feedbackData } = useQuery({
    queryKey: ["feedbackItems", page, perPage, search, sortType, sortColumn],
    queryFn: feedbackItems,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (feedbackData) {
      setData(feedbackData.data);
    }
  }, [feedbackData]);

  const getProjectID = async () => {
    const response = await apiClient.get("get-current-user-data");
    return response.data;
  };

  const { data: projectID } = useQuery({
    queryKey: ["getProjectID"],
    queryFn: getProjectID,
    staleTime: 5 * 60 * 1000,
  });

  const agreeModalFunc = (id, agreeType) => {
    setShowAgreeModal(true);
    setAgreeId(id);
    setAgreeType(agreeType);
  };

  const disagreeModalFunc = (id, agreeType) => {
    setShowDisagreeModal(true);
    setAgreeId(id);
    setAgreeType(agreeType);
  };

  {
    feedbackData?.data.map((data, index) => {
      return <div key={index}>{data.auditor_chart.id}</div>;
    });
  }

  const filteredData = feedbackData?.data.filter(
    (data) =>
      String(data?.auditor_chart?.id) ===
        String(details?.auditor_chart?.chart_id) ||
      String(data?.coder_chart?.id) === String(details?.coder_chart?.id)
  );
  return (
    <>
      <div className="container-fluid ">
        <div className=" d-flex justify-content-between align-items-center mt-2 mx-3 mb-2">
          <h4 className="fw-bold ">Error Chart</h4>
          <Link className="text-decoration-none" to={`/error-conflict`}>
            <OverlayTrigger
              overlay={<Tooltip className="text-cap">Back</Tooltip>}
              container={this}
              placement="left"
            >
              <button className="btn btn-primary custom-primary-btn back-btn font-size13 ">
                <IoMdArrowRoundBack className="fs-5" />
              </button>
            </OverlayTrigger>
          </Link>
        </div>
        {filteredData?.length === 0 ? (
          <div>No matching data found.</div>
        ) : (
          filteredData?.map((data, index) => (
            <div key={index}>
              {projectID?.data?.this_project == clientR ? (
                <div className="row px-3 my-2 g-3">
                  <div className="col-md-6">
                    <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaFolder className="text-secondary" />
                          <span className="fs-6">Project Name</span>
                        </div>
                        <div className="fw-bold">
                          {data?.coder_chart?.project?.project_name || "NA"}
                        </div>
                      </div>
                    </div>

                    <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaFolderOpen className="text-secondary" />
                          <span className="fs-6">Sub Project </span>
                        </div>
                        <div className="fw-bold">
                          <Truncate
                            text={
                              ucFirst(
                                data?.auditor_chart?.coder_chart?.sub_project
                                  ?.sub_project_name
                              ) || "NA"
                            }
                            maxLength={10}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaClipboardList className="text-secondary" />
                          <span className="fs-6">Project Type</span>
                        </div>
                        <div className="fw-bold">
                          {data?.coder_chart?.project_type || "NA"}
                        </div>
                      </div>
                    </div>

                    <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaUserEdit className="text-secondary" />
                          <span className="fs-6">Coder Name</span>
                        </div>
                        <div className="fw-bold">
                          {ucFirst(
                            data?.auditor_chart?.coder_chart?.user?.name
                          ) || "NA"}
                        </div>
                      </div>
                    </div>

                    <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaUserCheck className="text-secondary" />
                          <span className="fs-6">Auditor Name</span>
                        </div>
                        <div className="fw-bold">
                          {ucFirst(data?.auditor_chart?.user.name) || "NA"}
                        </div>
                      </div>
                    </div>

                    <div className="darkcard-project shadow-sm rounded-3 p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaUsers className="text-secondary" />
                          <span className="fs-6">Member Name</span>
                        </div>
                        <div className="fw-bold">
                          {ucFirst(
                            data?.auditor_chart?.coder_chart?.member_name
                          ) || "NA"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaTasks className="text-secondary" />
                          <span className="fs-6">Coding Status</span>
                        </div>
                        <div className="fw-bold">
                          {data?.auditor_chart?.coder_chart?.action ===
                          "code_completed"
                            ? "Completed"
                            : data?.auditor_chart?.coder_chart?.action
                                ?.split("_")
                                .join(" ") || "NA"}
                        </div>
                      </div>
                    </div>

                    <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaCalendarAlt className="text-secondary" />
                          <span className="fs-6">D.O.B</span>
                        </div>
                        <div className="fw-bold">
                          {data?.auditor_chart?.coder_chart?.dob || "NA"}
                        </div>
                      </div>
                    </div>

                    <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaBookOpen className="text-secondary" />
                          <span className="fs-6">
                            Total HCC Category Reviewed
                          </span>
                        </div>
                        <div className="fw-bold">
                          {data?.auditor_chart?.coder_chart?.pages || "NA"}
                        </div>
                      </div>
                    </div>

                    <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaChartLine className="text-secondary" />
                          <span className="fs-6">DX Level QAScore</span>
                        </div>
                        <div className="fw-bold">
                          {data?.auditor_chart?.dx_qa_score || "NA"}
                        </div>
                      </div>
                    </div>

                    <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaRegCalendarCheck className="text-secondary" />
                          <span className="fs-6">Coding Complete Date</span>
                        </div>
                        <div className="fw-bold">
                          {formatDate(
                            data?.auditor_chart?.coder_chart?.coding_at
                          ) || "NA"}
                        </div>
                      </div>
                    </div>

                    <div className="darkcard-project shadow-sm rounded-3 p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <FaRegCalendarCheck className="text-secondary" />
                          <span className="fs-6">Audit Complete Date</span>
                        </div>
                        <div className="fw-bold">
                          {formatDate(data?.auditor_chart?.coding_at) || "NA"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="darkcard-project shadow-sm rounded-3 p-3 w-10 mt-3">
                  {" "}
                  <div className="row px-3 my-2 g-2">
                    <div className="col-md-4">
                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaFolder className="text-secondary" />
                            <span className="fs-6">Project Name</span>
                          </div>
                          <div className="fw-bold">
                            {data?.coder_chart?.project?.project_name || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaFolderOpen className="text-secondary" />
                            <span className="fs-6">Sub project </span>
                          </div>
                          <div className="fw-bold">
                            <Truncate
                              text={
                                ucFirst(
                                  data?.auditor_chart?.coder_chart?.sub_project
                                    ?.sub_project_name
                                ) || "NA"
                              }
                              maxLength={30}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaClipboardList className="text-secondary" />
                            <span className="fs-6">Project Type</span>
                          </div>
                          <div className="fw-bold">
                            {data?.coder_chart?.project_type || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserEdit className="text-secondary" />
                            <span className="fs-6">Coder Name</span>
                          </div>
                          <div className="fw-bold">
                            {ucFirst(
                              data?.auditor_chart?.coder_chart?.user?.name
                            ) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserCheck className="text-secondary" />
                            <span className="fs-6">Auditor Name</span>
                          </div>
                          <div className="fw-bold">
                            {ucFirst(data?.auditor_chart?.user.name) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaUsers className="text-secondary" />
                            <span className="fs-6">Member Name</span>
                          </div>
                          <div className="fw-bold">
                            {ucFirst(
                              data.auditor_chart?.coder_chart.member_name
                            ) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaTasks className="text-secondary" />
                            <span className="fs-6">Coding Status</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.coder_chart.action ===
                            "code_completed"
                              ? "Completed"
                              : data.auditor_chart?.coder_chart.action
                                  ?.split("_")
                                  .join(" ")}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarAlt className="text-secondary" />
                            <span className="fs-6">D.O.B</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.coder_chart.dob || "NA"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaChartBar className="text-secondary" />
                            <span className="fs-6">Chart level QAScore</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.chart_qa_score ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaExclamationTriangle className="text-secondary" />
                            <span className="fs-6">No of DX codes Error</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.dx_codes_error ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserCog className="text-secondary" />
                            <span className="fs-6">No of Admin errors</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.admin_error ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaFileAlt className="text-secondary" />
                            <span className="fs-6">Original Codes Found</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.original_code_found ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaChartLine className="text-secondary" />
                            <span className="fs-6">DX Level QAScore</span>
                          </div>
                          <div className="fw-bold">
                            {Number(data.auditor_chart?.dx_qa_score).toFixed(
                              2
                            ) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaBug className="text-secondary" />
                            <span className="fs-6">Total Absolute Errors</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.total_errors ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaCode className="text-secondary" />
                            <span className="fs-6">Total ICD</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.coder_chart.icd || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaBookOpen className="text-secondary" />
                            <span className="fs-6">Total Pages</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.coder_chart.pages || "NA"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaPlusCircle className="text-secondary" />
                            <span className="fs-6">Codes Added</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.codes_added ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaMinusCircle className="text-secondary" />
                            <span className="fs-6">Codes Deleted</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.codes_deleted ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaEdit className="text-secondary" />
                            <span className="fs-6">DOS Corrected</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.dos_corrected ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaCommentMedical className="text-secondary" />
                            <span className="fs-6">
                              DX Level Comment Code Corrected
                            </span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart
                              ?.dx_level_comment_code_corrected ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserMd className="text-secondary" />
                            <span className="fs-6">
                              Rendering Provider Corrected
                            </span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.rendering_provider_corrected ??
                              "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaRegCalendarCheck className="text-secondary" />
                            <span className="fs-6">Audit Complete Date</span>
                          </div>
                          <div className="fw-bold">
                            {formatDate(data.auditor_chart?.coding_at || "NA")}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaHospital className="text-secondary" />
                            <span className="fs-6">POS Corrected</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.pos_corrected || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="darkcard-project shadow-sm rounded-3 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarDay className="text-secondary" />
                            <span className="fs-6">Total DOS</span>
                          </div>
                          <div className="fw-bold">
                            {data.coder_chart?.dos || "NA"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="px-3 darkcard-project shadow-sm rounded-3 mt-3">
                <div className="d-flex justify-content-between pb-2 align-items-center">
                  {projectID?.data.this_project !== clientR ? (
                    <>
                      <div className="d-flex fs-6 justify-content-between p-3">
                        <h4 className="fw-bold">Error Feedback</h4>
                      </div>

                      <div className="d-flex gap-2 flex-wrap">
                        <div className="d-flex align-items-center px-2 py-1 rounded border border-success">
                          <FaPlusCircle className="me-1 text-success" />
                          <strong className="text-success">Added</strong>
                        </div>

                        <div className="d-flex align-items-center px-2 py-1 rounded border border-danger">
                          <FaMinusCircle className="me-1 text-danger" />
                          <strong className="text-danger">Deleted</strong>
                        </div>

                        <div className="d-flex align-items-center px-2 py-1 rounded border border-warning">
                          <FaArrowsRotate className="me-1 text-warning" />
                          <strong className="text-warning">Updated</strong>
                        </div>

                        <div className="d-flex align-items-center px-2 py-1 rounded border border-primary">
                          <FaUserShield className="me-1 text-primary" />
                          <strong className="text-primary">Admin</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>

                <div
                  className="overflow-y-auto p-1"
                  style={{ maxHeight: "500px" }}
                >
                  {data.error_feedback?.map((feedback, index) => (
                    <div key={index} className="darkcard-project p-3 mb-3">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex mb-3">
                            <div className="fw-semibold flex-fill">
                              Chart ID :{" "}
                              <span>
                                {Number(
                                  data.auditor_chart?.coder_chart?.project_id
                                ) === Number(anthemId)
                                  ? data.auditor_chart?.coder_chart
                                      ?.chart_uid || "NA"
                                  : data.auditor_chart?.coder_chart?.chart_id ||
                                    "NA"}
                              </span>
                            </div>
                          </div>

                          <div className="d-flex mb-3">
                            <div className="fw-semibold">
                              {auth.user.role === "coder"
                                ? "Coder Status :"
                                : "Auditor Status :"}
                            </div>
                            <div className="d-flex align-items-center ms-2">
                              {auth.user.role === "coder"
                                ? feedback.coder_status &&
                                  (feedback.coder_status === "disagree" ? (
                                    <span className="status-sme">
                                      <img
                                        src="/images/ThumbsDown.svg"
                                        alt="DisAgree"
                                        className="me-1 disagree-icon disagree-icon-sme"
                                      />
                                      <span className="ms-1 mb-1 status-sme-text">
                                        {ucFirst(feedback.coder_status)}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="status-sme-agree">
                                      <img
                                        src="/images/ThumbsUp.svg"
                                        alt="Agree"
                                        className="me-1 agree-icon agree-icon-sme"
                                      />
                                      <span className="ms-1 mb-1 status-sme-text-agree">
                                        {ucFirst(feedback.coder_status)}
                                      </span>
                                    </span>
                                  ))
                                : feedback.auditor_status &&
                                  (feedback.auditor_status === "disagree" ? (
                                    <span className="status-sme">
                                      <img
                                        src="/images/ThumbsDown.svg"
                                        alt="DisAgree"
                                        className="me-1 disagree-icon disagree-icon-sme"
                                      />
                                      <span className="ms-1 mb-1 status-sme-text">
                                        {ucFirst(feedback.auditor_status)}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="status-sme-agree">
                                      <img
                                        src="/images/ThumbsUp.svg"
                                        alt="Agree"
                                        className="me-1 agree-icon agree-icon-sme"
                                      />
                                      <span className="ms-1 mb-1 status-sme-text-agree">
                                        {ucFirst(feedback.auditor_status)}
                                      </span>
                                    </span>
                                  ))}
                            </div>
                          </div>

                          <div className="d-flex align-items-center mb-2">
                            {feedback.error_status === "added" && (
                              <FaPlusCircle className="me-1 text-success mt-2" />
                            )}
                            {feedback.error_status === "deleted" && (
                              <FaMinusCircle className="me-1 text-danger mt-2" />
                            )}
                            {feedback.error_status === "updated" && (
                              <FaArrowsRotate className="me-1 text-warning mt-2" />
                            )}
                            {feedback.error_status === "admin" && (
                              <FaUserShield className="me-1 text-primary mt-2" />
                            )}
                            <span className="mt-2">{feedback.comments}</span>
                          </div>
                        </div>

                        <div className="col-md-6">
                          {(auth.user.role === "coder" &&
                            feedback.coder_status === "disagree") ||
                          (auth.user.role === "auditor" &&
                            feedback.auditor_status === "disagree") ||
                          feedback.coder_comment ||
                          feedback.auditor_comment ? (
                            <>
                              <div className="fw-semibold mb-2">
                                {auth.user.role === "coder"
                                  ? "Coder comment"
                                  : "Auditor comment"}
                              </div>
                              <div className="mb-2">
                                <textarea
                                  className="p-2 rounded-2 form-control-sme sme-comment"
                                  value={
                                    auth.user.role === "coder"
                                      ? feedback.coder_comment || "NA"
                                      : feedback.auditor_comment || "NA"
                                  }
                                  readOnly
                                  rows={5}
                                  style={{ resize: "none", height: "100px" }}
                                />
                              </div>
                            </>
                          ) : (
                            <div className="text-muted fst-italic">
                              No comments
                            </div>
                          )}
                        </div>
                      </div>

                      {((auth.user.role === "coder" &&
                        !["agree", "disagree"].includes(
                          feedback.coder_status
                        )) ||
                        (auth.user.role === "auditor" &&
                          !["agree", "disagree"].includes(
                            feedback.auditor_status
                          ))) && (
                        <div className="d-flex gap-2 justify-content-end mt-2">
                          <Button
                            variant="hover-list"
                            onClick={() => agreeModalFunc(feedback.id, "agree")}
                            className="custom-primary-btn agree-btn fs-6 btn btn-hover-list width-btn"
                          >
                            <img
                              src="/images/ThumbsUp.svg"
                              alt="Agree"
                              className="me-1 disagree-iconbutton"
                            />
                            Agree
                          </Button>
                          <button
                            className="error-disagree disagree-btn fs-6 width-btn "
                            onClick={() =>
                              disagreeModalFunc(feedback.id, "disagree")
                            }
                          >
                            <img
                              src="/images/ThumbsDown.svg"
                              alt="DisAgree"
                              className="me-1 mt-1 agree-iconbutton"
                            />
                            Disagree
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <ModalComp
                  isOpen={showAgreeModal}
                  onClose={() => setShowAgreeModal(false)}
                  showActions={false}
                >
                  <PostPayloadDelete
                    closeAllModals={setShowAgreeModal}
                    postEndPoint={`feedback/agree/${agreeId}`}
                    payloadKey={"evidences[]"}
                    queryKey={"feedbackItems"}
                    type={"file"}
                    agreeId={agreeId}
                    data={data}
                    setData={setData}
                    agreeType={agreeType}
                    projectName={projectID?.data.this_project}
                  />
                </ModalComp>

                <ModalComp
                  isOpen={showDisagreeModal}
                  onClose={() => setShowDisagreeModal(false)}
                  showActions={false}
                >
                  <PostPayloadDelete
                    closeAllModals={setShowDisagreeModal}
                    postEndPoint={`feedback/disagree/${agreeId}`}
                    payloadKey={"evidences[]"}
                    queryKey={"feedbackItems"}
                    type={"file"}
                    agreeId={agreeId}
                    data={data}
                    setData={setData}
                    agreeType={agreeType}
                    projectName={projectID?.data.this_project}
                  />
                </ModalComp>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
export default ConflictDetails;
