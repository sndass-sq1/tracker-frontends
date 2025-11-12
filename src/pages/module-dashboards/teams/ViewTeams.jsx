/** @format */

import { useMemo, useState, useRef, useContext, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  FaUserTie,
  FaUsers,
  FaUserCheck,
  FaProjectDiagram,
  FaChevronDown,
  FaChevronUp,
  FaUserCog,
  FaLaptopCode,
  FaUserShield,
} from "react-icons/fa";
import { UserContext } from "../../../UserContext/UserContext";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";
import { useNavigate, Link, useLocation } from "react-router";
import { IoMdArrowRoundBack } from "react-icons/io";

const TEAM_COLORS = ["#3b82f6", "#10b981"];
const QUALITY_COLORS = ["#f59e0b", "#ef4444"];

const donutData = (charts, audits) => [
  { name: "Charts", value: charts || 0 },
  { name: "Audits", value: audits || 0 },
];

const qualityData = (error, quality) => [
  { name: "Quality", value: quality || 0 },
  { name: "Error", value: error || 0 },
];

function TeamCard({ team, loadMoreRef, isFetchingNextPage, isLast }) {
  const { theme } = useContext(UserContext);

  const teamData = donutData(team?.total_chart_count, team?.total_audit_count);
  const qualityChartData = qualityData(
    team?.error_percentage,
    team?.over_all_quality
  );

  return (
    <div className='col-12 col-md-6 col-lg-4'>
      <div className='card shadow-sm border-0 h-100'>
        <div className='card-body d-flex flex-column'>
          <div className='d-flex flex-column gap-1'>
            <h5 className='card-title mb-1 d-flex align-items-center'>
              <FaUsers className='me-2 ' /> {team.team_name || "NA"}
            </h5>

            <small
              className={`d-flex align-items-center ${
                theme === "dark" ? "text-muted-dark" : "text-muted-light"
              }`}>
              <FaUserTie className='me-2 ' /> Lead: {team.lead_name || "NA"}
            </small>

            <small
              className={`d-flex align-items-center ${
                theme === "dark" ? "text-muted-dark" : "text-muted-light"
              }`}>
              <FaUserCheck className='me-2' /> Manager:
              {team.manager_name || "NA"}
            </small>

            <small
              className={`d-flex align-items-center ${
                theme === "dark" ? "text-muted-dark" : "text-muted-light"
              }`}>
              <FaProjectDiagram className='me-2 ' /> Project:
              {team.project_name || "NA"}
            </small>

            <small
              className={`d-flex align-items-center ${
                theme === "dark" ? "text-muted-dark" : "text-muted-light"
              }`}>
              <FaProjectDiagram className='me-2 ' /> Project Head:
              {team.project_head_name || "NA"}
            </small>

            <small
              className={`d-flex align-items-center ${
                theme === "dark" ? "text-muted-dark" : "text-muted-light"
              }`}>
              <FaUserCog className='me-2 ' /> SME: {team.sme_name || "NA"}
            </small>
          </div>

          <div className='row text-center mt-3 g-2'>
            <div className='col-6'>
              <div className='darkcard-project rounded py-2'>
                <div className='fs-5 fw-bold'>{team.coder_count || "NA"}</div>
                <small className='mute-font'>Coders</small>
              </div>
            </div>
            <div className='col-6'>
              <div className='darkcard-project rounded py-2'>
                <div className='fs-5 fw-bold'>{team.auditor_count || "NA"}</div>
                <small className='mute-font'>Auditors</small>
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

                  {/* Optional centered text for No Data */}
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
                {team?.total_chart_count || 0}
              </span>
            </span>
            <span className='mute-font'>
              Audits:
              <span className='text-success fw-semibold'>
                {team?.total_audit_count || 0}
              </span>
            </span>

            <span className='mute-font'>
              Quality:
              <span className='text-warning fw-bold'>
                {team?.over_all_quality || 0}%
              </span>
            </span>
            <span className='mute-font'>
              Error:
              <span className='text-danger fw-semibold'>
                {team?.error_percentage || 0}%
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
        </div>
      </div>
    </div>
  );
}

