import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";
import { changeTabTitle } from "../../../utils/changeTabTitle";
import { Link } from "react-router";
import { RiAccountPinCircleFill } from "react-icons/ri";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { ucFirst } from "../../../utils/ucFirst";
import { GiTrophyCup } from "react-icons/gi";
import { GiPodiumWinner } from "react-icons/gi";
import {
  Modal,
  Button,
  Spinner,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FiSliders, FiFolder, FiUsers } from "react-icons/fi";
import { IoCalendarClear } from "react-icons/io5";

const Dashboard = () => {
  changeTabTitle("Dashboard");
  const locationRef = useRef(null);
  const projectRef = useRef(null);
  const loaderRef = useRef();
  const dateRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [locationId, setLocationId] = useState(null);
  const [projectid, setProjectId] = useState(null);
  const [dashboardTeamId, setDashboardTeamId] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const { data: listLocation, isLoading } = useQuery({
    queryKey: ["listLocationData"],
    queryFn: async () => {
      const response = await apiClient.get("locations/dropdown");
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingProjects,
  } = useInfiniteQuery({
    queryKey: ["projectDropdown"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get(`projects/dropdown?page=${pageParam}`);
      return res.data.data;
    },
    getNextPageParam: (lastPage) => {
      const nextPageUrl = lastPage.next_page_url;
      if (!nextPageUrl) return undefined;

      const match = nextPageUrl.match(/page=(\d+)/);
      return match ? parseInt(match[1], 10) : undefined;
    },
    enabled: !!show,
  });

  const projectData = data?.pages.flatMap((page) => page.data) || [];

  const { data: teamList = [], isLoading: loadingTeams } = useQuery({
    queryKey: ["teamDropdown", selectedProjectId],
    queryFn: async () => {
      const res = await apiClient.get(
        `projects/teams/dropdown/${selectedProjectId}`
      );
      return Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
    },
    enabled: !!selectedProjectId && !!show,
  });
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: [
      "dashboardData",
      locationId,
      projectid,
      dashboardTeamId,
      dateFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.append("location_id", locationId);
      if (projectid) params.append("project_id", projectid);
      if (dashboardTeamId) params.append("team_id", dashboardTeamId);
      if (dateFilter) params.append("date_filter", dateFilter);

      const response = await apiClient.get(`dashboard?${params.toString()}`);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });
  const { data: productionData, isLoading: productionLoading } = useQuery({
    queryKey: [
      "productionData",
      locationId,
      projectid,
      dashboardTeamId,
      dateFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.append("location_id", locationId);
      if (projectid) params.append("project_id", projectid);
      if (dashboardTeamId) params.append("team_id", dashboardTeamId);
      if (dateFilter) params.append("date_filter", dateFilter);

      const response = await apiClient.get(
        `dashboard/coder-of-the-day?${params.toString()}`
      );
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: qualityData, isLoading: isQualityLoading } = useQuery({
    queryKey: [
      "qualityData",
      locationId,
      projectid,
      dashboardTeamId,
      dateFilter,
      selectedProjectId,
      selectedTeamId,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.append("location_id", locationId);
      if (projectid) params.append("project_id", projectid);
      if (dashboardTeamId) params.append("team_id", dashboardTeamId);
      if (dateFilter) params.append("date_filter", dateFilter);
      const response = await apiClient.get(
        `dashboard/get-quality?${params.toString()}`
      );
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    // setCountsOpen(false);
  };
  const handleCityClick = (location) => {
    setLocationId(location.id);
    setIsOpen(false);
  };

  const handleResetLocation = () => {
    setLocationId(null);
    setIsOpen(false);
  };

  const applyFilters = () => {
    setProjectId(selectedProjectId);
    setDashboardTeamId(selectedTeamId);
    handleClose();
  };

  useEffect(() => {
    setSelectedTeamId(null);
  }, [selectedProjectId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
      if (projectRef.current && !projectRef.current.contains(event.target)) {
        // setCountsOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getMedalIcon = () => {
    return (
      <span className="emoji-wrapper">
        <img
          className="emoji-image"
          src="/images/award.svg"
          alt="award-image"
        />
        <span className="emoji-number"></span>
      </span>
    );
  };
  const managerRole = dashboardData?.role_count?.find(
    (r) => r.manager_count !== undefined
  );

  const projectHeadRole = dashboardData?.role_count?.find(
    (r) => r.project_head_count !== undefined
  );
  const leadRole = dashboardData?.role_count?.find(
    (r) => r.lead_count !== undefined
  );
  const coderRole = dashboardData?.role_count?.find(
    (r) => r.coder_count !== undefined
  );
  const auditorRole = dashboardData?.role_count?.find(
    (r) => r.auditor_count !== undefined
  );
  const smeRole = dashboardData?.role_count?.find(
    (r) => r.sme_count !== undefined
  );
  const handleReset = () => {
    setSelectedProjectId("");
    setDateFilter("");
    setSelectedTeamId("");
    setProjectId("");
    setDashboardTeamId("");
  };
  const setFilterName = () => {
    if (!selectedProjectId) return "Overall-Project/Lead";
    const selectedProject = projectData.find(
      (project) => Number(project.id) === Number(selectedProjectId)
    );
    return selectedProject
      ? ucFirst(selectedProject.project_name)
      : "Overall-Project/Lead";
  };
  const isResetDisabled = !dateFilter && !selectedProjectId && !selectedTeamId;
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef.current, hasNextPage, isFetchingNextPage]);

  return (
    <div className="container-fluid">
      {!productionLoading || !dashboardLoading ? (
        <div>
          <div className="position-relative">
            <div className="d-flex justify-content-between">
              <h5 className="fs-5 t-title">
                <span className="d-flex align-items-center justify-content-center mt-1">
                  Dashboard
                </span>
              </h5>
              <button
                onClick={toggleDropdown}
                aria-expanded={isOpen}
                className="dashboard dropdown-theme py-0 px-3 mb-1 d-flex align-items-center justify-content-between text-nowrap"
              >
                {locationId === null
                  ? "Overall - location"
                  : listLocation?.data.find(
                      (location) => location.id === locationId
                    )?.district}
                <div className="d-flex align-items-center ">
                  <span className="ms-5 me-2">|</span>
                  <span>
                    {isOpen ? (
                      <FaChevronUp className="fs-6" />
                    ) : (
                      <FaChevronDown className="fs-6" />
                    )}
                  </span>
                </div>
              </button>
            </div>
            {isOpen && (
              <div ref={locationRef}>
                <ul className="col-lg darkcard position-absolute end-0 dropdown-width mt-4 bg-white rounded-3 top-50 z-1 p-2">
                  <li
                    className={`py-2 px-4 list-unstyled pointer hover-list ${locationId === null ? "active-location" : ""}`}
                    onClick={handleResetLocation}
                  >
                    Over all
                  </li>
                  <Link to={`/emp-dashboard`} className="profile-board">
                    <li
                      className={`py-2 px-4 list-unstyled pointer hover-list ${locationId === null ? "" : ""}`}
                      onClick={handleResetLocation}
                    >
                      Coder Dashboard
                    </li>
                  </Link>
                  {listLocation?.data.map((location) => (
                    <li
                      key={location.id}
                      className={`py-2 px-4 list-unstyled hover-list pointer ${locationId === location.id ? "active-location" : ""}`}
                      onClick={() => handleCityClick(location)}
                    >
                      {location.district}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="row g-3">
            <div className="col-12 col-sm-6 col-md-6 col-lg-2">
              <Link
                to="/clientDashboard"
                state={{ locationId: locationId, dateFilter: dateFilter }}
                style={{ textDecoration: "none" }}
              >
                <div className="card card-134 darkcard baseStyle card-one">
                  <div className="circleStyle circle-pink">
                    <img
                      src="/images/sme-dashboard/iconseven.svg"
                      alt="Clients"
                      className="icon-size"
                    />
                  </div>
                  <div className="ms-3 mt-3">
                    <p className="fw-bolder cardcount-text">
                      {dashboardData?.clients_count || "NA"}
                    </p>
                    <p className="font-normal  cardname-text">
                      {dashboardData?.clients_count > 1 ? "Clients" : "Client"}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-12 col-sm-6 col-md-6 col-lg-2">
              <Link
                to="/ProjectDashboard"
                state={{ locationId: locationId, dateFilter: dateFilter }}
                style={{ textDecoration: "none" }}
              >
                <div className="card card-134 darkcard baseStyle card-two">
                  <div className="circleStyle circle-orange">
                    <img
                      src="/images/sme-dashboard/iconfive.svg"
                      alt="Projects"
                      className="icon-size"
                    />
                  </div>
                  <div className="ms-3 mt-3">
                    <p className="fw-bolder cardcount-text">
                      {dashboardData?.projects_count || "NA"}
                    </p>
                    <p className="font-normal cardname-text">
                      {dashboardData?.projects_count > 1
                        ? "Projects"
                        : "Project"}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-12 col-sm-6 col-md-6 col-lg-2">
              <Link
                to="/TeamDashboard"
                state={{ locationId: locationId, dateFilter: dateFilter }}
                style={{ textDecoration: "none" }}
              >
                <div className="card card-134 darkcard  baseStyle card-three">
                  <div className="circleStyle circle-green">
                    <img
                      src="/images/superadmin-dashboard/adminteam.svg "
                      alt="Teams"
                      className="icon-size "
                    />
                  </div>
                  <div className="ms-3 mt-3">
                    <p className="fw-bolder cardcount-text">
                      {dashboardData?.teams_count || "NA"}
                    </p>

                    <p className="font-normal cardname-text">
                      {dashboardData?.teams_count > 1 ? "Teams" : "Team"}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-12 col-sm-6 col-md-6 col-lg-2">
              <Link
                to="/users"
                state={{
                  role_id: managerRole?.role_id,
                  location_id: locationId,
                }}
                style={{ textDecoration: "none" }}
              >
                <div className="card card-134 darkcard baseStyle card-four">
                  <div className="circleStyle circle-yellow">
                    <img
                      src="/images/sme-dashboard/iconsix.svg"
                      alt="Managers"
                      className="icon-size"
                    />
                  </div>
                  <div className="ms-3 mt-3">
                    {(() => {
                      const role = dashboardData?.role_count?.find(
                        (r) => r.manager_count !== undefined
                      );
                      const count = role?.manager_count || "NA";
                      return (
                        <>
                          <p className="fw-bolder cardcount-text">{count}</p>
                          <p className="font-normal cardname-text">
                            {count > 1 ? "Managers" : "Manager"}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </Link>
            </div>

            <div className="col-12 col-sm-6 col-md-6 col-lg-2">
              <Link
                to="/users"
                state={{
                  role_id: projectHeadRole?.role_id,
                  location_id: locationId,
                }}
                style={{ textDecoration: "none" }}
              >
                <div className="card card-134 darkcard baseStyle card-five">
                  <div className="circleStyle circle-skyblue">
                    <img
                      src="/images/superadmin-dashboard/adminprojecthead.svg"
                      alt="Project Heads"
                      className="icon-size"
                    />
                  </div>
                  <div className="ms-3 mt-3">
                    {(() => {
                      const role = dashboardData?.role_count?.find(
                        (r) => r.project_head_count !== undefined
                      );
                      const count = role?.project_head_count || "NA";
                      return (
                        <>
                          <p className="fw-bolder cardcount-text">{count}</p>
                          <p className="font-normal cardname-text">
                            {count > 1 ? "Project Heads" : "Project Head"}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </Link>
            </div>

            <div className="col-12 col-sm-6 col-md-6 col-lg-2">
              <Link
                to="/users"
                state={{
                  role_id: leadRole?.role_id,
                  location_id: locationId,
                }}
                style={{ textDecoration: "none" }}
              >
                <div className="card card-134 darkcard baseStyle card-six">
                  <div className="circleStyle circle-violet">
                    <img
                      src="/images/sme-dashboard/iconfour.svg"
                      alt="Leads"
                      className="icon-size"
                    />
                  </div>
                  <div className="ms-3 mt-3">
                    {(() => {
                      const role = dashboardData?.role_count?.find(
                        (r) => r.lead_count !== undefined
                      );
                      const count = role?.lead_count || "NA";
                      return (
                        <>
                          <p className="fw-bolder cardcount-text">{count}</p>
                          <p className="font-normal cardname-text">
                            {count > 1 ? "Leads" : "Lead"}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </Link>
            </div>

            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-md-6 col-lg-4">
                  <Link
                    to="/users"
                    state={{
                      role_id: coderRole?.role_id,
                      location_id: locationId,
                    }}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="card card-134 darkcard baseStyle card-seven">
                      <div className="circleStyle circle-lavender">
                        <img
                          src="/images/sme-dashboard/icontwo.svg"
                          alt="Coders"
                          className="icon-size"
                        />
                      </div>
                      <div className="ms-3 mt-3">
                        {(() => {
                          const role = dashboardData?.role_count?.find(
                            (r) => r.coder_count !== undefined
                          );
                          const count = role?.coder_count || "NA";
                          return (
                            <>
                              <p className="fw-bolder cardcount-text">
                                {count}
                              </p>
                              <p className="font-normal cardname-text">
                                {count > 1 ? "Coders" : "Coder"}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-sm-6 col-md-6 col-lg-4">
                  <Link
                    to="/users"
                    state={{
                      role_id: auditorRole?.role_id,
                      location_id: locationId,
                    }}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="card card-134 darkcard baseStyle card-eight">
                      <div className="circleStyle circle-blue">
                        <img
                          src="/images/sme-dashboard/iconone.svg"
                          alt="Auditors"
                          className="icon-size"
                        />
                      </div>
                      <div className="ms-3 mt-3">
                        {(() => {
                          const role = dashboardData?.role_count?.find(
                            (r) => r.auditor_count !== undefined
                          );
                          const count = role?.auditor_count || "NA";
                          return (
                            <>
                              <p className="fw-bolder cardcount-text">
                                {count}
                              </p>
                              <p className="font-normal cardname-text">
                                {count > 1 ? "Auditors" : "Auditor"}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="col-12 col-sm-6 col-md-6 col-lg-4">
                  <Link
                    to="/users"
                    state={{
                      role_id: smeRole?.role_id,
                      location_id: locationId,
                    }}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="card card-134 darkcard baseStyle card-nine">
                      <div className="circleStyle circle-lightblue">
                        <img
                          src="/images/superadmin-dashboard/adminsme.svg"
                          alt="SME"
                          className="icon-size"
                        />
                      </div>
                      <div className="ms-3 mt-3">
                        {(() => {
                          const role = dashboardData?.role_count?.find(
                            (r) => r.sme_count !== undefined
                          );
                          const count = role?.sme_count || "NA";

                          return (
                            <>
                              <p className="fw-bolder cardcount-text">
                                {count}
                              </p>
                              <p className="font-normal cardname-text">
                                {count > 1 ? "SMEs" : "SME"}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-12 col-sm-12 col-md-12 col-lg-12">
                  <div className="card  card-202 h-100  darkcard baseStyle card-ten">
                    <div className="card-body py-2 px-0">
                      {/* <h5 className="mx-2 fw-semibold fs-base lh-base text-nowrap customguide-background">
                        User Management
                      </h5> */}
                      <div className="d-flex mx-2 gap-3">
                        <Link
                          to="/users"
                          state={{ location_id: locationId }}
                          style={{ textDecoration: "none" }}
                        >
                          <div className=" bg-adminusers  lightcard  w-132 align-items-center ">
                            <div className="card-body p-1">
                              <div className="circleStyle circle-brinjal">
                                <img
                                  src="/images/sme-dashboard/totalusers.svg"
                                  alt="Auditors"
                                  className="icon-size"
                                />
                              </div>
                              <div className="ms-3 ">
                                <p className="fw-bolder cardcount-text">
                                  {dashboardData?.all_users_count || "NA"}
                                </p>
                                <p className="main">
                                  {dashboardData?.all_users_count > 1
                                    ? "Total Users"
                                    : "User"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                        <div className="bg-adminusers  lightcard w-500 ">
                          <div className="card-body d-flex justify-content-around  p-1 ">
                            <Link
                              to="/users/assign"
                              state={{ location_id: locationId }}
                              style={{ textDecoration: "none" }}
                            >
                              <div className="circleStyle circle-darkgreen">
                                <img
                                  src="/images/sme-dashboard/activeuser.svg"
                                  alt="Auditors"
                                  className="icon-size"
                                />
                              </div>
                              <div className="ms-3 ">
                                <p className="fw-bolder cardcount-text">
                                  {dashboardData?.assigned_count || "NA"}
                                </p>
                                <p className="main">
                                  {dashboardData?.assigned_count > 1
                                    ? "Assigned Coders & Auditors"
                                    : "Assigned Coder & Auditor"}
                                </p>
                              </div>
                            </Link>
                            <div className="grid-divider"></div>
                            <div>
                              <Link
                                to="/users/idle"
                                state={{ location_id: locationId }}
                                style={{ textDecoration: "none" }}
                              >
                                <div className="circleStyle circle-red">
                                  <img
                                    src="/images/sme-dashboard/inactiveuser.svg"
                                    alt="Auditors"
                                    className="icon-size"
                                  />
                                </div>
                                <div className="ms-3 ">
                                  <p className="fw-bolder cardcount-text">
                                    {dashboardData?.unassigned_count || "NA"}
                                  </p>
                                  <p className="main ">
                                    {dashboardData?.unassigned_count > 1
                                      ? "Unassigned Coders & Auditors"
                                      : "Unassigned Coder & Auditor"}
                                  </p>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-sm-12 col-md-12 col-lg-12 my-2">
              <div className="card darkcard  px-2 pt-2 mx-1 ">
                <div className="d-flex justify-content-between flex-wrap">
                  <h5 className="d-flex align-items-center fw-semibold fs-base lh-base text-nowrap customguide-background">
                    <RiAccountPinCircleFill className="fs-2 mr-1 location-icon icon-size me-1" />
                    Performance Overview
                  </h5>

                  <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                    <div
                      className="position-relative"
                      ref={dateRef}
                      style={{ width: "190px" }}
                    >
                      <button
                        onClick={() => setIsDateOpen(!isDateOpen)}
                        className="w-100 d-flex dropdown-theme justify-content-between align-items-center px-3 py-2"
                      >
                        <span className="text-truncate">
                          {{
                            "": "Today",
                            0: "Yesterday",
                            1: "This Month",
                            2: "Previous Month",
                          }[dateFilter] || "Today"}
                        </span>
                        <span className="d-flex align-items-center ms-2">
                          <span
                            style={{
                              borderLeft: "1px solid #ccc",
                              height: "20px",
                              margin: "0 8px",
                            }}
                          ></span>
                          {isDateOpen ? (
                            <FaChevronUp size={14} classname="text-theme" />
                          ) : (
                            <FaChevronDown size={14} classname="text-theme" />
                          )}
                        </span>
                      </button>

                      {isDateOpen && (
                        <ul
                          className="position-absolute darkcard p-2 rounded shadow-sm mt-2 w-100"
                          style={{ zIndex: 10 }}
                        >
                          {["", "0", "1", "2"].map((filter, idx) => (
                            <li
                              key={filter}
                              onClick={() => {
                                handleDateFilterChange(filter);
                                setIsDateOpen(false);
                              }}
                              className={`py-2 px-3 list-unstyled pointer hover-list ${
                                dateFilter === filter ? "active-location" : ""
                              }`}
                            >
                              {
                                [
                                  "Today",
                                  "Yesterday",
                                  "This Month",
                                  "Previous Month",
                                ][idx]
                              }
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <>
                      <div className="d-flex gap-2 pointer">
                        <div
                          className="position-relative"
                          ref={projectRef}
                          style={{ width: "190px" }}
                        >
                          <div
                            onClick={handleShow}
                            className="d-flex align-items-center dropdown-theme rounded  px-3 w-100 justify-content-between"
                          >
                            <p className="mb-0 font-size13 text-nowrap">
                              {setFilterName()}
                            </p>
                            <span className="d-flex align-items-center ms-2 pointer">
                              <span
                                style={{
                                  borderLeft: "1px solid #ccc",
                                  height: "20px",
                                  margin: "0 8px",
                                }}
                              ></span>
                              {show ? (
                                <FaChevronUp size={14} classname="text-theme" />
                              ) : (
                                <FaChevronDown
                                  size={14}
                                  classname="text-theme"
                                />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Modal show={show} onHide={handleClose} centered>
                        <Modal.Header className="darkcard">
                          <Modal.Title className="d-flex align-items-center gap-2">
                            <FiSliders /> Project/Team Filter
                          </Modal.Title>
                          <button
                            type="button"
                            className="btn-close ms-auto filtered-image"
                            aria-label="Close"
                            onClick={handleClose}
                          ></button>
                        </Modal.Header>

                        <Modal.Body className="darkcard">
                          {loadingProjects ? (
                            <div className="text-center py-5">
                              <Spinner animation="border" />
                            </div>
                          ) : (
                            <div className="d-flex border-theme rounded p-3 gap-4">
                              <div className="flex-fill pe-3 border-end">
                                <div className="d-flex align-items-center gap-2 mb-3 border border-1 rounded py-1 px-2">
                                  <FiFolder className="text-info fs-5" />
                                  <span className="fw-semibold">
                                    By Project
                                  </span>
                                </div>
                                <div
                                  style={{
                                    maxHeight: "300px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {projectData.length > 0 ? (
                                    projectData.map((proj) => (
                                      <Form.Check
                                        key={proj.id}
                                        type="radio"
                                        name="projectGroup"
                                        id={`project-${proj.id}`}
                                        checked={
                                          String(selectedProjectId) ===
                                          String(proj.id)
                                        }
                                        onChange={() =>
                                          setSelectedProjectId(String(proj.id))
                                        }
                                        className="mb-2"
                                        label={
                                          <label
                                            htmlFor={`project-${proj.id}`}
                                            className="mb-0 w-100 pointer"
                                          >
                                            {proj.project_name}
                                          </label>
                                        }
                                      />
                                    ))
                                  ) : (
                                    <div>No projects found</div>
                                  )}
                                  <div
                                    ref={loaderRef}
                                    className="text-center my-2"
                                  >
                                    {isFetchingNextPage && (
                                      <span>Loading more...</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex-fill ps-3">
                                <div className="d-flex align-items-center gap-2 mb-3 border border-1 rounded py-1 px-2">
                                  <FiUsers className="text-success fs-5" />
                                  <span className="fw-semibold">
                                    By Team Lead's
                                  </span>
                                </div>
                                {selectedProjectId ? (
                                  loadingTeams ? (
                                    <div>Loading teams...</div>
                                  ) : teamList.length > 0 ? (
                                    teamList.map((team) => (
                                      <Form.Check
                                        key={team.id}
                                        type="radio"
                                        name="teamGroup"
                                        id={`team-${team.id}`}
                                        checked={
                                          String(selectedTeamId) ===
                                          String(team.id)
                                        }
                                        onChange={() =>
                                          setSelectedTeamId(String(team.id))
                                        }
                                        className="mb-2"
                                        label={
                                          <label
                                            htmlFor={`team-${team.id}`}
                                            className="mb-0 w-100 pointer"
                                          >
                                            {team.lead_name || team.name}
                                          </label>
                                        }
                                      />
                                    ))
                                  ) : (
                                    <div className="darkcard">
                                      No teams found for this project
                                    </div>
                                  )
                                ) : (
                                  <div className="text-muted text-theme">
                                    Select a project first
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Modal.Body>

                        <Modal.Footer className="darkcard">
                          <Button
                            variant="outline-secondary"
                            className="cancel-btn"
                            onClick={handleClose}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={applyFilters}
                            disabled={!selectedProjectId}
                            style={{
                              backgroundColor: "#33B1FF",
                              border: "none",
                              padding: "10px 18px",
                              borderRadius: "6px",
                              color: "#ffffff",
                            }}
                            className="btn btn-primary   "
                          >
                            Apply Filter
                          </Button>
                        </Modal.Footer>
                      </Modal>
                      <div
                        className={
                          isResetDisabled ? " cursor-wrapper" : "cursor-pointer"
                        }
                      >
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="reset-tooltip">
                              <p>Reset Filter</p>
                            </Tooltip>
                          }
                        >
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
                            />
                          </div>
                        </OverlayTrigger>
                      </div>
                    </>
                  </div>
                </div>
                {/* END DROPDOWNS SECTION */}

                {/* Summary Cards */}
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-12 col-lg-12 px-1">
            <div className="card bg-adminusers darkcard   mb-2">
              {!isQualityLoading ? (
                <div className="card-body  d-flex justify-content-around ">
                  <div className="d-flex  justify-content-between align-items-center ">
                    <div className="circleStyle circle-lavender">
                      <IoCalendarClear className="text-white fs-3" />
                    </div>
                    <div className="ms-3">
                      <>
                        <p className="fw-bolder cardcount-text">
                          {qualityData?.total_chart_count || "NA"}
                        </p>
                        <p className="cardname-text mb-0">
                          {qualityData?.total_chart_count > 1
                            ? "Total Charts"
                            : "Total Chart"}
                        </p>
                      </>
                    </div>
                  </div>

                  <div className="grid-divider"></div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="circleStyle circle-blue">
                      <img
                        src="/images/superadmin-dashboard/assessment.svg"
                        alt="Charts"
                        className="icon-size"
                      />
                    </div>
                    <div className="ms-3">
                      <p className="fw-bolder cardcount-text">
                        {qualityData?.total_audit_count || "NA"}
                      </p>
                      <p className="cardname-text mb-0">
                        {qualityData?.total_audit_count > 1
                          ? "Total Audits"
                          : "Total Audit"}
                      </p>
                    </div>
                  </div>

                  {selectedProjectId && (
                    <>
                      <div className="grid-divider"></div>

                      <div className="d-flex justify-content-center align-items-center">
                        <div className="circleStyle ">
                          <img
                            src="images/coder-dashboard/quality3.svg"
                            alt="Charts"
                            className=""
                          />
                        </div>
                        <div className="ms-3">
                          <p className="fw-bolder cardcount-text">
                            {qualityData?.over_all_quality || "0"}%
                          </p>
                          <p className="cardname-text mb-0">
                            {qualityData?.over_all_quality > 1
                              ? "Chart Quality"
                              : "Chart Quality"}
                          </p>
                        </div>
                      </div>

                      <div className="grid-divider"></div>

                      <div className="d-flex justify-content-center align-items-center">
                        <div className="circleStyle ">
                          <img
                            src="/images/employee-dashboard/error.png"
                            alt="Audits"
                          />
                        </div>
                        <div className="ms-3">
                          <p className="fw-bolder cardcount-text">
                            {qualityData?.error_percentage || "0"}%
                          </p>
                          <p className="cardname-text mb-0">
                            {qualityData?.error_percentage > 1
                              ? "Erorr Percentage"
                              : "Erorr Percentage"}
                          </p>
                        </div>
                      </div>
                    </>
                    // ) : (
                    //   <div className="text-muted text-center mt-3 me-5">
                    //     Please select a project and team to view quality details
                    //   </div>
                  )}
                </div>
              ) : (
                <div className="loading-indicator-dashboard" />
              )}
            </div>
          </div>

          <div className="row  g-lg-2 g-md-3 g-sm-3 g-xs-2 darkcard my-1 mx-1 pt-1 pb-3 rounded-3 px-2">
            <div className="col-12 col-sm-12 col-md-12 col-lg-6">
              <div className="card shadow-sm darkcard">
                <div className="card-header header-skyblue">
                  <h2 className="h6 mb-0">
                    <GiPodiumWinner
                      icon="fa-solid fa-award"
                      size={14}
                      className="mr-2  icon-size-rank me-2 emoji-image"
                    />
                    Production Star of the Day
                  </h2>
                </div>
                <div className="card-body p-0 performance-table-body1">
                  <table className="table table-hover mb-0">
                    <thead className="thead-light">
                      <tr>
                        <th width="10%">Rank</th>
                        <th>Employee Id</th>
                        <th>Coder Name</th>
                        <th>Lead Name</th>
                        <th width="20%">Chart count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productionData?.production?.length > 0 ? (
                        productionData?.production.map((auditor, index) => (
                          <tr key={`auditor-${index}`}>
                            <td>{getMedalIcon(index)}</td>
                            <td>{auditor.employee_id || "NA"}</td>
                            <td> {ucFirst(auditor.user_name || "NA")}</td>
                            <td> {ucFirst(auditor.lead_name || "NA")}</td>
                            <td>{auditor.chart_count || "NA"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">
                            <div className="d-flex justify-content-center align-content-center align-items-center performance-table-body ">
                              No data found
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-12 col-lg-6">
              <div className="card shadow-sm darkcard">
                <div className="card-header header-skyblue">
                  <h2 className="h6 mb-0">
                    <GiTrophyCup
                      icon="fa-solid fa-award"
                      size={14}
                      className="mr-2  icon-size-rank me-2 emoji-image"
                    />
                    Quality Star of the Day
                  </h2>
                </div>
                <div className="card-body p-0 performance-table-body1">
                  <table className="table table-hover mb-0 ">
                    <thead className="thead-light">
                      <tr>
                        <th width="10%">Rank</th>
                        <th>Employee Id</th>
                        <th>Coder Name</th>
                        <th>Lead Name</th>
                        <th width="20%">Quality %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productionData?.quality?.length > 0 ? (
                        productionData?.quality.map((auditor, index) => (
                          <tr key={`auditor-${index}`}>
                            <td className="">{getMedalIcon(index)}</td>
                            <td>{auditor.employee_id || "NA"}</td>
                            <td> {ucFirst(auditor.user_name || "NA")}</td>
                            <td> {ucFirst(auditor.lead_name || "NA")}</td>
                            <td>{auditor.quality_percentage || "NA"} %</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">
                            <div className="d-flex justify-content-center align-content-center align-items-center performance-table-body ">
                              No data found
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading-indicator-dashboard" />
      )}
    </div>
  );
};

export default Dashboard;
