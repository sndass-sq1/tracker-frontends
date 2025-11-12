/** @format */

import React, { useState, useRef, useContext, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Spinner, Alert } from "react-bootstrap";
import { UserContext } from "../../../UserContext/UserContext";
import apiClient from "../../../services/apiClient";
import { formatDate } from "../../../utils/formatDate";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  FaProjectDiagram,
  FaChevronDown,
  FaChevronUp,
  FaUsers,
  FaUserTie,
  FaUserCheck,
  FaUserCog,
} from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";

const TEAM_COLORS = ["#3b82f6", "#06b6d4", "#10b981"];
const QUALITY_COLORS = ["#f59e0b", "#ef4444"];
const NO_DATA_COLOR = "#d3d3d3";

const TeamProfile = () => {
  const { theme } = useContext(UserContext);
  const navigate = useNavigate();
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("0");
  const dateRef = useRef(null);
  const [locationId, setLocationId] = useState("");
  const [page, setPage] = useState(1);
  const dateOptions = ["Today", "Yesterday", "This Month", "Previous Month"];
  const location = useLocation();
  const selectedRow = location.state?.id;

  const getteamProfile = async () => {
    if (!selectedRow) return null;
    try {
      const params = new URLSearchParams({
        id: selectedRow,
        page: page.toString(),
        ...(dateFilter !== "0" && { date_filter: dateFilter }),
        ...(locationId && { location_id: locationId }),
      });
      const response = await apiClient.get(
        `teams/profile/data?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const { data, isError, isLoading, error, refetch } = useQuery({
    queryKey: ["getteamProfile", selectedRow, dateFilter, locationId, page],
    queryFn: getteamProfile,
    staleTime: 5 * 60 * 1000,
    enabled: !!selectedRow,
  });

  useEffect(() => {
    if (selectedRow) refetch();
  }, [dateFilter, locationId, page, refetch, selectedRow]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedRow) {
    return (
      <Alert variant='warning' className='m-3'>
        No team selected. Please go back and select a team.
      </Alert>
    );
  }
  if (isLoading) return <div className='loading-indicator-dashboard' />;

  if (isError)
    return (
      <Alert variant='danger' className='m-3'>
        Error fetching team profile: {error.message}
      </Alert>
    );

  const teamData = data?.data?.data?.[0] || {};

  const teamSplitData = [
    { name: "Charts", value: teamData.total_chart_count || 0 },
    { name: "Audits", value: teamData.total_audit_count || 0 },
  ];

  const qualityData = [
    { name: "Quality", value: teamData.over_all_quality || 0 },
    { name: "Error", value: teamData.error_percentage || 0 },
  ];
  const hasData = qualityData.some((d) => d.value > 0);
  const hasTeamData = teamSplitData?.some((d) => d.value > 0);
  const cardStyle = {
    backgroundColor: theme === "dark" ? "#2c2c2c" : "#ffffff",
    color: theme === "dark" ? "#ffffff" : "#000000",
    border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6",
  };

  const isResetDisabled = !dateFilter;

  const handleReset = () => {
    setDateFilter("");
  };
  return (
    <div className='container-fluid py-3'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h4 className='mb-0'>{teamData.team_name || "NA"}</h4>
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
          <Link className='text-decoration-none' to={`/teams`}>
            <button
              className='btn btn-primary custom-primary-btn back-btn font-size13'
              onClick={() => navigate(`/teams`)}>
              <IoMdArrowRoundBack className='fs-5' />
            </button>
          </Link>
        </div>
      </div>

      <div className='row g-3 '>
        <div className='col-md-6'>
          <Card className='p-3 shadow-sm h-100'>
            <h5 className='card-title mb-1 d-flex align-items-center'>
              <FaUsers className='me-2' /> {teamData.team_name || "NA"}
            </h5>
            <small className='mute-font'>
              <FaUserTie className='me-2' /> Lead: {teamData.lead_name || "NA"}
            </small>

            <small className='mute-font'>
              <FaUserCheck className='me-2' /> Manager:
              {teamData.manager_name || "NA"}
            </small>

            <small className='mute-font'>
              <FaProjectDiagram className='me-2' /> Project:
              {teamData.project_name || "NA"}
            </small>

            <small className='mute-font'>
              <FaProjectDiagram className='me-2' /> Project Head:
              {teamData.project_head_name || "NA"}
            </small>

            <small className='mute-font'>
              <FaUserCog className='me-2' /> SME: {teamData.sme_name || "NA"}
            </small>
            <hr />
            <p>
              <b>Created By : </b> {teamData.created_by_name || "NA"}
            </p>
            <p>
              <b>Email : </b>
              <span className='mute-font'>
                {teamData.created_by_email || "NA"}
              </span>
            </p>
            <p>
              <b>Created At : </b>
              <span className='mute-font'>
                {formatDate(teamData.created_at || "NA")}
              </span>
            </p>
          </Card>
        </div>

        <div className='col-md-6'>
          <Card className='p-3 shadow-sm h-100'>
            <h6 className='fw-bold mb-2'>Team Analytics</h6>

            <div className='row text-center mt-3 g-2'>
              <div className='col-6'>
                <div className='darkcard-project rounded py-2'>
                  <div className='fs-5 fw-bold'>
                    {teamData.coder_count || "NA"}
                  </div>
                  <small>Coders</small>
                </div>
              </div>
              <div className='col-6'>
                <div className='darkcard-project rounded py-2'>
                  <div className='fs-5 fw-bold'>
                    {teamData.auditor_count || "NA"}
                  </div>
                  <small>Auditors</small>
                </div>
              </div>
            </div>

            <div className='row mt-3 g-3'>
              <div className='col-6'>
                <div className='darkcard-project rounded p-2' style={cardStyle}>
                  <div className='small fw-semibold mb-1'>Charts & Audits</div>
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
                              data={teamSplitData}
                              dataKey='value'
                              nameKey='name'
                              innerRadius={35}
                              outerRadius={55}>
                              {teamSplitData.map((_, i) => (
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
                <div className='darkcard-project rounded p-2' style={cardStyle}>
                  <div className='small fw-semibold mb-1'>Quality & Errors</div>
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
                                fill={QUALITY_COLORS[i % QUALITY_COLORS.length]}
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
                            name === "No Data" ? [0, "No Data"] : [value, name]
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

                    {/* Centered "No Data" text */}
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamProfile;
