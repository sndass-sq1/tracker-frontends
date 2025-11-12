/** @format */

import { useState, useEffect, useContext } from "react";
import { PiChartLineDownBold } from "react-icons/pi";
import { FaChartLine } from "react-icons/fa6";
import { FiMapPin } from "react-icons/fi";
import { CircularProgressbar } from "react-circular-progressbar";
import InternalQualityChart from "../../charts/InternalQualityChart";
import ErrorsDonoutChart from "../../charts/ErrorsDonoutChart";
import ProductionChart from "../../charts/ProductionChart";
import { Link } from "react-router";
import apiClient from "../../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { changeTabTitle } from "../../../utils/changeTabTitle";
import { useParams } from "react-router-dom";
import Select from "react-select";
import { useDebouncedCallback } from "use-debounce";
import DropdownOptions from "../../../components/DropdownOptions";
import { ucFirst } from "../../../utils/ucFirst";
import { IoMdArrowRoundBack } from "react-icons/io";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ProductionCountChart from "../../charts/ProductionCountChart";
import { UserContext } from "../../../UserContext/UserContext";
import { formatDate } from "../../../utils/formatDate";
const UserDashboard = () => {
  changeTabTitle("User Dashboard");
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const [selectedEmpLogId, setSelectedEmpLogId] = useState(null);
  const { id } = useParams();
  const getUserProfileById = async (profileId, empLogId) => {
    const url = empLogId
      ? `users/profile/${profileId}/${empLogId}`
      : `users/profile/${profileId}`;
    const response = await apiClient.get(url);
    return response.data;
  };

  const { data: userData, refetch } = useQuery({
    queryKey: ["getUserProfileById", id, selectedEmpLogId],
    queryFn: () => getUserProfileById(id, selectedEmpLogId),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
  useEffect(() => {
    setSelectedEmpLogId(null); // reset when profileId changes
  }, [id]);

  const dropdownEndpoints = {
    emp_log_id: `users/emp-log-id/${id}`,
  };

  const dropdownFields = [
    {
      name: "emp_log_id",
      label: "Log ID",
      isMulti: false,
      isMandatory: true,
    },
  ];

  const dropdowns = Object.keys(dropdownEndpoints).reduce((acc, key) => {
    acc[key] = DropdownOptions(dropdownEndpoints[key], key, optionSearchQuery);
    return acc;
  }, {});

  const handleInputChange = useDebouncedCallback((e) => {
    setOptionSearchQuery(e);
  }, 500);

  const handleEmpLogIdChange = (selectedOption) => {
    const empLogId = selectedOption?.value;
    setSelectedEmpLogId(empLogId);

    if (empLogId) {
      refetch();
    }
  };

  const errorData = [
    {
      name: "Added",
      value: Number(userData?.data?.category_wise_error?.added),
    },
    {
      name: "Updated",
      value: Number(userData?.data?.category_wise_error?.updated),
    },
    {
      name: "Deleted",
      value: Number(userData?.data?.category_wise_error?.deleted),
    },
    {
      name: "Admin Errors",
      value: Number(userData?.data?.category_wise_error?.admin),
    },
  ];

  const TOTAL_WEEKS = 5;

  const formattedQualityData =
    Array.isArray(userData?.data?.weekly_quality) &&
    userData?.data?.weekly_quality.length > 0
      ? userData?.data?.weekly_quality.map((entry, index, arr) => ({
          week: `Week ${arr.length - index}`,
          quality: entry.quality,
        }))
      : Array.from({ length: TOTAL_WEEKS }, (_, i) => ({
          week: `Week ${TOTAL_WEEKS - i}`,
          quality: 0,
        }));

  const currentDay = new Date().getDate();
  const daysData = new Array(currentDay).fill(null).map((_, index) => {
    const dayData = userData?.data?.daily_quality?.[index];
    return {
      name: `D${index + 1}`,
      value: dayData ? dayData.quality : 0,
    };
  });
  const productionData = userData?.data?.production
    ? Object.entries(userData?.data?.production).map(([date, production]) => ({
        date,
        production,
      }))
    : [];
  const customStyles = (theme) => ({
    control: (base, state) => ({
      ...base,
      width: "150px",
      borderRadius: "10px",
      borderColor: theme === "dark" ? "#888" : "#63606094",
      backgroundColor: theme === "dark" ? "#23272F" : "#fff",
      color: "#FFFFFF",
      outline: "none",
      boxShadow: state.isFocused ? "#33B1FF" : "none",
      "&:hover": {
        borderColor: "#33B1FF",
        cursor: "pointer",
      },
    }),
    option: (base, state) => ({
      ...base,

      width: "auto",
      backgroundColor: state.isSelected
        ? "#33B1FF"
        : state.isFocused
          ? theme === "dark"
            ? "#3b3f4b"
            : "#E9F9F7"
          : theme === "dark"
            ? "#2f3135"
            : "white",
      color: state.isSelected
        ? "white"
        : theme === "dark"
          ? "#f0f0f0"
          : "black",
      cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: theme === "dark" ? "#FFFFFF" : "#000000",
      fontSize: "13px",
    }),
    singleValue: (base) => ({
      ...base,
      color: theme === "dark" ? "#FFFFFF" : "#000000",
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      backgroundColor: "#fff",
      color: "#000",
      padding: 10,
      fontSize: "14px",
      fontWeight: "bold",
      // borderRadius: "4px",
      textAlign: "center",
      // padding: "10px !important",
      ...(theme === "dark" && {
        backgroundColor: "#222",
        color: "#fff",
      }),
    }),
  });
  const { theme } = useContext(UserContext);
  return (
    <div className="container-fluid">
      <div className=" d-flex justify-content-between align-items-center m-2">
        <h5>Dashboard </h5>
        <div className="d-flex justify-content-between align-items-center gap-2">
          <>
            {dropdownFields.map(({ name, label, isMulti, isMandatory }) => {
              const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
                dropdowns[name];
              const options =
                data?.pages?.reduce(
                  (acc, page) => [...acc, ...page.data],
                  []
                ) || [];

              return (
                <div
                  className="emp-dashboard d-flex justify-content-center align-items-center col-lg ms-2 px-1"
                  key={name}
                >
                  <label
                    htmlFor={name}
                    className={`form-label mx-2 mt-2 ${
                      isMandatory === true ? "" : ""
                    }`}
                  >
                    {label}
                  </label>

                  <Select
                    styles={customStyles(theme)}
                    classNamePrefix="custom-select"
                    className="font-size13"
                    // classNamePrefix="select"
                    isSearchable
                    name={name}
                    value={
                      options.find((opt) => opt.value === selectedEmpLogId) ||
                      null
                    }
                    options={options}
                    onChange={handleEmpLogIdChange}
                    onMenuScrollToBottom={() => {
                      if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                      }
                    }}
                    onInputChange={handleInputChange}
                  />
                </div>
              );
            })}
          </>
          <Link className="text-decoration-none" to={`/users`}>
            <OverlayTrigger
              overlay={<Tooltip className="text-cap">Back</Tooltip>}
              container={this}
              placement="top"
            >
              <button className="btn btn-primary custom-primary-btn back-btn font-size13">
                <IoMdArrowRoundBack className="fs-5" />
              </button>
            </OverlayTrigger>
          </Link>
        </div>
      </div>

      <div className="d-flex flex-column flex-lg-row gap-2 flex-grow-1">
        <div className="col-lg-3 d-flex flex-column gap-2">
          <div className="darkcard p-2 rounded-4 shadow-sm card-430">
            <div className="darkcard-ng text-white rounded  position-relative emp-card">
              <div className="rounded-circle ps-2 d-flex align-items-center position-absolute user">
                <img src="/images/employee-dashboard/employee.svg" alt="user" />
              </div>
              <div className=" pt-3 gap-2">
                <div className="d-flex flex-column justify-content-end align-items-center">
                  <h2 className="chart-head text-theme-ng">
                    {ucFirst(userData?.data?.employee_name || "")}
                  </h2>
                  <h2 className="fw-bolder fs-6 text-info">
                    {ucFirst(userData?.data?.role_name || "")}
                  </h2>
                </div>
              </div>
            </div>
            <div className="mt-3 ps-3">
              <div className="mt-2  text-secondary p-2">
                <div className="small  text-theme d-flex align-items-center mb-3">
                  <div className="fw-semibold  fs-6  text-theme me-2">
                    EMP ID :
                  </div>
                  <div className="text-blue d-flex align-items-center fs-6 ms-1">
                    {userData?.data?.employee_id || "NA"}
                  </div>
                </div>
                <div className="small  text-theme d-flex align-items-center mb-3">
                  <span className="fw-semibold  fs-6  text-theme">Email :</span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {userData?.data?.email || "NA"}
                  </span>
                </div>

                <div className="small  text-theme d-flex align-items-center mb-3">
                  <span className="fw-semibold  fs-6  text-theme">
                    Login Name :
                  </span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {userData?.data?.login_name || "NA"}
                  </span>
                </div>
                <div className="small  text-theme d-flex align-items-center mb-3">
                  <span className="fw-semibold  fs-6  text-theme">
                    Login Mail :
                  </span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {userData?.data?.login_email || "NA"}
                  </span>
                </div>
                <div className="small  text-theme d-flex align-items-center mb-3">
                  <span className="fw-semibold  fs-6  text-theme">
                    Team Lead :
                  </span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {userData?.data?.lead_name || "NA"}
                  </span>
                </div>
                <div className="small  text-theme d-flex align-items-center mb-3">
                  <span className="fw-semibold  fs-6  text-theme">
                    Project name :
                  </span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {userData?.data?.project_name || "NA"}
                  </span>
                </div>

                <div className="small  text-theme d-flex align-items-center mb-2">
                  <span className="fw-semibold  fs-6  text-theme">
                    Mode of Work :
                  </span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {userData?.data?.work_mode || "NA"}
                  </span>
                </div>

                <div className="small  text-theme d-flex align-items-center ">
                  <span className="fw-semibold  fs-6  text-theme">
                    <FiMapPin className="me-1" />
                  </span>
                  <span className=" d-flex align-items-center fs-6 ms-1">
                    {userData?.data?.location_name || "NA"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="row g-2">
            <div className="col-md-12 col-lg-12 col-sm-12">
              <div className="darkcard rounded shadow-sm qa-card">
                <div className="d-flex justify-content-between p-4">
                  <div className=" text-theme chart-tophead">Internal QA</div>
                  <div className="chart-head ">
                    {userData?.data?.chart_quality || "NA"}
                  </div>
                </div>
              </div>
            </div>
            {/* <div className='col-md-6 col-lg-12 col-sm-12'>
              <div className='darkcard rounded shadow-sm qa-card'>
                <div className='d-flex justify-content-between p-4'>
                  <div className='fw-medium fs-6 text-secondary'>
                    External QA
                  </div>
                  <div className='chart-head '>NA</div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
        <div className="col-lg-9 d-flex flex-column gap-2 ">
          <div className="row g-2">
            <div className="col-lg-7 col-md-12 col-sm-12">
              <div className="darkcard rounded shadow-sm top-card">
                <div className="d-flex  gap-4 p-4">
                  {userData?.data?.role_name === "coder" ? (
                    <div className="d-flex flex-column align-items-center justify-content-center lightcard rounded p-3 total-card">
                      <div>
                        <img
                          src="/images/employee-dashboard/auditchart.svg"
                          className="w-75 ms-2"
                          alt="Audit Icon"
                        />
                      </div>
                      <h2 className="chart-head mt-3 fw-bolder cardcount-text">
                        {userData?.data?.total_chart_count || "NA"}
                      </h2>
                      <p className="text-secondary text-center">Total Charts</p>
                    </div>
                  ) : userData?.data?.role_name !== "auditor" ? (
                    <div className="d-flex flex-column align-items-center justify-content-center lightcard rounded p-3 total-card">
                      <div>
                        <img
                          src="/images/employee-dashboard/auditchart.svg"
                          className="w-75 ms-2"
                          alt="Audit Icon"
                        />
                      </div>
                      <h2 className="chart-head mt-3 fw-bolder cardcount-text">
                        {userData?.data?.total_chart_count || "NA"}
                      </h2>
                      <p className="text-secondary text-center">
                        Charts & Audits
                      </p>
                    </div>
                  ) : null}

                  {userData?.data?.role_name === "auditor" && (
                    <div className="d-flex  gap-3 w-75">
                      <div className="card lightcard  border border-0  w-50 align-items-center ">
                        <div className="card-body p-1">
                          <img
                            src="/images/employee-dashboard/auditchart.svg"
                            className="w-50 ms-2 mt-2 "
                            alt="Audit Icon"
                          />

                          <div className="ms-3 mt-3">
                            <p className="fw-bolder cardcount-text fw-bolder cardcount-text">
                              {userData?.data?.total_chart_count || "NA"}
                            </p>
                            <p className="main mt-2">
                              {userData?.data?.total_chart_count > 1
                                ? "Audits count"
                                : "Audits counts"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="card lightcard  border border-0 w-100">
                        <div className="card-body d-flex justify-content-around  p-1 ">
                          <div>
                            <div className="rounded-circle d-flex align-items-center justify-content-center mt-2  logimage-today ">
                              <img
                                src="/images/coder-dashboard/Today.svg"
                                alt=""
                                className="log"
                              />
                            </div>
                            <div className="ms-3 mt-3">
                              <p className="fw-bolder cardcount-text">
                                {userData?.data?.today_chart_count || "NA"}
                              </p>
                              <p className="main mt-2"> Today</p>
                            </div>
                          </div>
                          <div className="grid-divider"></div>
                          <div>
                            <div className="rounded-circle d-flex align-items-center justify-content-center mt-2   logimage-yesterday">
                              <img
                                src="/images/coder-dashboard/yesterday.svg"
                                alt=""
                                className="log"
                              />
                            </div>
                            <div className="ms-3 mt-3">
                              <p className="fw-bolder cardcount-text">
                                {userData?.data?.yesterday_chart_count || "NA"}
                              </p>
                              <p className="main mt-2 "> Yesterday</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {userData?.data?.role_name === "coder" && (
                    <>
                      <div className="d-flex flex-column align-items-center justify-content-center lightcard rounded p-3 total-card">
                        <div>
                          <img
                            src="/images/employee-dashboard/icd.svg"
                            className="w-75 ms-2"
                            alt="ICD Icon"
                          />
                        </div>
                        <h2 className="chart-head mt-3 fw-bolder cardcount-text">
                          {userData?.data?.total_audited_chart_count || "NA"}
                        </h2>
                        <p className="text-secondary text-center text-nowrap">
                          Total Charts Audited
                        </p>
                      </div>

                      <div className="d-flex flex-column align-items-center justify-content-center lightcard rounded p-3 total-card">
                        <div>
                          <img
                            src="/images/employee-dashboard/icd.svg"
                            className="w-75 ms-2"
                            alt="ICD Icon"
                          />
                        </div>
                        <h2 className="chart-head mt-3 fw-bolder cardcount-text">
                          {userData?.data?.total_icd || "NA"}
                        </h2>
                        <p className="text-secondary text-center">
                          Total ICD's
                        </p>
                      </div>
                    </>
                  )}

                  <div className="d-flex flex-column align-items-center justify-content-center lightcard rounded p-3 total-card">
                    <div>
                      <img
                        src="/images/employee-dashboard/error.png"
                        className="w-75 ms-2"
                        alt="Error Icon"
                      />
                    </div>
                    <h2 className="chart-head mt-3 fw-bolder cardcount-text">
                      {userData?.data?.total_error_counts || "NA"}
                    </h2>
                    <p className="text-secondary text-center">Total Errors</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-12">
              <div className="darkcard rounded shadow-sm">
                <div className="d-flex flex-column align-items-center justify-content-center top-card">
                  <h2 className="mb-4 h4 text-center pt-3 chart-tophead">
                    {userData?.data?.role_name === "coder"
                      ? "Chart Quality"
                      : userData?.data?.role_name === "auditor"
                        ? "Error percentage"
                        : "Error Quality"}
                  </h2>
                  <CircularProgressbar
                    className="circlebar"
                    value={userData?.data?.chart_quality || 0}
                    text={
                      userData?.data?.chart_quality
                        ? `${userData?.data?.chart_quality}%`
                        : "NA"
                    }
                    styles={{
                      path: {
                        stroke: theme === "dark" ? "#33B1FF" : "#33B1FF", // same color but can customize
                      },
                      text: {
                        fill: theme === "dark" ? "#eee" : "#000",
                        fontWeight: 800,
                      },
                      trail: {
                        stroke: theme === "dark" ? "#444" : "#d6d6d6",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="d-flex flex-column align-items-center  justify-content-evenly top-card darkcard rounded shadow-sm">
                <h2 className="h5 text-center pt-3 chart-tophead mb-4">
                  Overall Quality Rating
                </h2>
                <div className="d-flex align-items-center gap-4  my-5">
                  {userData?.data?.rating === "Poor" ? (
                    <div className="d-flex align-items-center gap-3 py-1 px-3 rounded  status-rejected">
                      <PiChartLineDownBold className=" fs-4" />
                      <span className="fs-5 fw-medium">
                        {userData?.data?.rating || "NA"}
                      </span>
                    </div>
                  ) : userData?.data?.rating === "Average" ? (
                    <>
                      <div className="d-flex align-items-center gap-3 py-1 px-3 rounded  status-average">
                        <FaChartLine className=" fs-4" />
                        <span className="fs-5 fw-medium">
                          {userData?.data?.rating || "NA"}
                        </span>
                      </div>
                    </>
                  ) : userData?.data?.rating === "Good" ? (
                    <>
                      <div className="d-flex align-items-center gap-3 py-1 px-3 rounded  status-pending">
                        <FaChartLine className=" fs-4" />
                        <span className="fs-5 fw-medium">
                          {userData?.data?.rating || "NA"}
                        </span>
                      </div>
                    </>
                  ) : userData?.data?.rating === "Excellent" ? (
                    <>
                      <div className="d-flex align-items-center gap-3 py-1 px-3 rounded  status-completed">
                        <FaChartLine className=" fs-4" />
                        <span className="fs-5 fw-medium">
                          {userData?.data?.rating || "NA"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="d-flex align-items-center gap-3 py-1 px-3 rounded status-na ">
                      <FaChartLine className=" fs-4 " />
                      <span className=" ">NA</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="row g-2">
            {userData?.this_project !== clientR &&
              userData?.data?.role_name !== "auditor" && (
                <div className="col-lg-5 col-md-12 col-sm-12">
                  <div className="darkcard p-2 rounded shadow-sm chart-card">
                    {/* <ExternalQualityChart /> */}

                    {/* {userData?.data?.role_name === "auditor" ? (
                  <div className="p-3 rounded lightcard">
                    <h6 className="chart-tophead mb-3">Error Percentage</h6>

                    <div className="row text-center mt-1">
                      <div className="col-6 border-top d-flex  pt-2 mt-3 mb-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center mx-3  logimage-today">
                          <img
                            src="/images/coder-dashboard/Today.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                        <div>
                          
                          <h6>Today</h6>
                          <h5 className="fw-bolder cardcount-text">
                            {userData?.data?.today_error_quality || "NA"}
                          </h5>
                        </div>
                      </div>
                      <div className="col-6 border-top d-flex pt-2 mt-3 mb-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center mx-3  logimage-yesterday">
                          <img
                            src="/images/coder-dashboard/yesterday.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                        <div>
                          <h6>Yesterday</h6>
                          <h5 className="fw-bolder cardcount-text">
                            
                            {userData?.data?.yesterday_error_quality || "NA"}
                          </h5>
                        </div>
                      </div>

                      <div className="col-6 border-top d-flex  pt-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center mx-3  logimage-month">
                          <img
                            src="/images/coder-dashboard/past 7.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                        <div>
                          <h6>This Month</h6>
                          <h5 className="fw-bolder cardcount-text">
                            
                            {userData?.data?.this_month_error_quality || "NA"}
                          </h5>
                        </div>
                      </div>
                      <div className="col-6 border-top d-flex pt-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center mx-3  logimage-previous">
                          <img
                            src="/images/lead-dashboard/auditedchartprevious.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                        <div>
                          
                          <h6>Previous Month</h6>
                          <h5 className="fw-bolder cardcount-text">
                            
                            {userData?.data?.last_month_error_quality || "NA"}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : ( */}
                    <div className=" ">
                      <div className="text-center fw-bold fs-5 mt-3">
                        Error Category Wise
                      </div>
                      <table className="table text-center  mt-3">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>No. of Errors</th>
                            <th>Contribution %</th>
                          </tr>
                        </thead>
                        <tbody className="darkcard">
                          <tr>
                            <td className="text-theme">Added</td>
                            <td className="text-theme">
                              {userData?.data?.category_wise_error?.added ||
                                "NA"}
                            </td>
                            <td className="text-theme">
                              <span className="emp-contribution">
                                {userData?.data?.contribution?.added || "NA"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-theme">Deleted</td>
                            <td className="text-theme">
                              {userData?.data?.category_wise_error?.deleted ||
                                "NA"}
                            </td>
                            <td className=" text-theme">
                              <span className="emp-contribution">
                                {userData?.data?.contribution?.deleted || "NA"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-theme">Updated</td>
                            <td className="text-theme">
                              {userData?.data?.category_wise_error?.updated ||
                                "NA"}
                            </td>
                            <td className=" text-theme">
                              <span className="emp-contribution">
                                {userData?.data?.contribution?.updated || "NA"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-theme">Admin Errors</td>
                            <td className="text-theme">
                              {userData?.data?.category_wise_error?.admin ||
                                "NA"}
                            </td>
                            <td className=" text-theme">
                              <span className="emp-contribution">
                                {userData?.data?.contribution?.admin || "NA"}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            {userData?.this_project !== clientR ? (
              <div className="col-lg-4 col-md-12 col-sm-12">
                <div className="darkcard p-2 rounded shadow-sm chart-card">
                  <InternalQualityChart data={formattedQualityData} />
                </div>
              </div>
            ) : (
              <div className="col-lg-9 col-md-12 col-sm-12">
                <div className="darkcard p-2 rounded shadow-sm chart-card">
                  <InternalQualityChart data={formattedQualityData} />
                </div>
              </div>
            )}
            <div className="col-lg-3 col-md-12 col-sm-12">
              <div className="darkcard p-2 rounded shadow-sm chart-card">
                <p className="h5 text-center pt-3 chart-tophead">
                  Project List
                </p>

                <div className="  pt-2 ps-4">
                  <p className="pb-2">
                    <span className="h6 chart-head">Project Name : </span>
                    {userData?.data?.project_name || "NA"}
                  </p>
                  <p className="pb-2">
                    <span className="h6 chart-head">Lead Name : </span>
                    {userData?.data?.lead_name || "NA"}
                  </p>
                  <p className="pb-2">
                    <span className="h6 chart-head">Total Charts : </span>
                    {userData?.data?.total_chart_count || "NA"}
                  </p>
                  <p className="pb-2">
                    <span className="h6 chart-head">From : </span>
                    {userData?.data
                      ? formatDate(userData?.data?.from_data)
                      : "NA"}
                  </p>
                  <p className="pb-2">
                    <span className="h6 chart-head"> Status : </span>
                    {userData?.data?.status === 1 ? (
                      <span className="badge ms-1">Active</span>
                    ) : userData?.data?.status === 0 ? (
                      <span className="status-rejected ms-1">Inactive</span>
                    ) : (
                      <span>NA</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-2 mt-1">
        {userData?.this_project !== clientR &&
          userData?.data?.role_name !== "auditor" && (
            <div className="col-lg-3 col-md-5 col-sm-12">
              <div className="darkcard rounded shadow-sm chart-card">
                <ErrorsDonoutChart data={errorData} />
              </div>
            </div>
          )}

        <div
          className={
            userData?.this_project == clientR ||
            userData?.role_name === "auditor"
              ? "col-12"
              : "col-lg-9 col-md-7 col-sm-12"
          }
        >
          <div className="darkcard p-3 rounded shadow-sm chart-card">
            <ProductionChart data={daysData} />
          </div>
        </div>
      </div>
      {(!userData?.data?.role_name ||
        userData?.data?.role_name === "coder") && (
        <div className="row g-2 mt-1">
          {userData?.this_project !== clientR ? (
            <div className="col-lg-8 col-md-12 col-sm-12">
              <div className="darkcard p-2 rounded shadow-sm chart-card">
                <ProductionCountChart data={productionData} />
              </div>
            </div>
          ) : (
            <div className="col-lg-12 col-md-12 col-sm-12">
              <div className="darkcard p-2 rounded shadow-sm chart-card">
                <ProductionCountChart data={productionData} />
              </div>
            </div>
          )}
          {userData?.this_project !== clientR &&
            userData?.data?.role_name !== "auditor" && (
              <div className="col-lg-4 col-md-12 col-sm-12">
                <div className="darkcard p-4 rounded shadow-sm chart-card">
                  <div className="">
                    <div className="text-center fw-bold fs-5 mt-3">
                      Admin Error
                    </div>
                    <table className="table text-center mt-3">
                      <thead>
                        <tr>
                          <th>Types of Error</th>
                          <th>No. of Errors</th>
                        </tr>
                      </thead>
                      <tbody className="body-bg">
                        <tr>
                          <td className="text-theme">DOS Corrected</td>
                          <td className="text-theme">
                            {userData?.data?.admin_errors?.dos_corrected ||
                              "NA"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-theme">POS Corrected</td>
                          <td className="text-theme">
                            {userData?.data?.admin_errors?.pos_corrected ||
                              "NA"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-theme">DX Comment Corrected</td>
                          <td className="text-theme">
                            {userData?.data?.admin_errors
                              ?.dx_level_comment_code_corrected || "NA"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-theme">RP Corrected</td>
                          <td className="text-theme">
                            {userData?.data?.admin_errors?.rp_corrected || "NA"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
      {userData?.role_name === "auditor" && (
        <div className="row g-2 mt-1">
          <div className="col-lg-12 col-md-12 col-sm-12 ">
            <div className="darkcard p-2 rounded shadow-sm chart-card">
              <ProductionCountChart data={productionData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserDashboard;
