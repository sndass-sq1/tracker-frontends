import React, { useContext, useState } from "react";
import { FiMapPin } from "react-icons/fi";
import { CircularProgressbar } from "react-circular-progressbar";
import InternalQualityChart from "../../charts/InternalQualityChart";
import ErrorsDonoutChart from "../../charts/ErrorsDonoutChart";
import ProductionChart from "../../charts/ProductionChart";
import { Link, useLocation } from "react-router";
import apiClient from "../../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { changeTabTitle } from "../../../utils/changeTabTitle";
import { IoMdArrowRoundBack } from "react-icons/io";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Select from "react-select";
import { useDebouncedCallback } from "use-debounce";
import DropdownOptions from "../../../components/DropdownOptions";
import { FaChartLine } from "react-icons/fa";
import { PiChartLineDownBold } from "react-icons/pi";
import ProductionCountChart from "../../charts/ProductionCountChart";
import { ucFirst } from "../../../utils/ucFirst";
import { UserContext } from "../../../UserContext/UserContext";
import { formatDate } from "../../../utils/formatDate";
import { useEffect } from "react";

const EmployeDashboard = () => {
  changeTabTitle("Employee Dashboard");
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const location = useLocation();
  const { teamIdss } = location.state || {};
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployeeLabel, setSelectedEmployeeLabel] = useState(null);
  const [selectedEmpLogId, setSelectedEmpLogId] = useState(null);
  const [selectedEmpLogLabel, setSelectedEmpLogLabel] = useState(null);

  const { data: profileData } = useQuery({
    queryKey: ["profile", selectedEmployeeId, selectedEmpLogId],
    queryFn: async () => {
      const res = await apiClient.get(
        selectedEmpLogId == null
          ? `users/profile/${selectedEmployeeId}`
          : `users/profile/${selectedEmployeeId}/${selectedEmpLogId}`
      );

      return res.data;
    },
    enabled: !!selectedEmployeeId,
  });
  const dropdownEndpoints = {
    employee_id: teamIdss ? `users/emp-id/${teamIdss}` : "users/emp-id",
    emp_log_id: `users/emp-log-id/${selectedEmployeeId}`,
  };

  const dropdownFields = [
    {
      name: "employee_id",
      label: "Employee Id",
      isMulti: false,
      isMandatory: true,
    },
    {
      name: "emp_log_id",
      label: "Log Id",
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
  const errorData = [
    {
      name: "Added",
      value: Number(profileData?.data?.category_wise_error?.added || 0),
    },
    {
      name: "Updated",
      value: Number(profileData?.data?.category_wise_error?.updated || 0),
    },
    {
      name: "Deleted",
      value: Number(profileData?.data?.category_wise_error?.deleted || 0),
    },
    {
      name: "Admin Errors",
      value: Number(profileData?.data?.category_wise_error?.admin || 0),
    },
  ];

  const TOTAL_WEEKS = 5;

  const formattedQualityData =
    Array.isArray(profileData?.data?.weekly_quality) &&
    profileData?.data?.weekly_quality.length > 0
      ? profileData?.data?.weekly_quality.map((entry, index, arr) => ({
          week: `Week ${arr.length - index}`,
          quality: entry.quality,
        }))
      : Array.from({ length: TOTAL_WEEKS }, (_, i) => ({
          week: `Week ${TOTAL_WEEKS - i}`,
          quality: 0,
        }));

  const currentDay = new Date().getDate();
  const daysData = new Array(currentDay).fill(null).map((_, index) => {
    const dayData = profileData?.data?.daily_quality?.[index];
    return {
      name: `D${index + 1}`,
      value: dayData ? dayData.quality : 0,
    };
  });

  const productionData = profileData?.data?.production
    ? Object.entries(profileData?.data?.production).map(
        ([date, production]) => ({
          date,
          production,
        })
      )
    : [];
  const customStyles = (theme) => ({
    control: (base, state) => ({
      ...base,
      width: "130px",
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
  useEffect(() => {
    const empLogOptions =
      dropdowns.emp_log_id?.data?.pages?.reduce(
        (acc, page) => [...acc, ...page.data],
        []
      ) || [];

    if (
      selectedEmployeeId &&
      empLogOptions.length > 0 &&
      selectedEmpLogId === null
    ) {
      setSelectedEmpLogId(empLogOptions[0].value);
    }
  }, [dropdowns.emp_log_id?.data, selectedEmployeeId, selectedEmpLogId]);
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center m-2">
        <h5>Dashboard </h5>
        <div className="d-flex justify-content-between align-items-center gap-2">
          <>
            {dropdownFields.map(({ name, label, isMandatory }) => {
              const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
                dropdowns[name];
              const options =
                data?.pages?.reduce(
                  (acc, page) => [...acc, ...page.data],
                  []
                ) || [];

              return (
                <div className="emp-dashboard  mb-1  emp-id" key={name}>
                  <div
                    className="emp-dashboard d-flex justify-content-center align-items-center col-lg ms-2 px-1"
                    key={name}
                  >
                    <label
                      htmlFor={name}
                      className={`form-label fs-6 mx-2 mt-2 ${
                        isMandatory === true ? "" : ""
                      }`}
                    >
                      {label}
                    </label>

                    <Select
                      styles={customStyles(theme)}
                      classNamePrefix="custom-select"
                      isSearchable
                      isClearable
                      name={name}
                      options={options}
                      value={
                        name === "employee_id"
                          ? options.find(
                              (opt) => opt.value === selectedEmployeeId
                            ) ||
                            (selectedEmployeeId
                              ? {
                                  label: selectedEmployeeLabel,
                                  value: selectedEmployeeId,
                                }
                              : null)
                          : options.find(
                              (opt) => opt.value === selectedEmpLogId
                            ) ||
                            (selectedEmpLogId
                              ? {
                                  label: selectedEmpLogLabel,
                                  value: selectedEmpLogId,
                                }
                              : null)
                      }
                      onChange={(selectedOption) => {
                        if (name === "employee_id") {
                          setSelectedEmployeeId(selectedOption?.value);
                          setSelectedEmployeeLabel(selectedOption?.label);
                          setSelectedEmpLogId(null);
                        } else if (name === "emp_log_id") {
                          setSelectedEmpLogId(selectedOption?.value);
                          setSelectedEmpLogLabel(selectedOption?.label);
                        }
                      }}
                      onMenuScrollToBottom={() => {
                        if (hasNextPage && !isFetchingNextPage) {
                          fetchNextPage();
                        }
                      }}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </div>
              );
            })}
          </>
          <Link className="text-decoration-none" to={`/`}>
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
                    {ucFirst(profileData?.data?.employee_name || "")}
                  </h2>
                  <h2 className="fw-bolder fs-6 text-info">
                    {ucFirst(profileData?.data?.role_name || "")}
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
                    {profileData?.data?.employee_id || "NA"}
                  </div>
                </div>
                <div className="small  text-theme d-flex align-items-center mb-3">
                  <span className="fw-semibold  fs-6  text-theme">Email :</span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {profileData?.data?.email || "NA"}
                  </span>
                </div>

                <div className="small  text-theme d-flex align-items-center mb-3">
                  <span className="fw-semibold  fs-6  text-theme">
                    Login Name :
                  </span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {profileData?.data?.login_name || "NA"}
                  </span>
                </div>
                <div className="small  text-theme d-flex align-items-center mb-3">
                  <span className="fw-semibold  fs-6  text-theme">
                    Login Mail :
                  </span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {profileData?.data?.login_email || "NA"}
                  </span>
                </div>
                <div className="small  text-theme d-flex align-items-center mb-3">
                  <span className="fw-semibold  fs-6  text-theme">
                    Team Lead :
                  </span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {profileData?.data?.lead_name || "NA"}
                  </span>
                </div>

                <div className="small  text-theme d-flex align-items-center mb-3">
                  <span className="fw-semibold  fs-6  text-theme">
                    Project name :
                  </span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {profileData?.data?.project_name || "NA"}
                  </span>
                </div>

                <div className="small  text-theme d-flex align-items-center mb-2">
                  <span className="fw-semibold  fs-6  text-theme">
                    Mode of Work :
                  </span>
                  <span className="text-blue d-flex align-items-center fs-6 ms-1">
                    {ucFirst(profileData?.data?.work_mode || "NA")}
                  </span>
                </div>

                <div className="small  text-theme d-flex align-items-center ">
                  <span className="fw-semibold  fs-6  text-theme">
                    <FiMapPin className="me-1" />
                  </span>
                  <span className=" d-flex align-items-center fs-6 ms-1">
                    {profileData?.data?.location_name || "NA"}
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
                    {profileData?.data?.chart_quality || "NA"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-9 d-flex flex-column gap-2 ">
          <div className="row g-2">
            <div className="col-lg-7 col-md-12 col-sm-12">
              <div className="darkcard rounded shadow-sm top-card">
                <div className="d-flex  gap-4 p-4">
                  {profileData?.data?.role_name === "coder" ? (
                    <div className="d-flex flex-column align-items-center justify-content-center lightcard rounded p-3 total-card">
                      <div>
                        <img
                          src="/images/employee-dashboard/auditchart.svg"
                          className="w-75 ms-2"
                          alt="Audit Icon"
                        />
                      </div>
                      <h2 className="chart-head mt-3 fw-bolder cardcount-text">
                        {profileData?.data?.total_chart_count || "NA"}
                      </h2>
                      <p className="text-secondary text-center">Total Charts</p>
                    </div>
                  ) : profileData?.data?.role_name !== "auditor" ? (
                    <div className="d-flex flex-column align-items-center justify-content-center lightcard rounded p-3 total-card">
                      <div>
                        <img
                          src="/images/employee-dashboard/auditchart.svg"
                          className="w-75 ms-2"
                          alt="Audit Icon"
                        />
                      </div>
                      <h2 className="chart-head mt-3 fw-bolder cardcount-text">
                        {profileData?.data?.total_chart_count || "NA"}
                      </h2>
                      <p className="text-secondary text-center">
                        Charts & Audits
                      </p>
                    </div>
                  ) : null}

                  {profileData?.data?.role_name === "auditor" && (
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
                              {profileData?.data?.total_chart_count || "NA"}
                            </p>
                            <p className="main mt-2">
                              {profileData?.data?.total_chart_count > 1
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
                                {profileData?.data?.today_chart_count || "NA"}
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
                                {profileData?.data?.yesterday_chart_count ||
                                  "NA"}
                              </p>
                              <p className="main mt-2 "> Yesterday</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {profileData?.data?.role_name === "coder" && (
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
                          {profileData?.data?.total_audited_chart_count || "NA"}
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
                          {profileData?.data?.total_icd || "NA"}
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
                      {profileData?.data?.total_error_counts || "NA"}
                    </h2>
                    <p className="text-secondary text-center">Total Errors</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-12">
              <div className="darkcard rounded shadow-sm">
                <div className="d-flex flex-column align-items-center justify-content-center top-card">
                  <h2 className="mb-4 text-center pt-3 fw-bold fs-5">
                    {profileData?.data?.role_name === "coder"
                      ? "Chart Quality"
                      : profileData?.data?.role_name === "auditor"
                        ? "Error percentage"
                        : "Error Quality"}
                  </h2>
                  <CircularProgressbar
                    className="circlebar"
                    value={profileData?.data?.chart_quality || 0}
                    text={
                      profileData?.data?.chart_quality
                        ? `${profileData?.data?.chart_quality}%`
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
                <h2 className="text-center pt-3 fw-bold fs-5 mb-4">
                  Overall Quality Rating
                </h2>
                <div className="d-flex align-items-center gap-4  my-5">
                  {profileData?.data?.rating === "Poor" ? (
                    <div className="d-flex align-items-center gap-3 py-1 px-3 rounded  status-rejected">
                      <PiChartLineDownBold className=" fs-4" />
                      <span className="fs-5 fw-medium">
                        {profileData?.data?.rating || "NA"}
                      </span>
                    </div>
                  ) : profileData?.data?.rating === "Average" ? (
                    <>
                      <div className="d-flex align-items-center gap-3 py-1 px-3 rounded  status-average">
                        <FaChartLine className=" fs-4" />
                        <span className="fs-5 fw-medium">
                          {profileData?.data?.rating || "NA"}
                        </span>
                      </div>
                    </>
                  ) : profileData?.data?.rating === "Good" ? (
                    <>
                      <div className="d-flex align-items-center gap-3 py-1 px-3 rounded  status-pending">
                        <FaChartLine className=" fs-4" />
                        <span className="fs-5 fw-medium">
                          {profileData?.data?.rating || "NA"}
                        </span>
                      </div>
                    </>
                  ) : profileData?.data?.rating === "Excellent" ? (
                    <>
                      <div className="d-flex align-items-center gap-3 py-1 px-3 rounded  status-completed">
                        <FaChartLine className=" fs-4" />
                        <span className="fs-5 fw-medium">
                          {profileData?.data?.rating || "NA"}
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
            {profileData?.this_project !== clientR &&
              profileData?.data?.role_name !== "auditor" && (
                <div className="col-lg-5 col-md-12 col-sm-12">
                  <div className="darkcard p-2 rounded shadow-sm chart-card">
                    {/* <ExternalQualityChart /> */}

                    {/* {profileData?.data?.role_name === "auditor" ? (
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
                            {profileData?.data?.today_error_quality || "NA"}
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
                            
                            {profileData?.data?.yesterday_error_quality || "NA"}
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
                            
                            {profileData?.data?.this_month_error_quality || "NA"}
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
                            
                            {profileData?.data?.last_month_error_quality || "NA"}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : ( */}
                    <div className="">
                      <div className="text-center mt-3 fw-bold fs-5">
                        Error Category Wise
                      </div>
                      <table className="table mt-3 text-center table-borderless">
                        <thead>
                          <tr>
                            <th className=" fs-6  text-theme">Type</th>
                            <th className=" fs-6  text-theme">No. of Errors</th>
                            <th className=" fs-6  text-theme">
                              Contribution %
                            </th>
                          </tr>
                        </thead>
                        <tbody className="">
                          <tr>
                            <td className="text-theme">Added</td>
                            <td className="text-theme">
                              {profileData?.data?.category_wise_error?.added ||
                                "NA"}
                            </td>
                            <td className=" text-theme">
                              <span className="emp-contribution">
                                {profileData?.data?.contribution?.added || "NA"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-theme">Deleted</td>
                            <td className="text-theme">
                              {profileData?.data?.category_wise_error
                                ?.deleted || "NA"}
                            </td>
                            <td className=" text-theme">
                              <span className="emp-contribution">
                                {profileData?.data?.contribution?.deleted ||
                                  "NA"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-theme">Updated</td>
                            <td className="text-theme">
                              {profileData?.data?.category_wise_error
                                ?.updated || "NA"}
                            </td>
                            <td className=" text-theme">
                              <span className="emp-contribution">
                                {profileData?.data?.contribution?.updated ||
                                  "NA"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-theme ">Admin Errors</td>
                            <td className="text-theme">
                              {profileData?.data?.category_wise_error?.admin ||
                                "NA"}
                            </td>
                            <td>
                              <span className="emp-contribution">
                                {profileData?.data?.contribution?.admin || "NA"}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            {profileData?.this_project !== clientR ? (
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
                <p className="text-center pt-3 fw-bold fs-5">Project List</p>

                <div className="  pt-2 ps-4">
                  <p className="pb-2">
                    <span className="h6 chart-head">Project Name : </span>
                    {profileData?.data?.project_name || "NA"}
                  </p>
                  <p className="pb-2">
                    <span className="h6 chart-head">Lead Name : </span>
                    {profileData?.data?.lead_name || "NA"}
                  </p>
                  <p className="pb-2">
                    <span className="h6 chart-head">Total Charts : </span>
                    {profileData?.data?.total_chart_count || "NA"}
                  </p>
                  <p className="pb-2">
                    <span className="h6 chart-head">From : </span>
                    {profileData?.data
                      ? formatDate(profileData?.data?.from_data)
                      : "NA"}
                  </p>
                  <p className="pb-2">
                    <span className="h6 chart-head"> Status : </span>
                    {profileData?.data?.status === 1 ? (
                      <span className="badge ms-1">Active</span>
                    ) : profileData?.data?.status === 0 ? (
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
        {profileData?.this_project !== clientR &&
          profileData?.data?.role_name !== "auditor" && (
            <div className="col-lg-3 col-md-5 col-sm-12">
              <div className="darkcard rounded shadow-sm chart-card ">
                <ErrorsDonoutChart data={errorData} />
              </div>
            </div>
          )}

        <div
          className={
            profileData?.this_project == clientR ||
            profileData?.role_name === "auditor"
              ? "col-12"
              : "col-lg-9 col-md-7 col-sm-12"
          }
        >
          <div className="darkcard p-3 rounded shadow-sm chart-card">
            <ProductionChart data={daysData} />
          </div>
        </div>
      </div>
      {(!profileData?.data?.role_name ||
        profileData?.data?.role_name === "coder") && (
        <div className="row g-2 mt-1">
          {profileData?.this_project !== clientR ? (
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
          {profileData?.this_project !== clientR &&
            profileData?.data?.role_name !== "auditor" && (
              <div className="col-lg-4 col-md-12 col-sm-12">
                <div className="darkcard p-4 rounded shadow-sm chart-card">
                  <div className="">
                    <div className="text-center fw-bold fs-5 ">Admin Error</div>
                    <table className="table table-borderless mt-3 text-center">
                      <thead>
                        <tr>
                          <th className=" fs-6  text-theme">Types of Error</th>
                          <th className=" fs-6  text-theme">No. of Errors</th>
                        </tr>
                      </thead>
                      <tbody className="body-bg">
                        <tr>
                          <td className="text-theme">DOS Corrected</td>
                          <td className="text-theme">
                            {profileData?.data?.admin_errors?.dos_corrected ||
                              "NA"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-theme">POS Corrected</td>
                          <td className="text-theme">
                            {profileData?.data?.admin_errors?.pos_corrected ||
                              "NA"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-theme">DX Comment Corrected</td>
                          <td className="text-theme">
                            {profileData?.data?.admin_errors
                              ?.dx_level_comment_code_corrected || "NA"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-theme">RP Corrected</td>
                          <td className="text-theme">
                            {profileData?.data?.admin_errors?.rp_corrected ||
                              "NA"}
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
      {profileData?.role_name === "auditor" && (
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
export default EmployeDashboard;
