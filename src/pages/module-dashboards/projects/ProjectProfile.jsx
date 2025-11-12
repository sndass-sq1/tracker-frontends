/** @format */
import React, { useState, useRef, useContext, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Card, Row, Col, Modal, Button, Spinner, Alert } from "react-bootstrap";
import { UserContext } from "../../../UserContext/UserContext";
import apiClient from "../../../services/apiClient";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  FaUsersCog,
  FaProjectDiagram,
  FaLaptopCode,
  FaUserShield,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { LuUsers } from "react-icons/lu";
import { IoMdArrowRoundBack } from "react-icons/io";
import { formatDate } from "../../../utils/formatDate";
const TEAM_COLORS = ["#3b82f6", "#06b6d4", "#10b981"];
const QUALITY_COLORS = ["#f59e0b", "#ef4444"];
const NO_DATA_COLOR = "#d3d3d3";
const ProjectProfile = () => {
  const { theme } = useContext(UserContext);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", items: [] });
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("0");
  const dateRef = useRef(null);
  const dateOptions = ["Today", "Yesterday", "This Month", "Previous Month"];
  const [locationId, setLocationId] = useState("");
  const [page, setPage] = useState(1);

  const location = useLocation();
  const selectedRow = location.state?.id;

  const getProjectProfile = async () => {
    if (!selectedRow) return null;
    try {
      const params = new URLSearchParams({
        id: selectedRow,
        page: page.toString(),
        ...(dateFilter !== "0" && { date_filter: dateFilter }),
        ...(locationId && { location_id: locationId }),
      });

      const response = await apiClient.get(`projects/profile/data?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const { data, isError, isLoading, error, refetch } = useQuery({
    queryKey: ["getProjectProfile", selectedRow, dateFilter, locationId, page],
    queryFn: getProjectProfile,
    staleTime: 5 * 60 * 1000,
    enabled: !!selectedRow,
  });

  useEffect(() => {
    if (selectedRow) {
      refetch();
    }
  }, [dateFilter, locationId, page, refetch, selectedRow]);

  const getSubProjects = async () => {
    if (!selectedRow) return [];
    try {
      const response = await apiClient.get(
        `sub-projects/dropdown/${selectedRow}`
      );

      if (response.data && response.data.data) {
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (
          response.data.data.data &&
          Array.isArray(response.data.data.data)
        ) {
          return response.data.data.data;
        }
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching sub-projects:", error);
      return [];
    }
  };
  const { data: subProjectsData } = useQuery({
    queryKey: ["getSubProjects", selectedRow],
    queryFn: getSubProjects,
    staleTime: 5 * 60 * 1000,
    enabled: !!selectedRow,
  });
  const subProjects = subProjectsData || [];
  const cardStyle = {
    backgroundColor: theme === "dark" ? "#2c2c2c" : "#ffffff",
    color: theme === "dark" ? "#ffffff" : "#000000",
    border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6",
  };

  const handleShowModal = (title, items) => {
    setModalContent({ title, items });
    setShowModal(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const textColor = theme === "dark" ? "#ffffff" : "#000000";

  if (!selectedRow) {
    return (
      <Alert variant='warning' className='m-3'>
        No project selected. Please go back and select a project.
      </Alert>
    );
  }

  if (isLoading) return <div className='loading-indicator-dashboard' />;

  if (isError)
    return (
      <Alert variant='danger' className='m-3'>
        Error fetching project profile: {error.message}
      </Alert>
    );

  const projectData = data?.data?.data?.[0] || {};

  const teamData = [
    { name: "Charts", value: projectData.total_chart_count || 0 },
    { name: "Audits", value: projectData.total_audit_count || 0 },
  ];

  const qualityData = [
    { name: "Quality", value: projectData.over_all_quality || 0 },
    { name: "Error", value: projectData.error_percentage || 0 },
  ];
  const hasData = qualityData.some((d) => d.value > 0);
  const hasTeamData = teamData?.some((d) => d.value > 0);

  const isResetDisabled = !dateFilter;

  const handleReset = () => {
    setDateFilter("");
  };
  return (
    <div className='container-fluid mt-2'>
      {/* Header */}
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h5 className='fw-bold mb-0'>
          {projectData.project_name || "Project Details"}
        </h5>
        <div className='d-flex justify-content-end gap-3'>
          <div
            className='position-relative'
            ref={dateRef}
            style={{ width: 190 }}>
            <button
              onClick={() => setIsDateOpen(!isDateOpen)}
              className='w-100 d-flex dropdown-theme justify-content-between align-items-center px-3 py-2'
              style={cardStyle}>
              <span className='text-truncate'>
                {dateOptions[dateFilter || 0]}
              </span>
              <span className='d-flex align-items-center ms-2'>
                <span
                  style={{
                    borderLeft: "1px solid #ccc",
                    height: 20,
                    margin: "0 8px",
                  }}
                />
                {isDateOpen ? (
                  <FaChevronUp size={14} />
                ) : (
                  <FaChevronDown size={14} />
                )}
              </span>
            </button>
            {isDateOpen && (
              <ul
                className='position-absolute p-2 rounded shadow-sm mt-2 w-100'
                style={{ ...cardStyle, zIndex: 1050 }}>
                {dateOptions.map((label, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setDateFilter(idx);
                      setIsDateOpen(false);
                    }}
                    className={`py-2 px-3 list-unstyled pointer hover-list ${
                      dateFilter === idx ? "active-location" : ""
                    }`}
                    style={{ cursor: "pointer" }}>
                    {label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* reset filter */}
          <div
            className={isResetDisabled ? " cursor-wrapper" : "cursor-pointer"}>
            {/* <OverlayTrigger
                        placement="top"
                        overlay={
                          ""
                          // <Tooltip id="reset-tooltip">
                          //   <p>Reset Filter</p>
                          // </Tooltip>
                        }
                      > */}
            <div
              className={`stroke-btn border-theme p-3 d-flex align-items-center justify-content-center ${
                isResetDisabled
                  ? "wrapper-not-allowed filtered-image"
                  : " filtered-image1"
              }`}
              role='button'
              tabIndex={isResetDisabled ? -1 : 0}
              onClick={!isResetDisabled ? handleReset : undefined}>
              <img
                src='/images/refresh-light.png'
                alt='Reset Filter'
                aria-label='Reset Filter'
                style={{ pointerEvents: "none" }}
                title='Reset filter'
              />
            </div>
            {/* </OverlayTrigger> */}
          </div>
          <Link className='text-decoration-none' to={`/projects`}>
            <button
              className='btn btn-primary custom-primary-btn back-btn font-size13'
              onClick={() => navigate(`/projects`)}>
              <IoMdArrowRoundBack className='fs-5' />
            </button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className='mb-4'>
        <Col md={4} sm={6} xs={12}>
          <Card className='p-3 rounded darkcard-project'>
            <div className='d-flex align-items-center'>
              <div className='flex-grow-1'>
                <h6 className='mb-1'>Total Teams</h6>
                <h3 className='fw-bolder mb-0'>
                  {projectData.team_count || "NA"}
                </h3>
              </div>
              <FaUsersCog size={32} />
            </div>
          </Card>
        </Col>

        <Col md={4} sm={6} xs={12}>
          <Card className='p-3 rounded darkcard-project'>
            <div className='d-flex align-items-center'>
              <div className='flex-grow-1'>
                <h6 className='mb-1'>Total Coders</h6>
                <h3 className='fw-bolder mb-0'>
                  {projectData.coder_count || "NA"}
                </h3>
              </div>
              <FaLaptopCode size={32} />
            </div>
          </Card>
        </Col>
        <Col md={4} sm={6} xs={12}>
          <Card className='p-3 rounded darkcard-project'>
            <div className='d-flex align-items-center'>
              <div className='flex-grow-1'>
                <h6 className='mb-1'>Total Auditors</h6>
                <h3 className='fw-bolder mb-0'>
                  {projectData.auditor_count || "NA"}
                </h3>
              </div>
              <FaUserShield size={32} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Project Cards */}
      <Row className='g-3 mb-4'>
        <Col md={6} sm={12}>
          <Card body className='h-100 darkcard-project shadow-sm'>
            <h5 className='fw-bold mb-3 text-primary'>
              {projectData.project_name || "NA"}
            </h5>
            <p>
              <LuUsers className='me-2' /> <b>Client Name:</b>
              {projectData.client_name || "NA"}
            </p>
            <p>
              <FaUsersCog className='me-2' /> <b>Project Code:</b>
              {projectData.project_code || "NA"}
            </p>

            <div className='mb-3'>
              <h6 className='fw-bold mb-2'>
                <FaProjectDiagram className='me-2' /> Sub Projects
              </h6>
              <div className='d-flex flex-wrap gap-2'>
                {subProjects.length > 0 ? (
                  <>
                    {subProjects.slice(0, 2).map((sub, idx) => (
                      <span
                        key={idx}
                        className='py-1 px-3 darkcard-project text-center rounded-1'>
                        {sub.sub_project_name ||
                          sub.name ||
                          `Sub-project ${idx + 1}`}
                      </span>
                    ))}
                    {subProjects.length > 2 && (
                      <Button
                        variant={
                          theme === "dark" ? "outline-light" : "outline-dark"
                        }
                        size='sm'
                        onClick={() =>
                          handleShowModal(
                            "Sub Projects",
                            subProjects.map(
                              (sp) =>
                                sp.sub_project_name ||
                                sp.name ||
                                "Unnamed Sub-project"
                            )
                          )
                        }
                        className='p-1 text-decoration-none text-center'>
                        +{subProjects.length - 2} More
                      </Button>
                    )}
                  </>
                ) : (
                  <span className='py-1 px-3 darkcard-project text-center rounded-1'>
                    No sub-projects available
                  </span>
                )}
              </div>
            </div>

            <hr />
            <p>
              <b>Created By : </b> {projectData.created_by_name || "NA"}
            </p>
            <p>
              <b>Email : </b>
              <span className='mute-font'>
                {projectData.created_by_email || "NA"}
              </span>
            </p>
            <p>
              <b>Created At : </b>
              <span className='mute-font'>
                {formatDate(projectData.created_at || "NA")}
              </span>
            </p>
          </Card>
        </Col>

        <Col md={6} sm={12}>
          <Card
            body
            className='h-100 darkcard-project shadow-sm d-flex flex-column justify-content-between'>
            <div>
              <h6 className='fw-bold mb-1'>Quality Overview</h6>
              <Row className='g-2 '>
                <Col>
                  <div className='darkcard-project rounded py-3 text-center'>
                    <p className='fs-5 fw-bold mb-0'>
                      {projectData.total_chart_count || "NA"}
                    </p>
                    <small className='mute-font'>Charts</small>
                  </div>
                </Col>
                <Col>
                  <div className='darkcard-project rounded py-3 text-center'>
                    <p className='fs-5 fw-bold mb-0'>
                      {projectData.total_audit_count || "NA"}
                    </p>
                    <small className='mute-font'>Audits</small>
                  </div>
                </Col>
              </Row>

              <div className='row mt-2 g-3'>
                <div className='col-6'>
                  <div className='darkcard-project rounded p-2'>
                    <div className='small fw-semibold mb-1'>
                      Charts & Audits
                    </div>
                    <div style={{ width: "100%", height: 170 }}>
                      <div
                        style={{
                          width: "100%",
                          height: 170,
                          position: "relative",
                        }}>
                        <ResponsiveContainer>
                          <PieChart>
                            {hasTeamData ? (
                              <Pie
                                data={teamData}
                                dataKey='value'
                                nameKey='name'
                                innerRadius={35}
                                outerRadius={55}>
                                {teamData.map((_, i) => (
                                  <Cell
                                    key={i}
                                    fill={TEAM_COLORS[i % TEAM_COLORS.length]}
                                  />
                                ))}
                              </Pie>
                            ) : (
                              <Pie
                                data={[{ name: "No Data", value: 1 }]}
                                dataKey='value'
                                innerRadius={35}
                                outerRadius={55}>
                                <Cell fill={NO_DATA_COLOR} />
                              </Pie>
                            )}
                            <Tooltip
                              formatter={(value, name) =>
                                name === "No Data"
                                  ? [0, "No Data"]
                                  : [value, name]
                              }
                            />
                            {hasTeamData && (
                              <Legend
                                verticalAlign='bottom'
                                align='center'
                                iconType='circle'
                              />
                            )}
                          </PieChart>
                        </ResponsiveContainer>

                        {!hasTeamData && (
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                              color: "#666",
                            }}>
                            No Data
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-6'>
                  <div className='darkcard-project rounded p-2'>
                    <div className='small fw-semibold mb-1'>
                      Quality & Errors
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 170,
                        position: "relative",
                      }}>
                      <ResponsiveContainer>
                        <PieChart>
                          {hasData ? (
                            <Pie
                              data={qualityData}
                              dataKey='value'
                              nameKey='name'
                              innerRadius={35}
                              outerRadius={55}
                              label={false} // remove side labels
                            >
                              {qualityData.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={
                                    QUALITY_COLORS[i % QUALITY_COLORS.length]
                                  }
                                />
                              ))}
                            </Pie>
                          ) : (
                            <Pie
                              data={[{ name: "No Data", value: 1 }]}
                              dataKey='value'
                              innerRadius={35}
                              outerRadius={55}
                              label={false} // remove side labels
                            >
                              <Cell fill={NO_DATA_COLOR} />
                            </Pie>
                          )}

                          {/* Tooltip */}
                          <Tooltip
                            formatter={(value, name) =>
                              name === "No Data"
                                ? [0, "No Data"]
                                : [value, name]
                            }
                          />

                          {/* Legend only when data exists */}
                          {hasData && (
                            <Legend
                              verticalAlign='bottom'
                              align='center'
                              iconType='circle'
                            />
                          )}
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Centered No Data text */}
                      {!hasData && (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            color: "#666",
                          }}>
                          No Data
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className='list-unstyled mb-0'>
            {modalContent.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProjectProfile;
