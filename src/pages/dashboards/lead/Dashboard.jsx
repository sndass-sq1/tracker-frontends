import { changeTabTitle } from "../../../utils/changeTabTitle";
import apiClient from "../../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState, useEffect, useContext } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import { IoCalendarClear } from "react-icons/io5";
import Select from "react-select";
import "react-circular-progressbar/dist/styles.css";
import ModelChart from "../../../components/ModelChart";
import ReactTable from "../../../components/ReactTable";
import { Link } from "react-router-dom";
import { ucFirst } from "../../../utils/ucFirst";
import { useNavigate } from "react-router";
import { Loader } from "../../../shared/Loader";
import { RiAccountPinCircleFill, RiArrowDropDownLine } from "react-icons/ri";
import {
  FaChevronDown,
  FaChevronUp,
  FaAward,
  FaCaretUp,
  FaCaretDown,
} from "react-icons/fa";
import { UserContext } from "../../../UserContext/UserContext";

const progressstyle = {
  root: {
    width: "72px",
    height: "72px",
  },

  trail: {
    stroke: "#d6d6d6",
    strokeWidth: 10,
  },
  text: {
    fill: "#000",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

changeTabTitle("Dashboard");

const getDashboardData = async () => {
  const response = await apiClient.get("dashboard");
  return response.data?.data;
};

const getChartStats = async (periodId) => {
  const response = await apiClient.get(
    `dashboard/chart-statistics/${periodId}`
  );
  return response.data?.data;
};

const getIdleUsers = async (periodId, page, perPage) => {
  const response = await apiClient.get(
    `dashboard/idle-users/${periodId}?page=${page}&perPage=${perPage}`
  );
  return response.data;
};

const Dashboard = () => {
  const dateRef = useRef(null);
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [isDateOpen, setIsDateOpen] = useState(false);
  const projectid = null;
  const [countsOpen, setCountsOpen] = useState(false);
  const { theme } = useContext(UserContext);
  const { data: DashboardData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
    staleTime: 5 * 60 * 1000,
  });

  const { data: chartData, isLoading: loadingChart } = useQuery({
    queryKey: ["chartStats", selectedPeriod],
    queryFn: () => getChartStats(selectedPeriod),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  const { data: idleUsersData } = useQuery({
    queryKey: ["idleUsers", selectedPeriod, page, perPage],
    queryFn: () => getIdleUsers(selectedPeriod, page, perPage),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  const columnsList = () => [
    {
      accessorKey: "name",
      header: "Name",
      editable: true,
      enableSorting: false,
      cell: (props) => <span>{ucFirst(props.getValue())}</span>,
    },
    {
      accessorKey: "employee_id",
      header: "Employee Id",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "location",
      header: "Location",
      editable: true,
      enableSorting: false,
    },
    {
      accessorKey: "role",
      header: "Role",
      editable: true,
      enableSorting: false,
      cell: (props) => <span>{ucFirst(props.getValue())}</span>,
    },
  ];
  let tableColumns = useMemo(() => columnsList(), [page]);

  const { data: userData } = useQuery({
    queryKey: ["getCurrentUser"],
    queryFn: async () => {
      const response = await apiClient.get("get-current-user-data");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboardData", projectid, dateFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (projectid) queryParams.append("project_id", projectid);
      if (dateFilter !== "" && dateFilter !== null && dateFilter !== undefined)
        queryParams.append("date_filter", dateFilter);

      const queryString = queryParams.toString();
      const endpoint = queryString ? `dashboard?${queryString}` : `dashboard`;

      const response = await apiClient.get(endpoint);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

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
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    setCountsOpen(false);
  };
  const [isOpen, setIsOpen] = useState(false);
  const periodOptions = [
    { value: 1, label: "Today" },
    { value: 0, label: "Yesterday" },
  ];
  return (
    <div className="container-fluid">
      {userData?.data.team_id === null ? (
        navigate("/accessDenied", {
          replace: true,
          state: {
            message: "You are not assign any team!!",
          },
        })
      ) : userData?.data.project_id === null ? (
        navigate("/accessDenied", {
          replace: true,
          state: {
            message: "You are not assign any project!",
          },
        })
      ) : !isLoading ? (
        <>
          <div className="d-flex justify-content-between">
            <h5 className="m-2">Dashboard</h5>
          </div>

          <>
            <div className="d-flex justify-content-between mb-2 flex-wrap">
              <div className="row align-items-center">
                <div className="col-12 col-sm-12 col-md-12 d-flex align-items-center gap-2 flex-wrap">
                  <div>
                    <p className="fs-5 fw-semibold project-text ">
                      <span className="mx-2"> Project :</span>
                      <span>{ucFirst(DashboardData?.project_name)}</span>
                    </p>
                  </div>
                  <div className="vertical-line mx-2"></div>
                  <p className="fs-6 fw-semibold coder-text ">
                    {DashboardData?.coder_count > 1 ? "Coders" : "Coder"}
                  </p>
                  <div className="badge-black me-3">
                    <p className="badge-text ">
                      {DashboardData?.coder_count || 0}
                    </p>
                  </div>
                  <div className="vertical-line mx-2"></div>
                  <p className="fs-6 fw-semibold coder-text ">
                    {DashboardData?.auditor_count > 1 ? "Auditors" : "Auditor"}
                  </p>
                  <div className="badge-black">
                    <p className="badge-text ">
                      {DashboardData?.auditor_count || 0}
                    </p>
                  </div>
                  <div className="vertical-line mx-2"></div>
                  <p className="fs-6 fw-semibold coder-text ">
                    {DashboardData?.sub_project_count > 1
                      ? " Sub Project Counts"
                      : " Sub Project Count"}
                  </p>
                  <div className="badge-black me-3">
                    <p className="badge-text ">
                      {DashboardData?.sub_project_count || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Link to={`/emp-dashboard`} className="profile-board">
                  <li className="py-2 px-4 list-unstyled pointer employee-button  ">
                    Employee Dashboard
                  </li>
                </Link>
              </div>
            </div>
            <div className="row g-3  mb-3">
              <div className="col-12 col-sm-12 col-md-12 col-lg-8">
                <div className="cusdom-Today d-flex justify-content-between p-3">
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column  ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.coder_today_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.coder_today_charts_count > 1
                            ? "Charts"
                            : "Chart"}
                        </div>
                      </div>

                      <div className="chart-text fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">Today</span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column  ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.auditor_today_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.auditor_today_charts_count > 1
                            ? "Audits"
                            : "Audit"}
                        </div>
                      </div>

                      <div className="chart-text fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">Today</span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.audited_today_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.audited_today_charts_count > 1
                            ? "Audited Charts"
                            : "Audited Chart"}
                        </div>
                      </div>

                      <div className="chart-text fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">Today</span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center  flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.error_today_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.error_today_charts_count > 1
                            ? "Error Charts"
                            : "Error Chart"}
                        </div>
                      </div>

                      <div className="chart-text fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">Today</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-12 col-md-12 col-lg-4">
                <div className=" cusdom-Today px-3 py-2  ">
                  <div className="d-flex justify-content-between ">
                    <div className="d-grid align-content-between mt-4">
                      <img
                        src="images/lead-dashboard/dashboardlead11.svg"
                        className="sheild-icon "
                        alt="img"
                      />
                      <div className="main fw-normal  mt-2">Chart Quality</div>
                      <div className="chart-text fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">Today</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between gap-2 align-items-center ">
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.internal_quality_today_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.internal_quality_today_charts_count
                              ? `${DashboardData?.internal_quality_today_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">Internal</div>
                      </div>
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.external_quality_today_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.external_quality_today_charts_count
                              ? `${DashboardData?.external_quality_today_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">External</div>
                      </div>
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.overall_quality_today_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.overall_quality_today_charts_count
                              ? `${DashboardData?.overall_quality_today_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">Overall</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3  mb-3">
              <div className="col-12 col-sm-12 col-md-12 col-lg-8">
                <div className="cusdom-yesterday d-flex justify-content-between p-3">
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center  flex-column  ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.coder_yesterday_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.coder_yesterday_charts_count > 1
                            ? "Charts"
                            : "Chart"}
                        </div>
                      </div>

                      <div className="chart-text-2 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Yesterday
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center  flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.auditor_yesterday_charts_count ||
                            "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.auditor_yesterday_charts_count > 1
                            ? "Audits"
                            : "Audit"}
                        </div>
                      </div>

                      <div className="chart-text-2 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Yesterday
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.audited_yesterday_charts_count ||
                            "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.audited_yesterday_charts_count > 1
                            ? "Audited Charts"
                            : "Audited Chart"}
                        </div>
                      </div>

                      <div className="chart-text-2 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Yesterday
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.error_yesterday_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.error_yesterday_charts_count > 1
                            ? "Error Charts"
                            : "Error Chart"}
                        </div>
                      </div>

                      <div className="chart-text-2 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Yesterday
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-12 col-md-12 col-lg-4">
                <div className=" cusdom-yesterday  px-3 py-2  ">
                  <div className="d-flex justify-content-between ">
                    <div className="d-grid align-content-between mt-4">
                      <img
                        src="images/lead-dashboard/dashboardlead12.svg"
                        className="sheild-icon "
                        alt="img"
                      />
                      <div className="main fw-normal  mt-2">Chart Quality</div>
                      <div className="chart-text-2 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Yesterday
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between gap-2 align-items-center ">
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.internal_quality_yesterday_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.internal_quality_yesterday_charts_count
                              ? `${DashboardData?.internal_quality_yesterday_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">Internal</div>
                      </div>
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.external_quality_yesterday_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.external_quality_yesterday_charts_count
                              ? `${DashboardData?.external_quality_yesterday_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">External</div>
                      </div>
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.overall_quality_yesterday_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.overall_quality_yesterday_charts_count
                              ? `${DashboardData?.overall_quality_yesterday_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">Overall</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3  mb-3">
              <div className="col-12 col-sm-12 col-md-12 col-lg-8">
                <div className="cusdom-thismonth  d-flex justify-content-between   p-3">
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.coder_this_month_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.coder_this_month_charts_count > 1
                            ? "Charts"
                            : "Chart"}
                        </div>
                      </div>

                      <div className="chart-text-3 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          This month
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center  flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.auditor_this_month_charts_count ||
                            "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.auditor_this_month_charts_count > 1
                            ? "Audits"
                            : "Audit"}
                        </div>
                      </div>

                      <div className="chart-text-3 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          This month
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center  flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.audited_this_month_charts_count ||
                            "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.audited_this_month_charts_count > 1
                            ? "Audited Charts"
                            : "Audited Chart"}
                        </div>
                      </div>

                      <div className="chart-text-3 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          This month
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.error_this_month_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.error_this_month_charts_count > 1
                            ? "Error Charts"
                            : "Error Chart"}
                        </div>
                      </div>

                      <div className="chart-text-3 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          This month
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-12 col-md-12 col-lg-4">
                <div className="  cusdom-thismonth px-3 py-2  ">
                  <div className="d-flex justify-content-between ">
                    <div className="d-grid align-content-between mt-4">
                      <img
                        src="images/lead-dashboard/dashboardlead13.svg"
                        className="sheild-icon "
                        alt="img"
                      />
                      <div className="main fw-normal  mt-2">Chart Quality</div>
                      <div className="chart-text-3 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          This month
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between gap-2 align-items-center ">
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.internal_quality_this_month_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.internal_quality_this_month_charts_count
                              ? `${DashboardData?.internal_quality_this_month_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">Internal</div>
                      </div>
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.external_quality_this_month_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.external_quality_this_month_charts_count
                              ? `${DashboardData?.external_quality_this_month_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">External</div>
                      </div>
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.overall_quality_this_month_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.overall_quality_this_month_charts_count
                              ? `${DashboardData?.overall_quality_this_month_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">Overall</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3  mb-3">
              <div className=" col-12 col-sm-12 col-md-12 col-lg-8">
                <div className="cusdom-lastmonth d-flex justify-content-between   p-3">
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.coder_previous_month_charts_count ||
                            "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.coder_previous_month_charts_count > 1
                            ? " Charts"
                            : " Chart"}
                        </div>
                      </div>

                      <div className="chart-text-4 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Previous month
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-22">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.auditor_previous_month_charts_count ||
                            "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.auditor_previous_month_charts_count >
                          1
                            ? "Audits"
                            : "Audit"}
                        </div>
                      </div>

                      <div className="chart-text-4 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Previous month
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.audited_previous_month_charts_count ||
                            "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.audited_previous_month_charts_count >
                          1
                            ? "Audited Charts"
                            : "Audited Chart"}
                        </div>
                      </div>

                      <div className="chart-text-4 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Previous month
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center  flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.error_previous_month_charts_count ||
                            "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.error_previous_month_charts_count > 1
                            ? "Error Charts"
                            : "Error Chart"}
                        </div>
                      </div>

                      <div className="chart-text-4 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Previous month
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-12 col-md-12 col-lg-4">
                <div className=" cusdom-lastmonth px-3 py-2 ">
                  <div className="d-flex justify-content-between ">
                    <div className="d-grid align-content-between mt-4">
                      <img
                        src="images/lead-dashboard/dashboardlead14.svg"
                        className="sheild-icon "
                        alt="img"
                      />
                      <div className="main fw-normal  mt-2">Chart Quality</div>
                      <div className="chart-text-4 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Previous month
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between gap-2 align-items-center ">
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.internal_quality_previous_month_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.internal_quality_previous_month_charts_count
                              ? `${DashboardData?.internal_quality_previous_month_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">Internal</div>
                      </div>
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.external_quality_previous_month_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.external_quality_previous_month_charts_count
                              ? `${DashboardData?.external_quality_previous_month_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">External</div>
                      </div>
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.overall_quality_previous_month_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.overall_quality_previous_month_charts_count
                              ? `${DashboardData?.overall_quality_previous_month_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">Overall</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3  mb-3">
              <div className="col-12 col-sm-12 col-md-12 col-lg-8">
                <div className="cusdom-total d-flex justify-content-between   p-3">
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2 ">
                          {DashboardData?.coder_total_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.coder_total_charts_count > 1
                            ? "Charts"
                            : "Chart"}
                        </div>
                      </div>

                      <div className="chart-text-6 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Total charts
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.auditor_total_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.auditor_total_charts_count > 1
                            ? "Audits"
                            : "Audit"}
                        </div>
                      </div>

                      <div className="chart-text-6 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Total audits
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.audited_total_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.audited_total_charts_count > 1
                            ? " Audited Charts"
                            : " Audited Chart"}
                        </div>
                      </div>

                      <div className="chart-text-6 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Total audited charts
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="vertical-cardline mx-3"></div>
                  <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                    <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                      <div className=" gap-2">
                        <div className="text-theme fw-bold fs-2">
                          {DashboardData?.error_total_charts_count || "NA"}
                        </div>
                        <div className="main fw-normal  mt-4">
                          {DashboardData?.error_total_charts_count > 1
                            ? "Error Charts"
                            : "Error Chart"}
                        </div>
                      </div>

                      <div className="chart-text-6 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Total error charts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-12 col-md-12 col-lg-4">
                <div className="  cusdom-total px-3 py-2 ">
                  <div className="d-flex justify-content-between ">
                    <div className="d-grid align-content-between mt-4">
                      <img
                        src="images/lead-dashboard/dashboardlead15.svg"
                        className="sheild-icon "
                        alt="img"
                      />
                      <div className="main fw-normal  mt-2">Chart Quality</div>
                      <div className="chart-text-6 fw-bold mt-3 text-nowrap">
                        <IoCalendarClear className="me-1" />

                        <span className="text-center  fw-normal">
                          Total chart quality
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between gap-2 align-items-center ">
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.internal_quality_total_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.internal_quality_total_charts_count
                              ? `${DashboardData?.internal_quality_total_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">Internal</div>
                      </div>
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.external_quality_total_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.external_quality_total_charts_count
                              ? `${DashboardData?.external_quality_total_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">External</div>
                      </div>
                      <div>
                        <CircularProgressbar
                          value={
                            DashboardData?.overall_quality_total_charts_count ||
                            0
                          }
                          text={
                            DashboardData?.overall_quality_total_charts_count
                              ? `${DashboardData?.overall_quality_total_charts_count}%`
                              : "NA"
                          }
                          styles={{
                            ...progressstyle,
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
                        <div className="text-center">Overall</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3 lead-dashboard mb-3 ">
              <div className="col-12 col-sm-12 col-md-12 col-lg-12  rounded-4">
                <div className="card   darkcard ">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="fw-bold fs-5">
                        Chart count based on sub project
                      </div>
                    </div>
                    <div className="row g-3 row-cols-lg-5 row-cols-md-2 row-cols-sm-1">
                      <div className=" sub-project">
                        <div className="card lightcard cusdom-Today border-0  ">
                          <div className="  card-body d-flex flex-column justify-content-between">
                            <div className=" container  d-flex justify-content-center align-items-center">
                              <ul className="">
                                {DashboardData?.sub_project_today?.length >
                                0 ? (
                                  DashboardData?.sub_project_today.map(
                                    (project, index) => (
                                      <>
                                        <li key={index}>
                                          {project.sub_project_name} - C:
                                          {project.count}
                                        </li>
                                      </>
                                    )
                                  )
                                ) : (
                                  <p className=" ">No Data Available</p>
                                )}
                              </ul>
                            </div>
                            <div className="chart-text fw-bold mt-3">
                              <IoCalendarClear className="me-1" />
                              <span className="text-center fw-normal">
                                Today
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="sub-project">
                        <div className="card cusdom-yesterday lightcard border-0 ">
                          <div className="card-body  d-flex flex-column justify-content-between">
                            <div className=" container  d-flex justify-content-center align-items-center">
                              <ul className="sub-project-text">
                                {DashboardData?.sub_project_yesterday?.length >
                                0 ? (
                                  DashboardData?.sub_project_yesterday.map(
                                    (project, index) => (
                                      <li key={index}>
                                        {project.sub_project_name} - C:
                                        {project.count}
                                      </li>
                                    )
                                  )
                                ) : (
                                  <p className="">No Data Available</p>
                                )}
                              </ul>
                            </div>

                            <div className="chart-text-2 fw-bold mt-3">
                              <IoCalendarClear className="me-1" />
                              <span className="text-center fw-normal">
                                Yesterday
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="sub-project">
                        <div className="card cusdom-thismonth lightcard border-0 ">
                          <div className="card-body  d-flex flex-column justify-content-between">
                            <div className=" container d-flex justify-content-center align-items-center">
                              <ul className="sub-project-text">
                                {DashboardData?.sub_project_this_month?.length >
                                0 ? (
                                  DashboardData?.sub_project_this_month.map(
                                    (project, index) => (
                                      <li key={index}>
                                        {project.sub_project_name} - C:
                                        {project.count}
                                      </li>
                                    )
                                  )
                                ) : (
                                  <p className=" ">No Data Available</p>
                                )}
                              </ul>
                            </div>

                            <div className="chart-text-3 fw-bold mt-3">
                              <IoCalendarClear className="me-1" />
                              <span className="text-center fw-normal">
                                Previous Month
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="sub-project">
                        <div className="card lightcard cusdom-lastmonth border-0 ">
                          <div className="card-body  d-flex flex-column justify-content-between">
                            <div className=" container  d-flex justify-content-center align-items-center">
                              <ul className="sub-project-text">
                                {DashboardData?.sub_project_previous_month
                                  ?.length > 0 ? (
                                  DashboardData?.sub_project_previous_month.map(
                                    (project, index) => (
                                      <li key={index}>
                                        {project.sub_project_name} - C:
                                        {project.count}
                                      </li>
                                    )
                                  )
                                ) : (
                                  <p className=" ">No Data Available</p>
                                )}
                              </ul>
                            </div>

                            <div className="chart-text-4 fw-bold mt-3">
                              <IoCalendarClear className="me-1" />
                              <span className="text-center fw-normal">
                                Current Month
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="sub-project">
                        <div className="card lightcard cusdom-total border-0 ">
                          <div className="card-body  d-flex flex-column justify-content-between">
                            <div className=" container d-flex justify-content-center align-items-center">
                              <ul className="sub-project-text">
                                {DashboardData?.sub_project_total?.length >
                                0 ? (
                                  DashboardData?.sub_project_total.map(
                                    (project, index) => (
                                      <li key={index}>
                                        {project.sub_project_name} - C:
                                        {project.count}
                                      </li>
                                    )
                                  )
                                ) : (
                                  <p className=" ">No Data Available</p>
                                )}
                              </ul>
                            </div>

                            <div className="chart-text-5 fw-bold mt-3">
                              <IoCalendarClear className="me-1" />
                              <span className="text-center fw-normal">
                                Total
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className=" col-12 col-sm-12 col-md-12 col-lg-12 rounded-3 ">
                <div className="card card-450 darkcard ">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="fw-bold fs-5">Chart Statistics</div>
                      <div className="dropdown-wrapper position-relative">
                        <Select
                          classNamePrefix="custom-select"
                          className="font-size13"
                          value={periodOptions.find(
                            (opt) => opt.value === selectedPeriod
                          )}
                          onChange={(option) => setSelectedPeriod(option.value)}
                          options={periodOptions}
                          isSearchable={false}
                        />
                      </div>
                    </div>
                    {loadingChart ? (
                      <p className="d-flex justify-content-center align-items-center">
                        <Loader />
                      </p>
                    ) : (
                      <ModelChart chartData={chartData} />
                    )}
                  </div>
                </div>
              </div>
              <div className=" rounded rounded-3 col-12 col-sm-12 col-md-12 col-lg-12">
                <div className="card darkcard p-3 ">
                  <div className="d-flex justify-content-between flex-wrap ">
                    <div className="d-flex justify-content-between">
                      <h5 className="d-flex align-items-center fw-semibold fs-base lh-base text-nowrap customguide-background">
                        <RiAccountPinCircleFill className="fs-2 mr-1 location-icon icon-size me-1" />
                        <h5 className="fw-bold fs-5"> Performance Overview</h5>
                      </h5>
                    </div>
                    <div className="d-flex m-2">
                      <div
                        className="ms-auto d-flex gap-2"
                        style={{ width: "auto" }}
                      >
                        <div
                          className="position-relative"
                          ref={dateRef}
                          style={{ width: "200px" }}
                        >
                          <button
                            onClick={() => setIsDateOpen(!isDateOpen)}
                            className="w-100 dropdown-theme d-flex justify-content-between align-items-center px-3 py-2"
                            // style={{
                            //   border: "1px solid #ddd",
                            //   borderRadius: "8px",
                            //   backgroundColor: "#fff",
                            //   fontSize: "16px",
                            //   color: "#555",
                            //   height: "40px",
                            // }}
                          >
                            <span className="text-truncate ">
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
                                <FaChevronUp size={14} className="text-theme" />
                              ) : (
                                <FaChevronDown
                                  size={14}
                                  className="text-theme"
                                />
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
                                    dateFilter === filter
                                      ? "active-location"
                                      : ""
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
                      </div>
                    </div>
                  </div>

                  <div className="row ">
                    <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                      <div className="card shadow-sm darkcard">
                        <div className="card-header header-skyblue">
                          <h2 className="h6 mb-0">
                            <FaAward
                              icon="fa-solid fa-award"
                              size={14}
                              className="mr-2 perform-icon icon-size me-2"
                            />
                            Best coder of the day - Production based
                          </h2>
                        </div>
                        <div className="card-body p-0">
                          <table className="table table-hover mb-0">
                            <thead className="thead-light">
                              <tr>
                                <th width="10%">Rank</th>
                                <th>Employee Id</th>
                                <th>Name</th>
                                <th width="20%">Chart count</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData?.coder_of_day?.production?.length >
                              0 ? (
                                dashboardData.coder_of_day.production.map(
                                  (auditor, index) => (
                                    <tr key={`auditor-${index}`}>
                                      <td>{getMedalIcon(index)}</td>
                                      <td>{auditor.employee_id || "NA"}</td>
                                      <td>
                                        {ucFirst(auditor.user_name || "NA")}
                                      </td>
                                      <td>{auditor.chart_count || "NA"}</td>
                                    </tr>
                                  )
                                )
                              ) : (
                                <tr>
                                  <td colSpan="4">
                                    <div className="d-flex justify-content-center align-content-center align-items-center performance-table-body">
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
                      <div className="card mb-4 shadow-sm darkcard">
                        <div className="card-header header-lavender">
                          <h2 className="h6 mb-0">
                            <FaAward
                              icon="fa-solid fa-award"
                              size={14}
                              className="mr-2 perform-icon icon-size me-2"
                            />
                            Best coder of the day - Quality based
                          </h2>
                        </div>

                        <div className="card-body p-0">
                          <table className="table table-hover mb-0">
                            <thead className="thead-light">
                              <tr>
                                <th width="10%">Rank</th>
                                <th>Employee Id</th>
                                <th>Name</th>

                                <th width="20%">Quality </th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData?.coder_of_day?.quality?.length >
                              0 ? (
                                dashboardData.coder_of_day.quality.map(
                                  (auditor, index) => (
                                    <tr key={`auditor-${index}`}>
                                      <td>{getMedalIcon(index)}</td>
                                      <td>{auditor.employee_id || "NA"}</td>
                                      <td>
                                        {ucFirst(auditor.user_name) || "NA"}
                                      </td>

                                      <td>{`${auditor.quality_percentage}%`}</td>
                                    </tr>
                                  )
                                )
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
              </div>
              <div className=" col-12 col-sm-12 col-md-12 col-lg-12">
                <div className="card shadow-sm darkcard">
                  <div className="fs-5 fw-bold py-3 px-3 ">
                    <>
                      Idle users on {idleUsersData?.date || "Unknown Date"}
                      {idleUsersData?.count >= 1 && (
                        <span className="cus-count ms-2">
                          {idleUsersData?.count}
                        </span>
                      )}
                    </>
                  </div>

                  <div className="px-3 pb-3">
                    <div className="table-br">
                      <div className="table-responsive overflow-auto ">
                        <ReactTable
                          data={idleUsersData}
                          columns={tableColumns}
                          page={page}
                          setPage={setPage}
                          perPage={perPage}
                          setPerPage={setPerPage}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        </>
      ) : (
        <div className="loading-indicator-dashboard" />
      )}
    </div>
  );
};

export default Dashboard;
