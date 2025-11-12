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
import { FaUsers, FaProjectDiagram, FaUsersCog } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";
import { useLocation, Link, useNavigate } from "react-router";
import { IoMdArrowRoundBack } from "react-icons/io";

const TEAM_COLORS = ["#f04f4f", "#3b82f6"];

const ClientDashboard = () => {
  const dateRef = useRef(null);
  const { theme } = useContext(UserContext);
  const locationRef = useRef(null);
  const loadMoreRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const passedLocationId = location.state?.locationId ?? null;
  const passDateFilter = location.state?.dateFilter ?? "";
  const [locationId, setLocationId] = useState(passedLocationId);
  const [dateFilter, setDateFilter] = useState(passDateFilter);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const pieData = (error, quality) => [
    { name: "Error Rate", value: error },
    { name: "Quality Score", value: quality },
  ];
  const handleCityClick = (location) => {
    setLocationId(location.id);
    setIsOpen(false);
  };
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleResetLocation = () => {
    setLocationId(null);
    setIsOpen(false);
  };

  // Theme-based styles
  const cardStyle = {
    backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
    color: theme === "dark" ? "#ffffff" : "#000000",
  };

  const textColor = theme === "dark" ? "#ffffff" : "#000000";
  useEffect(() => {
    setLocationId(passedLocationId);
  }, [passedLocationId]);

  const { data: listLocation, isLoading } = useQuery({
    queryKey: ["listLocationData"],
    queryFn: async () => {
      const response = await apiClient.get("locations/dropdown");
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: clientCountData, isLoading: isClientCount } = useQuery({
    queryKey: ["clientCountData", locationId, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.append("location_id", locationId);
      if (dateFilter) params.append("date_filter", dateFilter);

      const response = await apiClient.get(
        `clients/profile/counts?${params.toString()}`
      );
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: projectsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingProjects,
  } = useInfiniteQuery({
    queryKey: ["projectsData", locationId, dateFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.append("location_id", locationId ?? "");
      params.append("date_filter", dateFilter ?? "");
      const res = await apiClient.get(
        `clients/profile/details?${params.toString()}&page=${pageParam}`
      );
      return res.data.data;
    },
    getNextPageParam: (lastPage) => {
      const nextPageUrl = lastPage.next_page_url;
      if (!nextPageUrl) return undefined;
      const match = nextPageUrl.match(/page=(\d+)/);
      return match ? parseInt(match[1], 10) : undefined;
    },
  });

  const cards = projectsData?.pages.flatMap((page) => page.data) || [];

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
  };

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

  const isResetDisabled = !dateFilter && !locationId;

  const handleReset = () => {
    setDateFilter("");
    setLocationId("");
  };

  return (
    <div className='px-2 py-3 mt-5'>
      <div className='position-relative'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h5 className='fw-bold mb-0'>Client Dashboard</h5>
          <div className='d-flex align-items-center gap-3'>
            {/* Location Dropdown */}
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

              {/* Dropdown list */}
              {isOpen && (
                <ul className='col-lg darkcard position-absolute end-0 dropdown-width mt-4 bg-white rounded-3 top-50 z-1 p-2'>
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
            {/* reset filter */}
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
      <div>
        <div className='row'>
          {/* Total Clients */}

          <div className='col-12 col-sm-4'>
            <div className='darkcard-project p-3 rounded '>
              <div className='d-flex align-items-center'>
                <div className='flex-grow-1'>
                  <h6 className='mb-1'>Total Clients</h6>
                  <h3 className='fw-bolder mb-0'>
                    {clientCountData?.client_count || "NA"}
                  </h3>
                </div>
                <FaUsers size={32} />
              </div>
            </div>
          </div>

          {/* Total Projects */}
          <div className='col-12 col-sm-4'>
            <Link to='/ProjectDashboard' className='text-decoration-none'>
              <div className='darkcard-project p-3 rounded'>
                <div className='d-flex align-items-center'>
                  <div className='flex-grow-1'>
                    <h6 className='mb-1'>Total Projects</h6>
                    <h3 className='fw-bolder mb-0'>
                      {clientCountData?.project_count || "NA"}
                    </h3>
                  </div>
                  <FaProjectDiagram size={32} />
                </div>
              </div>
            </Link>
          </div>
          {/* Total Teams */}
          <div className='col-12 col-sm-4'>
            <Link to='/TeamDashboard' className='text-decoration-none'>
              <div className='darkcard-project p-3 rounded'>
                <div className='d-flex align-items-center'>
                  <div className='flex-grow-1'>
                    <h6 className='mb-1'>Total Teams</h6>
                    <h3 className='fw-bolder mb-0'>
                      {clientCountData?.teams_count || "NA"}
                    </h3>
                  </div>
                  <FaUsersCog size={32} />
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className=' d-flex justify-content-between my-2 px-1'>
          <h5 className='fw-bold mt-2'>
            Explore Detailed Insights for Each Client
          </h5>
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
              <span className='d-flex  align-items-center ms-2'>
                <span
                  style={{
                    borderLeft: "1px solid #ccc",
                    height: "20px",
                    margin: "0 8px",
                  }}></span>
                {isDateOpen ? (
                  <FaChevronUp size={14} classname='text-theme' />
                ) : (
                  <FaChevronDown size={14} classname='text-theme' />
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
        </div>
        {!loadingProjects && !isClientCount ? (
          <div className=''>
            <div className='row g-3'>
              {cards.map((card, index) => (
                <div
                  key={card.id || index}
                  className='col-12 col-sm-6 col-lg-4'>
                  <div
                    className='p-3 rounded darkcard-project h-100'
                    style={cardStyle}>
                    <h6 className='fw-bold'>{card.client_name}</h6>

                    <div className='row text-center mt-3 g-2'>
                      <div className='col-4'>
                        <div className='darkcard-project rounded py-2'>
                          <p className='fs-5 fw-bold  mb-0'>
                            {card.total_chart_count || "NA"}
                          </p>
                          <small className='cardname-text'>Charts</small>
                        </div>
                      </div>
                      <div className='col-4'>
                        <div className='darkcard-project rounded py-2'>
                          <p className='fs-5 fw-bold  mb-0'>
                            {card.total_audit_count || "NA"}
                          </p>
                          <small className='cardname-text'>Audits</small>
                        </div>
                      </div>
                      <div className='col-4'>
                        <Link
                          to='/ViewProjects'
                          state={{ clientId: card.id }} // ✅ Pass clientId to ViewProjects
                          className='text-decoration-none'>
                          <div className='darkcard-project rounded py-2'>
                            <p className='fs-5 fw-bold mb-0'>
                              {card.project_count || "NA"}
                            </p>
                            <small className='cardname-text'>Projects</small>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Chart */}
                    <div
                      style={{ width: "100%", height: 200 }}
                      className='mt-3'>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={
                              pieData(
                                card.error_percentage,
                                card.over_all_quality
                              ).length > 0 &&
                              pieData(
                                card.error_percentage,
                                card.over_all_quality
                              ).some((d) => d.value > 0)
                                ? pieData(
                                    card.error_percentage,
                                    card.over_all_quality
                                  )
                                : [{ name: "No Data", value: 1 }] // set value=1 for visible grey pie
                            }
                            dataKey='value'
                            nameKey='name'
                            innerRadius={35}
                            outerRadius={60}
                            paddingAngle={3}
                            stroke='#fff'
                            strokeWidth={2}>
                            {(pieData(
                              card.error_percentage,
                              card.over_all_quality
                            ).length > 0 &&
                            pieData(
                              card.error_percentage,
                              card.over_all_quality
                            ).some((d) => d.value > 0)
                              ? pieData(
                                  card.error_percentage,
                                  card.over_all_quality
                                )
                              : [{ name: "No Data", value: 1 }]
                            ).map((entry, i) => (
                              <Cell
                                key={i}
                                fill={
                                  entry.name === "No Data"
                                    ? "#d3d3d3" // grey color
                                    : TEAM_COLORS[i % TEAM_COLORS.length]
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
                              name === "No Data"
                                ? ["", "No Data"]
                                : [value, name]
                            }
                          />

                          <Legend
                            verticalAlign='bottom'
                            align='center'
                            height={36}
                            content={({ payload }) => (
                              <ul className='list-unstyled d-flex justify-content-center gap-3 mb-0'>
                                {payload.map((entry, i) => (
                                  <li
                                    key={i}
                                    className='d-flex align-items-center'
                                    style={{
                                      color: textColor,
                                      fontSize: "0.9rem",
                                    }}>
                                    <span
                                      style={{
                                        display: "inline-block",
                                        width: 10,
                                        height: 10,
                                        backgroundColor: entry.color,
                                        marginRight: 6,
                                      }}></span>
                                    {entry.value}
                                    {entry.value !== "No Data" &&
                                      `: ${entry.payload.value}`}
                                  </li>
                                ))}
                              </ul>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {card.project_count > 0 ? (
                      <Link
                        to='/ViewProjects'
                        state={{ clientId: card.id }} // ✅ Pass clientId to ViewProjects
                        className='text-decoration-none'>
                        <div className='row mt-3 mx-1'>
                          <button className='btn btn-outline-primary btn-sm flex-fill'>
                            View Projects
                          </button>
                        </div>
                      </Link>
                    ) : (
                      <div className='row mt-3 mx-1'>
                        <button
                          className='btn btn-outline-secondary btn-sm flex-fill'
                          disabled>
                          No Projects
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={loadMoreRef} style={{ height: 1 }} />

              {isFetchingNextPage && (
                <div className='text-center my-3'>
                  <span className='spinner-border spinner-border-sm' />
                  <span className='ms-2'>Loading more...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='loading-indicator-dashboard' />
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
