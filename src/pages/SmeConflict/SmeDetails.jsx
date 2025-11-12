/** @format */

import { useEffect, useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";
import { Link, useLocation } from "react-router";
import { formatDate } from "../../utils/formatDate";
import apiClient from "../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { ucFirst } from "../../utils/ucFirst";
import Truncate from "../../utils/Truncate";
import { IoMdArrowRoundBack } from "react-icons/io";
import PostPayloadDelete from "../guidelines/PostPayloadDelete";
import ModalComp from "../../components/ModalComp";
import { IoInformationCircle } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { MdThumbUp } from "react-icons/md";
import { Card } from "react-bootstrap";
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
} from "react-icons/fa";

import {
  MdErrorOutline,
  MdOutlineAddBox,
  MdOutlineDelete,
  MdOutlineEventNote,
} from "react-icons/md";
import { AiOutlineFileDone } from "react-icons/ai";
const SmeDetails = () => {
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const clientRId = Number(import.meta.env.VITE_APP_CLIENTR);
  const anthemId = Number(import.meta.env.VITE_APP_ANTHEM_ELEVANCE);
  const location = useLocation();
  const details = location?.state?.row;
  const [smeComments, setSmeComments] = useState(false);
  const [smeCommentId, setSmeCommentId] = useState(null);
  const [data, setData] = useState("");
  const [showSmeModal, setShowSmeModal] = useState(false);
  const [feedbackId, setFeedbackId] = useState(null);
  const [agreeWith, setAgreeWith] = useState("");
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

  const smeModalFunc = (id, agreeWithType) => {
    setShowSmeModal(true);
    setFeedbackId(id);
    setAgreeWith(agreeWithType);
  };

  const filteredData = feedbackData?.data.filter(
    (data) =>
      String(data?.auditor_chart?.id) ===
        String(details?.auditor_chart?.chart_id) ||
      String(data?.coder_chart?.id) === String(details?.coder_chart?.id)
  );

  const handleComments = (id) => {
    setSmeComments(true);
    setSmeCommentId(id);
  };
  const [coderEvidance, setCoderEvidance] = useState([]);
  const [codermodalopen, setCodermodalOpen] = useState(false);
  const [getCoderEvidance, setGetCoderEvidance] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEvidance = (feedback) => {
    const evidenceList = feedback?.evidences || [];
    const extracted = evidenceList.map((e) => e.evidence);
    setCoderEvidance(extracted);
    setCodermodalOpen(true);
  };

  const auth = useAuth();
  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!auth?.token) {
          throw new Error("Authentication token not found");
        }

        if (!coderEvidance || coderEvidance.length === 0) {
          return;
        }
        const response = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}feedback/${coderEvidance[0]}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGetCoderEvidance(url);
      } catch (err) {
        setError(err.message || "No Image found in this view");
        console.error("Error fetching Image:", err);
      } finally {
        setLoading(false);
      }
    };

    if (codermodalopen && coderEvidance.length > 0) {
      fetchImage();
    }

    return () => {
      if (getCoderEvidance) {
        URL.revokeObjectURL(getCoderEvidance);
      }
    };
  }, [auth?.token, codermodalopen, coderEvidance]);

  return (
    <div className="container-fluid">
      <div className=" d-flex justify-content-between align-items-center mt-2  mb-2">
        <h4 className="fw-bold ">Error Chart</h4>
        <Link className="text-decoration-none" to={`/smeconflictpage`}>
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
      <div className="mt-3">
        {filteredData?.length === 0 ? (
          <div>No matching data found.</div>
        ) : (
          filteredData?.map((data, index) => (
            <>
              <div className="p-3 rounded-3 shadow-sm darkcard mb-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <FaProjectDiagram className="text-primary" />
                    <h6 className="mb-0 fw-semibold">
                      Project:&nbsp;
                      <span className="fw-normal">
                        {data?.coder_chart?.project.project_name || "NA"}
                      </span>
                    </h6>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <FaCalendarAlt className="text-success" />

                    <h6 className="mb-0 fw-semibold">
                      Audit Date:&nbsp;
                      <span className="fw-normal">
                        {/* {data?.auditor_chart
                      ? formatDate(data?.auditor_chart.audit_complete_date)
                      : "NA"} */}
                        {formatDate(data.auditor_chart?.coding_at || "NA")}
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
                        {data?.coder_chart?.sub_project.sub_project_name ||
                          "NA"}
                      </span>
                    </h6>
                    {/* <div className="status-completed d-flex align-items-center justify-content-center py-2 px-3 rounded-3">
                  <span className="status-indicator-completed me-2"></span>

                  <div>
                    {data?.auditor_chart?.coder_chart?.action ===
                    "code_completed"
                      ? "Completed"
                      : data?.auditor_chart?.coder_chart?.action
                          ?.split("_")
                          .join(" ") || "NA"}
                  </div>
                </div> */}
                  </div>

                  <div className="error-grp">
                    {data?.auditor_chart?.coder_chart?.action ===
                    "Code Completed" ? (
                      <div className="status-completed">
                        {ucFirst(data?.auditor_chart?.coder_chart?.action) ||
                          "NA"}
                      </div>
                    ) : data?.auditor_chart?.coder_chart?.action ===
                      "Rejected" ? (
                      <div className="status-rejected ">
                        {ucFirst(data?.auditor_chart?.coder_chart?.action) ||
                          "NA"}
                      </div>
                    ) : //  : data?.auditor_chart?.coder_chart?.action === "SAR" ? (
                    //   <div className="status-pending ">
                    //     {ucFirst(data?.auditor_chart?.coder_chart?.action) ||
                    //       "NA"}
                    //   </div>
                    // )
                    null}
                    <></>
                  </div>
                </div>
              </div>
              <div className="row g-3 ">
                <div className="col mx-lg-auto">
                  <div className="darkcard p-3 shadow-sm h-100 rounded-3 d-flex flex-row justify-content-between align-items-center">
                    <div className="d-flex flex-column text-start">
                      <h3 className="fw-bold mb-0">
                        {data?.auditor_chart?.dx_qa_score
                          ? Number(data.auditor_chart.dx_qa_score).toFixed(2)
                          : "NA"}
                      </h3>
                      <small className="fw-semibold cardname-text">
                        DX Level QA Score
                      </small>
                    </div>

                    <FaCheckCircle size={32} />
                  </div>
                </div>

                <div className="col mx-lg-auto">
                  <div className="darkcard p-3 shadow-sm h-100 rounded-3 d-flex flex-row justify-content-between align-items-center">
                    <div className="d-flex flex-column text-start">
                      <h3 className="fw-bold mb-0">
                        {data.auditor_chart?.chart_qa_score
                          ? Number(data.auditor_chart?.chart_qa_score).toFixed(
                              2
                            )
                          : "NA"}
                      </h3>
                      <small className="fw-semibold cardname-text">
                        Chart QA Score
                      </small>
                    </div>
                    <FaClipboardList size={32} />
                  </div>
                </div>

                <div className="col mx-lg-auto">
                  <div className="darkcard p-3 shadow-sm h-100 rounded-3 d-flex flex-row justify-content-between align-items-center">
                    <div className="d-flex flex-column text-start">
                      <h3 className="fw-bold mb-0">
                        {data?.auditor_chart?.total_errors || "NA"}
                      </h3>
                      <small className="fw-semibold cardname-text">
                        Total Errors
                      </small>
                    </div>
                    <FaExclamationTriangle size={32} />
                  </div>
                </div>

                <div className="col mx-lg-auto">
                  <div className="darkcard p-3 shadow-sm h-100 rounded-3 d-flex flex-row justify-content-between align-items-center">
                    <div className="d-flex flex-column text-start">
                      <h3 className="fw-bold mb-0">
                        {data?.coder_chart?.icd || "NA"}
                      </h3>
                      <small className="fw-semibold cardname-text">ICD</small>
                    </div>
                    <FaFileMedical size={32} />
                  </div>
                </div>

                <div className="col mx-lg-auto">
                  <div className="darkcard p-3 shadow-sm h-100 rounded-3 d-flex flex-row justify-content-between align-items-center">
                    <div className="d-flex flex-column text-start">
                      <h3 className="fw-bold mb-0">
                        {data?.coder_chart?.pages || "NA"}
                      </h3>
                      <small className="fw-semibold cardname-text">Pages</small>
                    </div>
                    <FaFileAlt size={32} />
                  </div>
                </div>
              </div>
              <div key={index}>
                {projectID?.data?.this_project == clientRId ? (
                  <div className="card shadow-sm rounded-3 p-3 mt-3">
                    <div className="row row-cols-1 row-cols-md-3 g-3">
                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaFolder size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Project Name
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data?.coder_chart?.project?.project_name || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaFolder size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Sub Project Name
                            </span>
                          </div>
                          <div className="fw-bold fs-6 ">
                            <Truncate
                              text={
                                data?.auditor_chart?.coder_chart?.sub_project
                                  ?.sub_project_name || "NA"
                              }
                              maxLength={20}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaFolder size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Project Type
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data?.coder_chart?.project_type || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserTie size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Coder Name
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {ucFirst(
                              data?.auditor_chart?.coder_chart?.user?.name
                            ) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserCheck size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Auditor Name
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {ucFirst(data?.auditor_chart?.user?.name) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaUsers size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Member Name
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {ucFirst(
                              data?.auditor_chart?.coder_chart?.member_name
                            ) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaClipboardCheck
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              Coding Status
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data?.auditor_chart?.coder_chart?.action ===
                            "code_completed"
                              ? "Completed"
                              : data?.auditor_chart?.coder_chart?.action
                                  ?.split("_")
                                  .join(" ") || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarAlt
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">D.O.B</span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data?.auditor_chart?.coder_chart?.dob || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaClipboardCheck
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              Total HCC Category Reviewed
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data?.auditor_chart?.coder_chart?.pages || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaExclamationCircle
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              DX Level QAScore
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data?.auditor_chart?.dx_qa_score || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarCheck
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              Coding Complete Date
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {formatDate(
                              data?.auditor_chart?.coder_chart?.coding_at
                            ) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarDay
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              Audit Complete Date
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {formatDate(data?.auditor_chart?.coding_at) || "NA"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : data.auditor_chart?.chart_uid ? (
                  <div className=" shadow-sm rounded-3 p-3 w-10 mt-3 darkcard-project">
                    <div className="row row-cols-1 row-cols-md-3 g-3">
                      {/* <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Project Name</div>
                        <div>
                          {data?.coder_chart?.project?.project_name || "NA"}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Sub project Name</div>
                        <div>
                          {data?.auditor_chart?.coder_chart?.sub_project
                            ?.sub_project_name || "NA"}
                        </div>
                      </div> */}

                      <div className="col ">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaFolder size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Project Type
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data?.auditor_chart?.coder_chart?.sub_project
                              ?.sub_project_name || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserTie size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Coder Name
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {ucFirst(
                              data?.auditor_chart?.coder_chart?.user?.name
                            ) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserCheck size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Auditor Name
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {ucFirst(data?.auditor_chart?.user.name) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaUsers size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Member Name
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {ucFirst(
                              data?.auditor_chart?.coder_chart?.member_name
                            ) || "NA"}
                          </div>
                        </div>
                      </div>
                      {/* <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Coding Status</div>
                        <div>

                          {data.auditor_chart?.coder_chart.action ===
                          "code_completed"
                            ? "Completed"
                            : data.auditor_chart?.coder_chart.action
                                ?.split("_")
                                .join(" ")}
                        </div>
                      </div> */}

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarAlt
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">D.O.B</span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.coder_chart.dob || "NA"}
                          </div>
                        </div>
                      </div>
                      {/* <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Chart level QAScore</div>
                        <div>{data.auditor_chart?.chart_qa_score ?? "NA"}</div>
                      </div> */}

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaExclamationCircle
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              No of DX Codes Error
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.dx_codes_error ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaExclamationTriangle
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              No of Admin Errors
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.admin_error ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCode size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Original Codes Found
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.original_code_found ?? "NA"}
                          </div>
                        </div>
                      </div>
                      {/* <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">DX Level QAScore</div>
                        <div>
                          {Number(data.auditor_chart?.dx_qa_score).toFixed(2) ||
                            "NA"}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Total Absolute Errors</div>
                        <div>{data.auditor_chart?.total_errors ?? "NA"}</div>
                      </div>
                      <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Total ICD</div>
                        <div>{data.auditor_chart?.coder_chart.icd || "NA"}</div>
                      </div>
                      <div className="d-flex justify-content-between p-3 ">
                        <div className="fs-6">Total Pages</div>
                        <div>
                          {data.auditor_chart?.coder_chart.pages || "NA"}
                        </div>
                      </div> */}
                      {/* POS Corrected */}
                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaClipboardCheck
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              POS Corrected
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.pos_corrected || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarDay
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              Total DOS
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.coder_chart?.dos || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaPlusCircle
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              Codes Added
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.codes_added ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaMinusCircle
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              Codes Deleted
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.codes_deleted ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarCheck
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              DOS Corrected
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.dos_corrected ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCommentAlt
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              DX Level Comment Code Corrected
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart
                              ?.dx_level_comment_code_corrected ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserMd size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Rendering Provider Corrected
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.rendering_provider_corrected ??
                              "NA"}
                          </div>
                        </div>
                      </div>
                      {/* <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Audit Complete Date</div>
                        <div>
                          {formatDate(data.auditor_chart?.coding_at || "NA")}
                        </div>
                      </div> */}
                    </div>
                  </div>
                ) : (
                  <div className="darkcard shadow-sm rounded-3 p-3 w-10 mt-3">
                    <div className="row row-cols-1 row-cols-md-3 g-3">
                      {/* <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Project Name</div>
                        <div>
                          {data?.coder_chart?.project?.project_name || "NA"}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Sub project Name</div>
                        <div>
                          {data?.auditor_chart?.coder_chart?.sub_project
                            ?.sub_project_name || "NA"}
                        </div>
                      </div> */}
                      {/* Project Type */}
                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaFolder size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Project Type
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data?.auditor_chart?.coder_chart?.sub_project
                              ?.sub_project_name || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserTie size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Coder Name
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {ucFirst(
                              data?.auditor_chart?.coder_chart?.user?.name
                            ) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserCheck size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Auditor Name
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {ucFirst(data?.auditor_chart?.user.name) || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaUsers size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Member Name
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {ucFirst(
                              data?.auditor_chart?.coder_chart?.member_name
                            ) || "NA"}
                          </div>
                        </div>
                      </div>
                      {/* <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Coding Status</div>
                        <div>

                          {data.auditor_chart?.coder_chart.action ===
                          "code_completed"
                            ? "Completed"
                            : data.auditor_chart?.coder_chart.action
                                ?.split("_")
                                .join(" ")}
                        </div>
                      </div> */}
                      {/* D.O.B */}
                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarAlt
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">D.O.B</span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.coder_chart.dob || "NA"}
                          </div>
                        </div>
                      </div>
                      {/* <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Chart level QAScore</div>
                        <div>{data.auditor_chart?.chart_qa_score ?? "NA"}</div>
                      </div> */}
                      {/* No of DX Codes Error */}
                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaExclamationCircle
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              No of DX Codes Error
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.dx_codes_error ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaExclamationTriangle
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              No of Admin Errors
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.admin_error ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCode size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Original Codes Found
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.original_code_found ?? "NA"}
                          </div>
                        </div>
                      </div>
                      {/* <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">DX Level QAScore</div>
                        <div>
                          {Number(data.auditor_chart?.dx_qa_score).toFixed(2) ||
                            "NA"}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Total Absolute Errors</div>
                        <div>{data.auditor_chart?.total_errors ?? "NA"}</div>
                      </div>
                      <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Total ICD</div>
                        <div>{data.auditor_chart?.coder_chart.icd || "NA"}</div>
                      </div>
                      <div className="d-flex justify-content-between p-3 ">
                        <div className="fs-6">Total Pages</div>
                        <div>
                          {data.auditor_chart?.coder_chart.pages || "NA"}
                        </div>
                      </div> */}
                      {/* POS Corrected */}
                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaClipboardCheck
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              POS Corrected
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.pos_corrected || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarDay
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              Total DOS
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.coder_chart?.dos || "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaPlusCircle
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              Codes Added
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.codes_added ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaMinusCircle
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              Codes Deleted
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.codes_deleted ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarCheck
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              DOS Corrected
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.dos_corrected ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaCommentAlt
                              size={24}
                              className="text-secondary"
                            />
                            <span className="cardname-text small">
                              DX Level Comment Code Corrected
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart
                              ?.dx_level_comment_code_corrected ?? "NA"}
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded darkcard-project">
                          <div className="d-flex align-items-center gap-2">
                            <FaUserMd size={24} className="text-secondary" />
                            <span className="cardname-text small">
                              Rendering Provider Corrected
                            </span>
                          </div>
                          <div className="fw-bold fs-6">
                            {data.auditor_chart?.rendering_provider_corrected ??
                              "NA"}
                          </div>
                        </div>
                      </div>
                      {/* <div className="d-flex justify-content-between p-3 border-bottom">
                        <div className="fs-6">Audit Complete Date</div>
                        <div>
                          {formatDate(data.auditor_chart?.coding_at || "NA")}
                        </div>
                      </div> */}
                    </div>
                  </div>
                )}

                <div className="px-3 darkcard-project shadow-sm rounded-3 mt-3">
                  <div className="d-flex justify-content-between pb-2 align-items-center">
                    {data.auditor_chart?.coder_chart.project_id !==
                    clientRId ? (
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
                    ) : data.auditor_chart?.chart_uid ? (
                      "anthem"
                    ) : (
                      ""
                    )}
                  </div>

                  <div>
                    {data.error_feedback?.map((feedback, index) => (
                      <div
                        key={index}
                        className="darkcard-project rounded-3 p-3 mb-3"
                      >
                        <div className="row">
                          <div className="col-md-4 border-end">
                            <div className="fw-semibold mb-2">
                              Chart ID:{" "}
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

                            <div className="d-flex mb-2">
                              <div className="fw-semibold">
                                Auditor Status :
                              </div>
                              <div className="d-flex align-items-center ms-2">
                                <img
                                  src="/images/ThumbsDown.svg"
                                  alt="DisAgree"
                                  className="me-1 mt-1 disagree-icon-sme"
                                />
                                <span className="ms-1">
                                  {ucFirst(feedback.auditor_status)}
                                </span>
                              </div>
                            </div>
                            <div className="d-flex mb-2">
                              <div className="fw-semibold">Coder Status :</div>
                              <div className="d-flex align-items-center ms-2">
                                <img
                                  src="/images/ThumbsDown.svg"
                                  alt="DisAgree"
                                  className="me-1 mt-1 disagree-icon-sme"
                                />
                                <span className="ms-1">
                                  {ucFirst(feedback.coder_status)}
                                </span>
                              </div>
                            </div>
                            {projectID?.data?.this_project !== clientR && (
                              <div
                                className="fw-semibold mb-2"
                                onClick={() => handleEvidance(feedback)}
                              >
                                Evidence :
                                <span className="evidence-box ms-2">
                                  <img
                                    src="/images/evidence.svg"
                                    alt="Evidence"
                                    className="evidence-icon"
                                  />
                                </span>
                              </div>
                            )}

                            {feedback.sme_status && (
                              <div
                                onClick={() => handleComments(feedback.id)}
                                className="fw-semibold mb-2"
                              >
                                SME Comments :
                                <span className=" ms-2">
                                  <img
                                    src="/images/comment.svg"
                                    alt="Comment"
                                    className="comment-icon"
                                  />
                                </span>
                              </div>
                            )}

                            <div className="d-flex align-items-center mt-3">
                              {feedback.error_status === "added" && (
                                <FaPlusCircle
                                  className="me-1 text-success"
                                  size={20}
                                />
                              )}
                              {feedback.error_status === "deleted" && (
                                <FaMinusCircle
                                  className="me-1 text-danger"
                                  size={20}
                                />
                              )}
                              {feedback.error_status === "updated" && (
                                <FaArrowsRotate
                                  className="me-1 text-warning"
                                  size={20}
                                />
                              )}
                              {feedback.error_status === "admin" && (
                                <FaUserShield
                                  className="me-1 text-primary"
                                  size={20}
                                />
                              )}
                              <span>{feedback.comments}</span>
                            </div>
                          </div>

                          <div className="col-md-8">
                            {(feedback.auditor_status === "disagree" ||
                              feedback.auditor_comment) && (
                              <div className="mb-3">
                                <div className="fw-semibold mb-1">
                                  Auditor Comment
                                </div>
                                <textarea
                                  className="p-2 rounded-2 form-control-sme sme-comment"
                                  value={feedback.auditor_comment || "NA"}
                                  readOnly
                                  rows={3}
                                />
                              </div>
                            )}

                            {(feedback.coder_status === "disagree" ||
                              feedback.coder_comment) && (
                              <div className="mb-3">
                                <div className="fw-semibold mb-1">
                                  Coder Comment
                                </div>
                                <textarea
                                  className="p-2 rounded-2 form-control-sme sme-comment"
                                  value={feedback.coder_comment || "NA"}
                                  readOnly
                                  rows={3}
                                />
                              </div>
                            )}

                            <div className="d-flex justify-content-between align-items-start mt-3">
                              <div className="d-flex gap-3 align-items-center">
                                <Button
                                  variant="hover-list"
                                  disabled={
                                    feedback.sme_status ===
                                      "agree_with_auditor" ||
                                    feedback.sme_status === "agree_with_coder"
                                  }
                                  onClick={() => {
                                    smeModalFunc(feedback.id, "auditor");
                                  }}
                                  className={`custom-primary-btn sme-btn fs-6 btn btn-hover-list ${
                                    feedback.sme_status ===
                                      "agree_with_auditor" ||
                                    feedback.sme_status === "agree_with_coder"
                                      ? "disabled-sme"
                                      : ""
                                  }`}
                                >
                                  <MdThumbUp className="me-2 fs-5 mb-1" />
                                  {feedback.sme_status === "agree_with_auditor"
                                    ? "Auditor Agreed"
                                    : "Auditor Agree"}
                                </Button>

                                <Button
                                  variant="hover-list"
                                  disabled={
                                    feedback.sme_status ===
                                      "agree_with_auditor" ||
                                    feedback.sme_status === "agree_with_coder"
                                  }
                                  onClick={() => {
                                    smeModalFunc(feedback.id, "coder");
                                  }}
                                  className={`custom-primary-btn sme-btn fs-6 btn btn-hover-list ${
                                    feedback.sme_status ===
                                      "agree_with_auditor" ||
                                    feedback.sme_status === "agree_with_coder"
                                      ? "disabled-sme"
                                      : ""
                                  }`}
                                >
                                  <MdThumbUp className="me-2 fs-5 mb-1" />
                                  {feedback.sme_status === "agree_with_coder"
                                    ? "Coder Agreed"
                                    : "Coder Agree"}
                                </Button>
                              </div>

                              <div className="ms-3 cardname-text small">
                                {feedback.sme_status ===
                                  "agree_with_auditor" && (
                                  <p className="mb-1 d-flex align-items-center">
                                    <IoInformationCircle className="information-icon me-1 mb-1" />
                                    SME has validated the auditor's review for
                                    this chart.
                                  </p>
                                )}
                                {feedback.sme_status === "agree_with_coder" && (
                                  <p className="mb-1 d-flex align-items-center">
                                    <IoInformationCircle className="information-icon me-1 mb-1" />
                                    SME has validated the coder's review for
                                    this chart.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ModalComp
                  isOpen={codermodalopen}
                  onClose={() => setCodermodalOpen(false)}
                  showActions={false}
                  className="modal-lg"
                  dialogClassName="modal-40wh"
                >
                  <div className="px-3 pt-3">
                    <h5 className="mb-1">Evidence</h5>
                    <div className="view-hight-evidance">
                      {loading ? (
                        <div>Loading Image...</div>
                      ) : getCoderEvidance ? (
                        // <iframe
                        //   src={getCoderEvidance}
                        //   width="100%"
                        //   height="100%"
                        //   className="feedback-evi"
                        //   title="Image Viewer"
                        //   style={{ border: "none" }}
                        // />
                        <img
                          src={getCoderEvidance}
                          alt="Evidence"
                          className="feedback-evi"
                        />
                      ) : (
                        <div className="mt-2 text-center">
                          <img
                            src="/images/no-image.png"
                            alt="No Image"
                            className="no-img"
                          />
                          <p className="img-title">No Image Available...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </ModalComp>

                <div>
                  <ModalComp
                    isOpen={showSmeModal}
                    onClose={() => setShowSmeModal(false)}
                    showActions={false}
                  >
                    <PostPayloadDelete
                      closeAllModals={setShowSmeModal}
                      postEndPoint={`feedback/agree-with-${agreeWith}/${feedbackId}`}
                      payloadKey={"comment"}
                      queryKey={"feedbackItems"}
                      type={"file"}
                      agreeId={feedbackId}
                      data={data}
                      setData={setData}
                      agreeWith={agreeWith}
                    />
                  </ModalComp>
                </div>

                <div>
                  <ModalComp
                    isOpen={smeComments}
                    onClose={() => {
                      setSmeComments(false);
                      setSmeCommentId(null);
                    }}
                    showActions={false}
                    className="modal-lg"
                    styleWidth="800px"
                  >
                    <div className="d-flex justify-content-between align-items-center pb-2 border-bottom">
                      <h5 className="t-title mb-2">SME Comment</h5>
                      <button
                        type="button"
                        className="btn-close filtered-image"
                        onClick={() => setSmeComments(false)}
                      ></button>
                    </div>
                    <div className="audit-modal p-3">
                      {data.error_feedback
                        ?.filter((feedback) => feedback.id === smeCommentId)
                        .map((feedback) => (
                          <p key={feedback.id}>
                            {ucFirst(feedback.sme_comment)}
                          </p>
                        ))}
                    </div>
                  </ModalComp>
                </div>
              </div>
            </>
          ))
        )}
      </div>
    </div>
  );
};

export default SmeDetails;
