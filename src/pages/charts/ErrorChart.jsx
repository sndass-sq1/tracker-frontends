/** @format */

import { useEffect, useState } from "react";
import { FaMinusCircle, FaPlusCircle, FaUser } from "react-icons/fa";
import { LuFileChartColumnIncreasing } from "react-icons/lu";
import { FaArrowsRotate, FaClipboard } from "react-icons/fa6";
import {
  FaFolder,
  FaFolderOpen,
  FaClipboardList,
  FaUserEdit,
  FaUserCheck,
  FaUsers,
  FaUserLock,
  FaCalendarAlt,
  FaFileMedical,
  FaClipboardCheck,
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaBug,
  FaFileAlt,
  FaUserShield,
  FaProjectDiagram,
  FaTasks,
} from "react-icons/fa";
import { MdThumbUp, MdThumbDown } from "react-icons/md";

import { OverlayTrigger, Tooltip, Accordion } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import apiClient from "../../services/apiClient";
import { changeTabTitle } from "../../utils/changeTabTitle";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/formatDate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BsCassetteFill } from "react-icons/bs";
import { useFormik } from "formik";
import * as Yup from "yup";
import { MdOutlinePending } from "react-icons/md";
import PostPayloadDelete from "../guidelines/PostPayloadDelete";
import ModalComp from "../../components/ModalComp";

