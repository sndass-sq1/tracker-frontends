/** @format */

import { useMemo, useState, useRef, useContext, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  OverlayTrigger,
  Tooltip as RBTooltip,
  Modal,
  Button,
} from "react-bootstrap";
import {
  FaProjectDiagram,
  FaChevronDown,
  FaChevronUp,
  FaUserTie,
  FaUsers,
  FaUserCheck,
  FaLaptopCode,
  FaUserShield,
} from "react-icons/fa";
import { UserContext } from "../../../UserContext/UserContext";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { IoMdArrowRoundBack } from "react-icons/io";
import apiClient from "../../../services/apiClient";

const TEAM_COLORS = ["#3b82f6", "#06b6d4", "#10b981"];
const QUALITY_COLORS = ["#ef4444", "#f59e0b"];

const donutData = (charts, audits) => [
  { name: "Charts", value: charts || 0 },
  { name: "Audits", value: audits || 0 },
];

const qualityData = (error, quality) => [
  { name: "Error", value: error || 0 },
  { name: "Quality", value: quality || 0 },
];

function ProjectCard({ project, loadMoreRef, isFetchingNextPage, isLast }) {
  const { theme } = useContext(UserContext);
  const [show, setShow] = useState(false);

  const [subProjects, setSubProjects] = useState([]);
  const [loadingSubProjects, setLoadingSubProjects] = useState(false);

  const handleOpen = () => {
    setShow(true);
    fetchSubProjects();
  };

  const handleClose = () => setShow(false);

  const fetchSubProjects = async () => {
    if (!project?.id) return;

    setLoadingSubProjects(true);
    try {
      const response = await apiClient.get(
        `sub-projects/dropdown/${project.id}`
      );
      setSubProjects(response.data?.data?.data || []);
    } catch (error) {
      console.error("Error fetching sub-projects:", error);
      setSubProjects([]);
    } finally {
      setLoadingSubProjects(false);
    }
  };

  const teamData = donutData(
    project?.total_chart_count,
    project?.total_audit_count
  );
  const qualityChartData = qualityData(
    project?.error_percentage,
    project?.over_all_quality
  );

  return (
    <div className='col-12 col-md-6 col-lg-4'>
      <div className='card shadow-sm darkcard-project h-100'>
        <div className='card-body d-flex flex-column'>
          <div className='d-flex justify-content-between align-items-start'>
            <div>
              <h5 className='card-title mb-1'>
                {project?.project_name || "NA"}
              </h5>
              <small className='mute-font'>
                {project?.project_code || "NA"}
              </small>
            </div>
            <div>
              <FaProjectDiagram
                className='text-primary'
                style={{ cursor: "pointer" }}
                onClick={handleOpen}
              />

              {/* Modal */}
              <Modal show={show} onHide={handleClose} centered scrollable>
                <Modal.Header closeButton>
                  <Modal.Title>
                    {project?.project_name || "Project"} - Sub Projects
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {loadingSubProjects ? (
                    <div className='text-center py-3'>
                      <div
                        className='spinner-border text-primary'
                        role='status'>
                        <span className='visually-hidden'>Loading...</span>
                      </div>
                      <p className='mt-2 mb-0 small text-muted'>
                        Loading sub-projects...
                      </p>
                    </div>
                  ) : subProjects.length > 0 ? (
                    <ul className='list-unstyled mb-0'>
                      {subProjects.map((sp) => (
                        <li
                          key={sp.id}
                          className='py-1 d-flex align-items-center'>
                          <FaProjectDiagram className='me-2 text-secondary' />
                          <span>{sp.sub_project_name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-muted text-center mb-0 py-2'>
                      No sub-projects available
                    </p>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant='secondary' onClick={handleClose}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </div>

          <div className='row text-center mt-3 g-2'>
            <div className='col-4'>
              <Link
                to='/ViewTeams'
                state={{ projectId: project.id }}
                className='text-decoration-none'>
                <div className='darkcard-project rounded py-2'>
                  <div className='fs-5 fw-bold'>
                    {project?.team_count || "NA"}
                  </div>
                  <small className='mute-font'>Teams</small>
                </div>
              </Link>
            </div>
            <div className='col-4'>
              <div className='darkcard-project rounded py-2'>
                <div className='fs-5 fw-bold'>
                  {project?.auditor_count || "NA"}
                </div>
                <small className='mute-font'>Auditors</small>
              </div>
            </div>
            <div className='col-4'>
              <div className='darkcard-project rounded py-2'>
                <div className='fs-5 fw-bold'>
                  {project?.coder_count || "NA"}
                </div>
                <small className='mute-font'>Coders</small>
              </div>
            </div>
          </div>

          <div className='row mt-3 g-3'>
            <div className='col-6'>
              <div className='darkcard-project rounded p-2'>
                <div className='small fw-semibold mb-1'>Charts & Audits</div>

                <div
                  style={{ width: "100%", height: 140, position: "relative" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      {teamData.reduce((sum, item) => sum + item.value, 0) ===
                      0 ? (
                        <Pie
                          data={[{ name: "No Data", value: 1 }]}
                          dataKey='value'
                          innerRadius={35}
                          outerRadius={55}
                          label={false} // remove side labels
                        >
                          <Cell fill='#d3d3d3' />
                        </Pie>
                      ) : (
                        <Pie
                          data={teamData}
                          dataKey='value'
                          nameKey='name'
                          innerRadius={35}
                          outerRadius={55}
                          label={false} // remove side labels
                        >
                          {teamData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={TEAM_COLORS[i % TEAM_COLORS.length]}
                            />
                          ))}
                        </Pie>
                      )}

                      {/* Tooltip */}
                      <Tooltip
                        formatter={(value, name) =>
                          name === "No Data" ? [0, "No Data"] : [value, name]
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered "No Data" text */}
                  {teamData.reduce((sum, item) => sum + item.value, 0) ===
                    0 && (
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

            <div className='col-6'>
              <div className='darkcard-project rounded p-2'>
                <div className='small fw-semibold mb-1'>Quality & Errors</div>

                <div
                  style={{ width: "100%", height: 140, position: "relative" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      {qualityChartData.reduce(
                        (sum, item) => sum + item.value,
                        0
                      ) === 0 ? (
                        <Pie
                          data={[{ name: "No Data", value: 1 }]}
                          dataKey='value'
                          innerRadius={35}
                          outerRadius={55}
                          label={false} // remove side labels
                        >
                          <Cell fill='#d3d3d3' />
                        </Pie>
                      ) : (
                        <Pie
                          data={qualityChartData}
                          dataKey='value'
                          nameKey='name'
                          innerRadius={35}
                          outerRadius={55}
                          label={false} // remove side labels
                        >
                          {qualityChartData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={QUALITY_COLORS[i % QUALITY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                      )}

                      {/* Tooltip */}
                      <Tooltip
                        formatter={(value, name) =>
                          name === "No Data" ? [0, "No Data"] : [value, name]
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered "No Data" text */}
                  {qualityChartData.reduce(
                    (sum, item) => sum + item.value,
                    0
                  ) === 0 && (
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

          <div className='mt-3 d-flex justify-content-between small'>
            <span className='mute-font'>
              Charts:
              <span className='text-info fw-semibold'>
                {project?.total_chart_count || 0}
              </span>
            </span>
            <span className='mute-font'>
              Audits:
              <span className='text-success fw-semibold'>
                {project?.total_audit_count || 0}
              </span>
            </span>

            <span className='mute-font'>
              Quality:
              <span className='text-warning fw-bold'>
                {project?.over_all_quality || 0}%
              </span>
            </span>
            <span className='mute-font'>
              Error:
              <span className='text-danger fw-semibold'>
                {project?.error_percentage || 0}%
              </span>
            </span>
          </div>

          {isLast && <div ref={loadMoreRef} style={{ height: 1 }} />}

          {isLast && isFetchingNextPage && (
            <div className='text-center my-3'>
              <span className='spinner-border spinner-border-sm' />
              <span className='ms-2'>Loading more...</span>
            </div>
          )}
          {project?.team_count > 0 ? (
            <Link
              to='/ViewTeams'
              state={{ projectId: project.id }}
              className='text-decoration-none'>
              <div className='row mt-3 mx-1'>
                <button className='btn btn-outline-primary btn-sm flex-fill'>
                  View Teams
                </button>
              </div>
            </Link>
          ) : (
            <div className='row mt-3 mx-1'>
              <button
                className='btn btn-outline-secondary btn-sm flex-fill'
                disabled>
                No Teams
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsDashboard() {
  const locationRef = useRef(null);
  const dateRef = useRef(null);
  const loadMoreRef = useRef(null);
  const { theme } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const passedLocationId = location.state?.locationId ?? null;
  const passDateFilter = location.state?.dateFilter ?? "";
  const [locationId, setLocationId] = useState(passedLocationId);
  const [dateFilter, setDateFilter] = useState(passDateFilter);

  const { data: listLocation, isLoading: isLocationLoading } = useQuery({
    queryKey: ["listLocationData"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("locations/dropdown");
        return response.data?.data || { data: [] };
      } catch (error) {
        console.error("Error fetching locations:", error);
        return { data: [] };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: projectCountData, isLoading: isProjectCountLoading } = useQuery(
    {
      queryKey: ["projectCountData", locationId, dateFilter],
      queryFn: async () => {
        try {
          const params = new URLSearchParams();
          if (locationId) params.append("location_id", locationId);
          if (dateFilter) params.append("date_filter", dateFilter);

          const response = await apiClient.get(
            `projects/profile/counts?${params.toString()}`
          );
          return response.data?.data || {};
        } catch (error) {
          console.error("Error fetching project counts:", error);
          return {};
        }
      },
      staleTime: 5 * 60 * 1000,
    }
  );

  const {
    data: projectsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingProjects,
  } = useInfiniteQuery({
    queryKey: ["projectsData", locationId, dateFilter, query],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const params = new URLSearchParams();
        if (locationId) params.append("location_id", locationId);
        if (dateFilter) params.append("date_filter", dateFilter);
        if (query) params.append("search", query);

        const res = await apiClient.get(
          `projects/profile/details?${params.toString()}&page=${pageParam}`
        );
        return res.data.data || { data: [], next_page_url: null };
      } catch (error) {
        console.error("Error fetching projects:", error);
        return { data: [], next_page_url: null };
      }
    },
    getNextPageParam: (lastPage) => {
      const nextPageUrl = lastPage.next_page_url;
      if (!nextPageUrl) return undefined;
      const match = nextPageUrl.match(/page=(\d+)/);
      return match ? parseInt(match[1], 10) : undefined;
    },
  });

  const projects = useMemo(() => {
    return projectsData?.pages.flatMap((page) => page.data || []) || [];
  }, [projectsData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setLocationId(passedLocationId);
  }, [passedLocationId]);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleResetLocation = () => {
    setLocationId(null);
    setIsOpen(false);
  };

  const handleCityClick = (location) => {
    setLocationId(location.id);
    setIsOpen(false);
  };

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    setIsDateOpen(false);
  };

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const filteredProjects = useMemo(() => {
    if (!query) return projects;

    const searchTerm = query.toLowerCase();
    return projects.filter(
      (project) =>
        (project.project_name &&
          project.project_name.toLowerCase().includes(searchTerm)) ||
        (project.project_code &&
          project.project_code.toLowerCase().includes(searchTerm))
    );
  }, [projects, query]);

  const cardStyle = {
    backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
    color: theme === "dark" ? "#ffffff" : "#000000",
  };

  const textColor = theme === "dark" ? "#ffffff" : "#000000";
  const isResetDisabled = !dateFilter && !query && !locationId;

  const handleReset = () => {
    setDateFilter("");
    setQuery("");
    setLocationId("");
  };

  return (
    <div className='container-fluid mt-2'>
      <div className='position-relative'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h5 className='fw-bold mb-0'>Project Dashboard</h5>

          <div className='d-flex align-items-center gap-3'>
            <div className='position-relative' ref={locationRef}>
              <button
                onClick={toggleDropdown}
                aria-expanded={isOpen}
                className='dashboard dropdown-theme py-0 px-3 mb-1 d-flex align-items-center justify-content-between text-nowrap'
                style={cardStyle}>
                {locationId === null
                  ? "Overall - location"
                  : listLocation?.data?.find(
                      (location) => location.id === locationId
                    )?.district || "Select location"}
                <div className='d-flex align-items-center'>
                  <span className='ms-5 me-2'>|</span>
                  <span>
                    {isOpen ? (
                      <FaChevronUp className='fs-6' />
                    ) : (
                      <FaChevronDown className='fs-6' />
                    )}
                  </span>
                </div>
              </button>

              {isOpen && (
                <ul
                  className='col-lg darkcard position-absolute end-0 dropdown-width mt-4 bg-white rounded-3 top-50 z-1 p-2'
                  style={cardStyle}>
                  <li
                    className={`py-2 px-4 list-unstyled pointer hover-list ${locationId === null ? "active-location" : ""}`}
                    onClick={handleResetLocation}>
                    Over all
                  </li>
                  {listLocation?.data?.map((location) => (
                    <li
                      key={location.id}
                      className={`py-2 px-4 list-unstyled hover-list pointer ${
                        locationId === location.id ? "active-location" : ""
                      }`}
                      onClick={() => handleCityClick(location)}>
                      {location.district}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              className={
                isResetDisabled ? " cursor-wrapper" : "cursor-pointer"
              }>
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
            <Link className='text-decoration-none' to={`/`}>
              <button
                className='btn btn-primary custom-primary-btn back-btn font-size13'
                onClick={() => navigate(`/`)}>
                <IoMdArrowRoundBack className='fs-5' />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className='row'>
        <div className='col-md-3 col-6 mb-2'>
          <div className='card p-3 darkcard-project shadow-sm'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <h6>Total Projects</h6>
                <h3>{projectCountData?.project_count || "NA"}</h3>
              </div>
              <FaProjectDiagram size={32} />
            </div>
          </div>
        </div>
        <div className='col-md-3 col-6 mb-2'>
          <Link to='/TeamDashboard' className='text-decoration-none'>
            <div className='card p-3 darkcard-project shadow-sm'>
              <div className='d-flex justify-content-between align-items-center'>
                <div>
                  <h6>Total Teams</h6>
                  <h3>{projectCountData?.teams_count || "NA"}</h3>
                </div>
                <FaUsers size={32} />
              </div>
            </div>
          </Link>
        </div>
        <div className='col-md-3 col-6 mb-2'>
          <div className='card p-3 darkcard-project shadow-sm'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <h6>Total Coders</h6>
                <h3>{projectCountData?.total_coders || "NA"}</h3>
              </div>
              <FaLaptopCode size={32} />
            </div>
          </div>
        </div>
        <div className='col-md-3 col-6 mb-2'>
          <div className='card p-3 darkcard-project shadow-sm'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <h6>Total Auditors</h6>
                <h3>{projectCountData?.total_auditors || "NA"}</h3>
              </div>
              <FaUserShield size={32} />
            </div>
          </div>
        </div>

        <div className=' d-flex justify-content-between align-items-center pb-2 pt-1  px-1'>
          <h5 className='fw-bold  text-center ms-3 '>
            Explore Detailed Insights for Each Project
          </h5>
          <div className='d-flex align-items-center gap-3'>
            <div
              className='position-relative  '
              ref={dateRef}
              style={{ width: "190px" }}>
              <button
                onClick={() => setIsDateOpen(!isDateOpen)}
                className='w-100 d-flex dropdown-theme justify-content-between align-items-center px-3 py-2'>
                <span className='text-truncate'>
                  {{
                    "": "Today",
                    0: "Yesterday",
                    1: "This Month",
                    2: "Previous Month",
                  }[dateFilter] || "Today"}
                </span>
                <span className='d-flex align-items-center ms-2'>
                  <span
                    style={{
                      borderLeft: "1px solid #ccc",
                      height: "20px",
                      margin: "0 8px",
                    }}></span>
                  {isDateOpen ? (
                    <FaChevronUp size={14} className='text-theme' />
                  ) : (
                    <FaChevronDown size={14} className='text-theme' />
                  )}
                </span>
              </button>

              {isDateOpen && (
                <ul
                  className='position-absolute darkcard p-2 rounded shadow-sm mt-2 w-100'
                  style={{ zIndex: 10 }}>
                  {["", "0", "1", "2"].map((filter, idx) => (
                    <li
                      key={filter}
                      onClick={() => handleDateFilterChange(filter)}
                      className={`py-2 px-3 list-unstyled pointer hover-list ${
                        dateFilter === filter ? "active-location" : ""
                      }`}>
                      {
                        ["Today", "Yesterday", "This Month", "Previous Month"][
                          idx
                        ]
                      }
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div
              className='input-group input-group-sm pe-2'
              style={{ width: "250px" }}>
              <input
                type='text'
                className='form-control font-size13 custom-inputborder '
                placeholder='Search project or ID…'
                value={query}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='row g-3'>
        {loadingProjects ? (
          <div className='col-12'>
            <div className='loading-indicator-dashboard'></div>
          </div>
        ) : filteredProjects.length ? (
          filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id || index}
              project={project}
              loadMoreRef={
                index === filteredProjects.length - 1 ? loadMoreRef : null
              }
              isFetchingNextPage={isFetchingNextPage}
              isLast={index === filteredProjects.length - 1}
            />
          ))
        ) : (
          <div className='col-12'>
            <div className='alert  alert-light darkcard-project text-center'>
              No projects match your filters.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