export default function ViewTeams() {
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

  const { data: teamCountData, isLoading: isteamCountLoading } = useQuery({
    queryKey: ["teamCountData", locationId, dateFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (locationId) params.append("location_id", locationId);
        if (dateFilter) params.append("date_filter", dateFilter);

        const response = await apiClient.get(
          `teams/profile/counts?${params.toString()}`
        );
        return response.data?.data || {};
      } catch (error) {
        console.error("Error fetching team counts:", error);
        return {};
      }
    },
    staleTime: 5 * 60 * 1000,
  });
  const projectId = location.state?.projectId;
  const {
    data: teamsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingteams,
  } = useInfiniteQuery({
    queryKey: ["teamsData", locationId, projectId, dateFilter, query],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const params = new URLSearchParams();
        if (projectId) params.append("id", projectId);
        if (locationId) params.append("location_id", locationId);
        if (dateFilter) params.append("date_filter", dateFilter);
        if (query) params.append("search", query);

        const res = await apiClient.get(
          `teams/profile/details?${params.toString()}&page=${pageParam}`
        );
        return res.data.data || { data: [], next_page_url: null };
      } catch (error) {
        console.error("Error fetching teams:", error);
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

  const teams = useMemo(() => {
    return teamsData?.pages.flatMap((page) => page.data || []) || [];
  }, [teamsData]);

  const filteredTeams = useMemo(() => {
    if (!query) return teams;

    const searchTerm = query.toLowerCase();
    return teams.filter(
      (team) =>
        (team.team_name && team.team_name.toLowerCase().includes(searchTerm)) ||
        (team.lead_name && team.lead_name.toLowerCase().includes(searchTerm)) ||
        (team.manager_name &&
          team.manager_name.toLowerCase().includes(searchTerm))
    );
  }, [teams, query]);

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

    if (el) {
      const rect = el.getBoundingClientRect();
      const isAlreadyVisible =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth);

      if (isAlreadyVisible && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      } else {
        observer.observe(el);
      }
    }

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
    <div
      className='container-fluid mt-2'
      style={{
        backgroundColor: theme === "dark" ? "#111111" : "#f8f9fa",
        minHeight: "100vh",
      }}>
      <div className='position-relative'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h5 className='fw-bold mb-0' style={{ color: textColor }}>
            {filteredTeams[0]?.project_name || "NA"} Dashboard
          </h5>

          <div className='d-flex align-items-center gap-3'>
            {/* <div className='position-relative' ref={locationRef}>
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
            </div> */}
          </div>
        </div>
      </div>
      <div className='row mb-4'>
        {/* <div className='col-md-4 col-6 mb-2'>
          <div className='card p-3 border-0 shadow-sm'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <h6>Total Teams</h6>
                <h3>{teamCountData?.teams_count || 0}</h3>
              </div>
              <FaUsers size={32} />
            </div>
          </div>
        </div>

        <div className='col-md-4 col-6 mb-2'>
          <div className='card p-3 border-0 shadow-sm'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <h6>Total Coders</h6>
                <h3>{teamCountData?.total_coders || 0}</h3>
              </div>
              <FaLaptopCode size={32} />
            </div>
          </div>
        </div>
        <div className='col-md-4 col-6 mb-2'>
          <div className='card p-3 border-0 shadow-sm'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <h6>Total Auditors</h6>
                <h3>{teamCountData?.total_auditors || 0}</h3>
              </div>
              <FaUserShield size={32} />
            </div>
          </div>
        </div> */}
        <div className=' d-flex justify-content-between align-items-center mt-1'>
          <h5 className='fw-bold  text-center ms-3 '>
            Explore Detailed Insights for Each Team
          </h5>
          <div className='d-flex align-items-center gap-3 mt-1'>
            <div
              className='position-relative '
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
                      onClick={() => {
                        handleDateFilterChange(filter);
                        setIsDateOpen(false);
                      }}
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
              className='input-group input-group-sm'
              style={{ width: "250px" }}>
              <input
                type='text'
                className='form-control font-size13 custom-inputborder'
                placeholder='Search lead or ID…'
                value={query}
                onChange={handleSearchChange}
              />
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

      <div className='row g-3'>
        {loadingteams ? (
          <div className='col-12'>
            <div className='loading-indicator-dashboard'></div>
          </div>
        ) : filteredTeams.length ? (
          filteredTeams.map((team, index) => (
            <TeamCard
              key={team.id || index}
              team={team}
              loadMoreRef={
                index === filteredTeams.length - 1 ? loadMoreRef : null
              }
              isFetchingNextPage={isFetchingNextPage}
              isLast={index === filteredTeams.length - 1}
            />
          ))
        ) : (
          <div className='col-12'>
            <div className='alert alert-light darkcard-project text-center'>
              No teams match your filters.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