const ErrorChart = ({ title, data, eventKey, projectID, auth, setData }) => {
  const queryClient = useQueryClient();
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const [agreeId, setAgreeId] = useState(null);
  const [showAgreeModal, setShowAgreeModal] = useState(false);
  const [showDisagreeModal, setShowDisagreeModal] = useState(false);
  const [agreeType, setAgreeType] = useState("");

  const agreeModalFunc = (id, agreeType) => {
    setShowAgreeModal(true);
    setAgreeId(id);
    setAgreeType(agreeType);
  };

  const disagreeModalFunc = (id) => {
    setShowDisagreeModal(true);
    setAgreeId(id);
    setAgreeType("disagree");
  };

  return (
    <Accordion>
      <Accordion.Item
        eventKey={eventKey}
        className="error-chart-multi p-2 mt-3 darkcard border rounded"
      >
        <Accordion.Header className="p-3  border rounded d-flex align-items-center ">
          <div className="d-flex align-items-start">
            <LuFileChartColumnIncreasing className="me-2 error-icon text-theme" />
            <span className="errorchart-head">{title}</span>
          </div>

          <div className="d-flex align-items-end justify-content-end ms-percentage">
            {data?.error_feedback !== 0 && (
              <div className="non-cursor status-pending font-size13 py-1 px-4 d-flex align-items-center ">
                <MdOutlinePending className="guide-icon-pending" />
                Pending
              </div>
              //   <div className="non-cursor status-completed font-size13 py-1 px-4 d-flex align-items-center">
              //   <MdOutlinePending className="guide-icon-completed" />
              //   Completed
              // </div>
              // ) : (
            )}
          </div>
        </Accordion.Header>

        <Accordion.Body>
          <div className="mt-3 ">
            <div className="p-3 rounded-3 shadow-sm card mb-3 darkcard-project">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-2  ">
                <div className="d-flex align-items-center gap-2">
                  <FaProjectDiagram className="text-primary" />
                  <h6 className="mb-0 fw-semibold">
                    Project:&nbsp;
                    <span className="fw-normal">
                      {data.coder_chart?.project?.project_name || "NA"}
                    </span>
                  </h6>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <FaClipboardList className="text-success" />

                  <h6 className="mb-0 fw-semibold">
                    Project Type:&nbsp;
                    <span className="fw-normal">
                      {data?.coder_chart?.project_type || "NA"}
                    </span>
                  </h6>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FaTasks className="text-warning" />
                  <h6 className="mb-0 fw-semibold">
                    Subproject:&nbsp;
                    <span className="fw-normal">
                      {data?.auditor_chart?.coder_chart?.sub_project
                        ?.sub_project_name || "NA"}
                    </span>
                  </h6>
                </div>

                <div>
                  <OverlayTrigger
                    overlay={
                      <Tooltip className="text-cap">Coding Status</Tooltip>
                    }
                    placement="bottom"
                  >
                    <span className="error-grp fs-6">
                      {data?.coder_chart?.action === "Code Completed" ? (
                        <button className="status-completed py-1 border-0">
                          <BsCassetteFill className="text-success mx-1 fs-6" />
                          {data.coder_chart?.action}
                        </button>
                      ) : data?.coder_chart?.action === "Rejected" ? (
                        <button className="status-rejected d-flex py-1 width-btn">
                          <img
                            src="images/errorreject.svg"
                            alt="error reject"
                            className="w-25 me-1"
                          />
                          {data.coder_chart?.action}
                        </button>
                      ) : (
                        "NA"
                      )}
                    </span>
                  </OverlayTrigger>
                </div>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col mx-lg-auto">
                <div className="darkcard-project shadow-sm h-100 rounded-3 d-flex flex-row justify-content-between align-items-center p-3">
                  <div className="d-flex flex-column text-start">
                    <h5 className="fw-bold mb-0">
                      {data.auditor_chart?.coder_chart?.chart_id || "NA"}
                    </h5>
                    <small className="fw-semibold cardname-text">
                      {data.auditor_chart?.coder_chart?.chart_id?.length === 8
                        ? "Chase ID"
                        : "Chart ID"}
                    </small>
                  </div>
                  <FaClipboard className="text-secondary" size={32} />
                </div>
              </div>

              {auth.user.role === "auditor" || auth.user.role === "lead" ? (
                <>
                  {/* Coder Name */}
                  <div className="col mx-lg-auto">
                    <div className="darkcard-project shadow-sm h-100 rounded-3 d-flex flex-row justify-content-between align-items-center p-3">
                      <div className="d-flex flex-column text-start">
                        <h5 className="fw-bold mb-0">
                          {data?.auditor_chart?.coder_chart?.user?.name || "NA"}
                        </h5>
                        <small className="fw-semibold cardname-text">
                          Coder Name
                        </small>
                      </div>
                      <FaUserEdit className="text-secondary" size={32} />
                    </div>
                  </div>

                  <div className="col mx-lg-auto">
                    <div className="darkcard-project shadow-sm h-100 rounded-3 d-flex flex-row justify-content-between align-items-center p-3">
                      <div className="d-flex flex-column text-start">
                        <h5 className="fw-bold mb-0">
                          {data?.auditor_chart?.coder_chart?.coder_login_email
                            ?.login_name || "NA"}
                        </h5>
                        <small className="fw-semibold cardname-text">
                          Coder Login Name
                        </small>
                      </div>
                      <FaUserLock className="text-secondary" size={32} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="col mx-lg-auto">
                    <div className="darkcard-project shadow-sm h-100 rounded-3 d-flex flex-row justify-content-between align-items-center p-3">
                      <div className="d-flex flex-column text-start">
                        <h5 className="fw-bold mb-0">
                          {data?.auditor_chart?.user?.name || "NA"}
                        </h5>
                        <small className="fw-semibold cardname-text">
                          Auditor Name
                        </small>
                      </div>
                      <FaUserCheck className="text-secondary" size={32} />
                    </div>
                  </div>

                  <div className="col mx-lg-auto">
                    <div className="darkcard-project shadow-sm h-100 rounded-3 d-flex flex-row justify-content-between align-items-center p-3">
                      <div className="d-flex flex-column text-start">
                        <h5 className="fw-bold mb-0">
                          {data?.auditor_chart?.auditor_login_email
                            ?.login_name || "NA"}
                        </h5>
                        <small className="fw-semibold cardname-text">
                          Auditor Login Name
                        </small>
                      </div>
                      <FaUserLock className="text-secondary" size={32} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {projectID?.data.this_project == clientR ? (
              <>
                <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaFolderOpen className="text-secondary" />
                            <span className="fs-6">Sub Project</span>
                          </div>
                          <div className="fw-bold">
                            {data?.auditor_chart?.coder_chart?.sub_project
                              ?.sub_project_name || "NA"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaUsers className="text-secondary" />
                            <span className="fs-6">Member Name</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.coder_chart?.member_name ||
                              "NA"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarAlt className="text-secondary" />
                            <span className="fs-6">D.O.B</span>
                          </div>
                          <div className="fw-bold">
                            {/* {formatDate(data.auditor_char?.coder_chart?.dob) ||
                              "NA"} */}
                            {data.auditor_char?.coder_chart?.dob || "NA"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaFileMedical className="text-secondary" />
                            <span className="fs-6">
                              Total HCC Category Reviewed
                            </span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.coder_chart.pages || "NA"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaClipboardCheck className="text-secondary" />
                            <span className="fs-6">DX Level QA Score</span>
                          </div>
                          <div className="fw-bold">
                            {data.auditor_chart?.dx_qa_score || "NA"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarCheck className="text-secondary" />
                            <span className="fs-6">Coding Complete Date</span>
                          </div>
                          <div className="fw-bold">
                            {formatDate(
                              data.auditor_chart?.coding_complete_date
                            ) || "NA"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="row  mb-2 g-3 px-2">
                  <div className="darkcard-project shadow-sm rounded-3 p-3">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaClipboardCheck className="text-secondary" />
                              <span className="fs-6">Chart level QAScore</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.chart_qa_score ?? "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaTimesCircle className="text-secondary" />
                              <span className="fs-6">No of DX codes Error</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.dx_codes_error ?? "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaBug className="text-secondary" />
                              <span className="fs-6">No of Admin errors</span>
                            </div>
                            <div className="fw-bold text-dark">
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
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.original_code_found ?? "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaCheckCircle className="text-secondary" />
                              <span className="fs-6">DX Level QAScore</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.dx_qa_score ?? "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaBug className="text-secondary" />
                              <span className="fs-6">
                                Total Absolute Errors
                              </span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.total_errors ?? "NA"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="col-md-4">
                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaClipboardList className="text-secondary" />
                              <span className="fs-6">Codes Added</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.codes_added ?? "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaTimesCircle className="text-secondary" />
                              <span className="fs-6">Codes Deleted</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.codes_deleted ?? "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaCalendarAlt className="text-secondary" />
                              <span className="fs-6">DOS Corrected</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.dos_corrected ?? "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaFileAlt className="text-secondary" />
                              <span className="fs-6">
                                DX Level Comment Code Corrected
                              </span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart
                                ?.dx_level_comment_code_corrected ?? "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaUserCheck className="text-secondary" />
                              <span className="fs-6">
                                Rendering Provider Corrected
                              </span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart
                                ?.rendering_provider_corrected ?? "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaCalendarAlt className="text-secondary" />
                              <span className="fs-6">Audit Complete Date</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {/* {formatDate(
                                data.auditor_chart?.audit_complete_date || "NA"
                              )} */}
                              {data.auditor_chart?.audit_complete_date || "NA"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaCalendarAlt className="text-secondary" />
                              <span className="fs-6">D.O.B</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.coder_chart.dob || "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaFileAlt className="text-secondary" />
                              <span className="fs-6">Total ICD</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.coder_chart.icd || "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaFileAlt className="text-secondary" />
                              <span className="fs-6">Total Pages</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.coder_chart.pages || "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaUsers className="text-secondary" />
                              <span className="fs-6">Member Name</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.coder_chart?.member_name ||
                                "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaBug className="text-secondary" />
                              <span className="fs-6">POS Corrected</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.auditor_chart?.pos_corrected || "NA"}
                            </div>
                          </div>
                        </div>

                        <div className="darkcard-project shadow-sm rounded-3 p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <FaFileAlt className="text-secondary" />
                              <span className="fs-6">Total DOS</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {data.coder_chart?.dos || "NA"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="darkcard-project rounded-3 px-3">
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

              <div className="p-3 pb-0 mb-3 rounded-3 font-size13">
                {data.error_feedback?.map((feedback, index) => (
                  <div
                    key={index}
                    className="darkcard-project shadow-sm rounded-3 p-3 mb-3"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-center gap-2">
                        {feedback.error_status === "added" && (
                          <FaPlusCircle className="text-success" size={18} />
                        )}
                        {feedback.error_status === "deleted" && (
                          <FaMinusCircle className="text-danger" size={18} />
                        )}
                        {feedback.error_status === "updated" && (
                          <FaArrowsRotate className="text-warning" size={18} />
                        )}
                        {feedback.error_status === "admin" && (
                          <FaUserShield className="text-primary" size={18} />
                        )}
                        <span className="fw-bold">
                          {feedback.comments?.split("_").join(" ")}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      {(auth.user.role === "coder" ||
                        auth.user.role === "auditor") && (
                        <div className="d-flex gap-3 align-items-center">
                          <Button
                            variant="hover-list"
                            onClick={() => {
                              agreeModalFunc(feedback.id, "agree");
                            }}
                            className="custom-primary-btn agree-btn fs-6 btn btn-hover-list width-btn"
                          >
                            <MdThumbUp className="me-2 fs-5 mb-1" />
                            Agree
                          </Button>
                          <button
                            className="error-disagree disagree-btn fs-6 width-btn"
                            onClick={() => {
                              disagreeModalFunc(feedback.id);
                            }}
                          >
                            <MdThumbDown className="me-2 fs-5 mb-1" />
                            Disagree
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 ps-4">
                      {auth.user.role === "coder" ? (
                        <>
                          {feedback.coder_status && (
                            <p className="mb-1">
                              <span className="text-secondary">
                                Coder Status:
                              </span>{" "}
                              <span className="fw-bold">
                                {feedback.coder_status}
                              </span>
                            </p>
                          )}
                          {feedback.coder_status === "disagree" && (
                            <p className="mb-1">
                              <span className="text-secondary">
                                Coder Comment:
                              </span>{" "}
                              {feedback.coder_comment}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          {feedback.auditor_status && (
                            <p className="mb-1">
                              <span className="text-secondary">
                                Auditor Status:
                              </span>{" "}
                              <span className="fw-bold">
                                {feedback.auditor_status}
                              </span>
                            </p>
                          )}
                          {feedback.auditor_status === "disagree" && (
                            <p className="mb-1">
                              <span className="text-secondary">
                                Auditor Comment:
                              </span>{" "}
                              {feedback.auditor_comment}
                            </p>
                          )}
                        </>
                      )}
                    </div>
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
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};
const ErrorChartsPage = ({ feedbackData }) => {
  const auth = useAuth();
  changeTabTitle("Error Charts");

  const getProjectID = async () => {
    const response = await apiClient.get("get-current-user-data");
    return response.data;
  };

  const [data, setData] = useState(feedbackData?.data || []);

  useEffect(() => {
    if (feedbackData) {
      setData(feedbackData.data);
    }
  }, [feedbackData]);

  const { data: projectID } = useQuery({
    queryKey: ["getProjectID"],
    queryFn: getProjectID,
    staleTime: 5 * 60 * 1000,
  });
  const ErrorConflict = feedbackData?.data || [];

  const [activeKey, setActiveKey] = useState(null);

  const handleAccordionToggle = (key) => {
    setActiveKey(activeKey === key ? null : key);
  };

  return (
    <>
      {/* {(isLead || isCoderOrAuditor) && feedbackItems.length > 0 ? ( */}
      {ErrorConflict.length > 0 ? (
        <Accordion activeKey={activeKey} className="">
          {ErrorConflict.map((data, index) => (
            <ErrorChart
              key={index}
              eventKey={index.toString()}
              title={`Error Chart ${index + 1}`}
              data={data}
              projectID={projectID}
              feedbackData={feedbackData}
              auth={auth}
              maxFileSize={1048576}
              setData={setData}
              onClick={() => handleAccordionToggle(index.toString())}
            />
          ))}
        </Accordion>
      ) : (
        <>
          <div className=" view-hight d-flex flex-column justify-content-center align-items-center">
            <div
              className="container d-flex align-items-center justify-content-center flex-column vh-100 reg-container reg-font-weight"
              id="error-500"
            >
              {/* <div>
                <img
                  src="/images/sidebar/Conflicts.svg"
                  alt="error-conflict"
                  className="m-t-20 img-width"
                />
              </div> */}
              {/* <div>
                <img
                  className="m-t-20 img-width"
                  src="/images/error-image/asking-question.png"
                  alt="hotspot"
                />
              </div> */}
              {/* <div>
                <h3 className="m-t-10 pro1-logo">Webpage doesn’t exist</h3>
              </div> */}
              <div className="text-center primary-btn">
                <h6 className="m-t-20">There is no error chart</h6>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ErrorChartsPage;
