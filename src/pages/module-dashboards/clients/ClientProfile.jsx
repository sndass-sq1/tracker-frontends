/** @format */
import { useState, useRef, useContext, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { UserContext } from "../../../UserContext/UserContext";
import {
  FaUsers,
  FaProjectDiagram,
  FaUsersCog,
  FaLaptopCode,
  FaUserShield,
  FaChevronDown,
  FaChevronUp,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { Card, Row, Col, Modal, Button, Spinner } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";
import { IoMdArrowRoundBack } from "react-icons/io";
import { formatDate } from "../../../utils/formatDate";
const COLORS = ["#f04f4f", "#3b82f6"];
const GREY_COLORS = ["#cccccc", "#999999"];

export default function ClientProfile() {
  const { theme } = useContext(UserContext);

  // Date filter
  const dateRef = useRef(null);
  const navigate = useNavigate();
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState(0);
  const dateOptions = ["Today", "Yesterday", "This Month", "Previous Month"];

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", items: [] });

  const location = useLocation();
  const selectedRow = location.state?.rows;

  const getClientProfile = async () => {
    if (!selectedRow) return null;
    const response = await apiClient.get(
      `clients/profile/${selectedRow}?date_filter=${dateFilter}`
    );
    return response.data;
  };

  const getProjects = async () => {
    if (!selectedRow) return [];
    try {
      const response = await apiClient.get(`/client-projects/${selectedRow}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  };

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

  const {
    data: clientData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["getClientProfile", selectedRow, dateFilter],
    queryFn: getClientProfile,
    staleTime: 5 * 60 * 1000,
    enabled: !!selectedRow,
  });

  const { data: projectsData } = useQuery({
    queryKey: ["getProjects", selectedRow],
    queryFn: getProjects,
    staleTime: 5 * 60 * 1000,
    enabled: !!selectedRow,
  });

  const { data: subProjectsData } = useQuery({
    queryKey: ["getSubProjects", selectedRow],
    queryFn: getSubProjects,
    staleTime: 5 * 60 * 1000,
    enabled: !!selectedRow,
  });

  const clientProfile = clientData?.data || {};

  let projects = [];
  if (Array.isArray(projectsData)) {
    projects = projectsData;
  } else if (projectsData && projectsData.data) {
    if (Array.isArray(projectsData.data)) {
      projects = projectsData.data;
    } else if (
      projectsData.data.data &&
      Array.isArray(projectsData.data.data)
    ) {
      projects = projectsData.data.data;
    }
  }

  const subProjects = subProjectsData || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cardStyle = {
    backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
    color: theme === "dark" ? "#ffffff" : "#000000",
  };
  const textColor = theme === "dark" ? "#ffffff" : "#000000";

  const handleShowModal = (title, items) => {
    setModalContent({ title, items });
    setShowModal(true);
  };

  const hasData =
    clientProfile.error_percentage > 0 || clientProfile.over_all_quality > 0;
  const pieData = hasData
    ? [
        {
          name: "Error Percentage",
          value: clientProfile.error_percentage || 0,
        },
        { name: "Quality Score", value: clientProfile.over_all_quality || 0 },
      ]
    : [
        { name: "No Data", value: 50 },
        { name: "No Data", value: 50 },
      ];

  if (isLoading) return <div className="loading-indicator-dashboard" />;

  if (isError) return <div>Error fetching client profile</div>;

  const isResetDisabled = !dateFilter;

  const handleReset = () => {
    setDateFilter("");
  };

  return (
    <div
      className="container-fluid mt-2"
      style={{
        backgroundColor: theme === "dark" ? "#111111" : "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0" style={{ color: textColor }}>
          {clientProfile.client_name || "Client Profile"}
        </h5>
        <div className="d-flex justify-content-end gap-3">
          <div
            className="position-relative"
            ref={dateRef}
            style={{ width: 190 }}
          >
            <button
              onClick={() => setIsDateOpen(!isDateOpen)}
              className="w-100 d-flex dropdown-theme justify-content-between align-items-center px-3 py-2"
              style={cardStyle}
            >
              <span className="text-truncate">
                {dateOptions[dateFilter || 0]}
              </span>
              <span className="d-flex align-items-center ms-2">
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
                className="position-absolute p-2 rounded shadow-sm mt-2 w-100"
                style={{ ...cardStyle, zIndex: 1050 }}
              >
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
                    style={{ cursor: "pointer" }}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* reset filter */}
          <div
            className={isResetDisabled ? " cursor-wrapper" : "cursor-pointer"}
          >
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
              role="button"
              tabIndex={isResetDisabled ? -1 : 0}
              onClick={!isResetDisabled ? handleReset : undefined}
            >
              <img
                src="/images/refresh-light.png"
                alt="Reset Filter"
                aria-label="Reset Filter"
                style={{ pointerEvents: "none" }}
                title="Reset filter"
              />
            </div>
            {/* </OverlayTrigger> */}
          </div>
          <Link className="text-decoration-none" to={`/clients`}>
            <button
              className="btn btn-primary custom-primary-btn back-btn font-size13"
              onClick={() => navigate(`/clients`)}
            >
              <IoMdArrowRoundBack className="fs-5" />
            </button>
          </Link>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={3} sm={6} xs={12}>
          <Card className="p-3 rounded darkcard-project" style={cardStyle}>
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h6 className="mb-1">Total Projects</h6>
                <h3 className="fw-bolder mb-0">{projects.length || "NA"}</h3>
              </div>
              <FaProjectDiagram size={32} />
            </div>
          </Card>
        </Col>
        <Col md={3} sm={6} xs={12}>
          <Card className="p-3 rounded darkcard-project" style={cardStyle}>
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h6 className="mb-1">Total Teams</h6>
                <h3 className="fw-bolder mb-0">
                  {clientProfile?.team_count || "NA"}
                </h3>
              </div>
              <FaUsersCog size={32} />
            </div>
          </Card>
        </Col>
        <Col md={3} sm={6} xs={12}>
          <Card className="p-3 rounded darkcard-project" style={cardStyle}>
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h6 className="mb-1">Total Coders</h6>
                <h3 className="fw-bolder mb-0">
                  {clientProfile?.total_coders || "NA"}
                </h3>
              </div>
              <FaLaptopCode size={32} />
            </div>
          </Card>
        </Col>
        <Col md={3} sm={6} xs={12}>
          <Card className="p-3 rounded darkcard-project" style={cardStyle}>
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h6 className="mb-1">Total Auditors</h6>
                <h3 className="fw-bolder mb-0">
                  {clientProfile?.total_auditors || "NA"}
                </h3>
              </div>
              <FaUserShield size={32} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Left: Info */}
        <Col md={6} sm={12}>
          <Card
            body
            className="h-100 darkcard-project shadow-sm"
            style={cardStyle}
          >
            <h5 className="fw-bold mb-3 text-primary">
              {clientProfile.client_name || "NA"}
            </h5>
            <p>
              <FaUsersCog className="me-2" /> <b>Client Code:</b>
              {clientProfile.client_code || "NA"}
            </p>

            {/* Projects */}
            <div className="mb-3">
              <h6 className="fw-bold mb-2">
                <FaProjectDiagram className="me-2" /> Projects
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {projects.length > 0 ? (
                  <>
                    {projects.slice(0, 2).map((project, idx) => (
                      <span
                        key={idx}
                        className="py-1 px-3 darkcard-project text-center rounded-1"
                      >
                        {project.name ||
                          project.project_name ||
                          `Project ${idx + 1}`}
                      </span>
                    ))}
                    {projects.length > 2 && (
                      <Button
                        variant={
                          theme === "dark" ? "outline-light" : "outline-dark"
                        }
                        size="sm"
                        onClick={() =>
                          handleShowModal(
                            "Projects",
                            projects.map(
                              (p) =>
                                p.name || p.project_name || "Unnamed Project"
                            )
                          )
                        }
                        className="p-1 text-decoration-none text-center"
                      >
                        +{projects.length - 2} More
                      </Button>
                    )}
                  </>
                ) : (
                  <span className="py-1 px-3 darkcard-project text-center rounded-1">
                    No projects available
                  </span>
                )}
              </div>
            </div>

            {/* Sub Projects */}
            <div className="mb-3">
              <h6 className="fw-bold mb-2">
                <FaMapMarkedAlt className="me-2" /> Sub Projects
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {subProjects.length > 0 ? (
                  <>
                    {subProjects.slice(0, 2).map((sub, idx) => (
                      <span
                        key={idx}
                        className="py-1 px-3 darkcard-project text-center rounded-1"
                      >
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
                        size="sm"
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
                        className="p-1 text-decoration-none text-center"
                      >
                        +{subProjects.length - 2} More
                      </Button>
                    )}
                  </>
                ) : (
                  <span className="py-1 px-3 darkcard-project text-center rounded-1">
                    No sub-projects available
                  </span>
                )}
              </div>
            </div>

            <hr />
            <p>
              <b>Created By : </b> {clientProfile.created_by_name || "NA"}
            </p>
            <p>
              <b>Email : </b>
              <span className="mute-font">
                {clientProfile.created_by_email || "NA"}
              </span>
            </p>
            <p>
              <b>Created At : </b>
              <span className="mute-font">
                {formatDate(clientProfile.created_at || "NA")}
              </span>
            </p>
          </Card>
        </Col>

        <Col md={6} sm={12}>
          <Card
            body
            className="h-100 darkcard-project shadow-sm d-flex flex-column justify-content-between"
            style={cardStyle}
          >
            <div>
              <h6 className="fw-bold mb-3">Quality Overview</h6>
              <Row className="g-2 mb-4">
                <Col>
                  <div
                    className="darkcard-project rounded py-3 text-center"
                    style={cardStyle}
                  >
                    <p className="fs-5 fw-bold mb-0">
                      {clientProfile.total_chart_count || "NA"}
                    </p>
                    <small
                      className={
                        theme === "dark"
                          ? "text-muted-dark"
                          : "text-muted-light"
                      }
                    >
                      Charts
                    </small>
                  </div>
                </Col>
                <Col>
                  <div
                    className="darkcard-project rounded py-3 text-center"
                    style={cardStyle}
                  >
                    <p className="fs-5 fw-bold mb-0">
                      {clientProfile.total_audit_count || "NA"}
                    </p>
                    <small
                      className={
                        theme === "dark"
                          ? "text-muted-dark"
                          : "text-muted-light"
                      }
                    >
                      Audits
                    </small>
                  </div>
                </Col>
              </Row>

              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={30}
                      outerRadius={65}
                      paddingAngle={3}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {pieData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            hasData
                              ? COLORS[i % COLORS.length]
                              : GREY_COLORS[i % GREY_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          theme === "dark" ? "#000000" : "#ffffff",
                        color: textColor,
                      }}
                      formatter={(value, name) =>
                        hasData
                          ? [`${value}%`, name]
                          : ["No data available", ""]
                      }
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      payload={
                        hasData
                          ? [
                              {
                                value: "Error Percentage",
                                type: "circle",
                                color: COLORS[0],
                              },
                              {
                                value: "Quality Score",
                                type: "circle",
                                color: COLORS[1],
                              },
                            ]
                          : [
                              {
                                value: "No Data Available",
                                type: "circle",
                                color: GREY_COLORS[0],
                              },
                            ]
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalContent.items.length > 0 ? (
            <ul className="list-unstyled mb-0">
              {modalContent.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No items to display</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
