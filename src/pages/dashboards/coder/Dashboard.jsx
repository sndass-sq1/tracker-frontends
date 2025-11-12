import React, { useContext } from "react";
import { FaCalendar, FaCaretDown, FaCaretUp } from "react-icons/fa";
import apiClient from "../../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { changeTabTitle } from "../../../utils/changeTabTitle";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Select from "react-select";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useState } from "react";
import ModelChart from "../../../components/ModelChart";
import { Loader } from "../../../shared/Loader";
import { useNavigate } from "react-router";
import { UserContext } from "../../../UserContext/UserContext";
const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  changeTabTitle("Dashboard");
  const navigate = useNavigate();

  const getData = async () => {
    try {
      const response = await apiClient.get("dashboard");
      return response.data?.data;
    } catch (error) {
      throw error;
    }
  };
  const getChartStats = async (periodId) => {
    const response = await apiClient.get(
      `dashboard/chart-statistics/${periodId}`
    );
    return response.data?.data;
  };

  const { data: DashboardData, isLoading } = useQuery({
    queryKey: ["getData"],
    queryFn: getData,
    staleTime: 5 * 60 * 1000,
  });
  const { data: chartData, isLoading: loadingChart } = useQuery({
    queryKey: ["chartStats", selectedPeriod],
    queryFn: () => getChartStats(selectedPeriod),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  const { data: userData } = useQuery({
    queryKey: ["getCurrentUser"],
    queryFn: async () => {
      const response = await apiClient.get("get-current-user-data");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
  const { theme } = useContext(UserContext);

  const periodOptions = [
    { value: 1, label: "Today" },
    { value: 0, label: "Yesterday" },
  ];
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      {userData?.data.team_id === null ? (
        navigate("/accessDenied", {
          replace: true,
          state: {
            message: "You are not assign any team!! Please contact your Lead",
          },
        })
      ) : (
        <>
          <div className="container-fluid">
            <h5 className="m-2">Dashboard</h5>
            {!isLoading && (
              <>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-5 g-3 ">
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className=" mb-0  head ">
                            {DashboardData?.coder_today_charts_count || "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.coder_today_charts_count > 1
                              ? "Charts"
                              : "Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text" />
                            <span className="chart-text footer">Today</span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard  d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/Today.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="head mb-0 ">
                            {DashboardData?.coder_yesterday_charts_count ||
                              "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.coder_yesterday_charts_count > 1
                              ? "Charts"
                              : "Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-2" />
                            <span className="chart-text-2 footer">
                              Yesterday
                            </span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/yesterday.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="head mb-0 ">
                            {DashboardData?.coder_this_month_charts_count ||
                              "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.coder_this_month_charts_count > 1
                              ? "Charts"
                              : "Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-3" />
                            <span className="chart-text-3 footer">
                              This Month
                            </span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/past 7.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="head mb-0 ">
                            {DashboardData?.coder_previous_month_charts_count ||
                              "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.coder_previous_month_charts_count >
                            1
                              ? "Charts"
                              : "Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-4" />
                            <span className="chart-text-4 footer">
                              Previous Month
                            </span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/past30.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card card-134 darkcard darkcard cus-card-bg">
                        <div className="card-body d-flex justify-content-between align-items-center">
                          <div>
                            <h1 className="head mb-0  ">
                              {DashboardData?.coder_total_charts_count || "NA"}
                            </h1>
                            <p className="main mb-3">
                              {DashboardData?.coder_total_charts_count > 1
                                ? "Charts"
                                : "Chart"}
                            </p>
                            <div className="d-flex align-items-center">
                              <FaCalendar className="me-2 chart-text-5" />
                              <span className="chart-text-5 footer">Total</span>
                            </div>
                          </div>
                          <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                            <img
                              src="images/coder-dashboard/totalaudit.svg"
                              alt=""
                              className="log w-50 h-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="head mb-0 ">
                            {DashboardData?.audited_today_charts_count || "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.audited_today_charts_count > 1
                              ? "  Audited Charts"
                              : "  Audited Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text" />
                            <span className="chart-text footer">Today</span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/Today.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="head mb-0 ">
                            {DashboardData?.audited_yesterday_charts_count ||
                              "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.audited_yesterday_charts_count > 1
                              ? "  Audited Charts"
                              : "  Audited Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-2" />
                            <span className="chart-text-2 footer">
                              Yesterday
                            </span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/yesterday.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="head mb-0 ">
                            {DashboardData?.audited_this_month_charts_count ||
                              "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.audited_this_month_charts_count > 1
                              ? "  Audited Charts"
                              : "  Audited Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-3" />
                            <span className="chart-text-3 footer">
                              This month
                            </span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/past 7.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="head mb-0 ">
                            {DashboardData?.audited_previous_month_charts_count ||
                              "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.audited_previous_month_charts_count >
                            1
                              ? "  Audited Charts"
                              : "  Audited Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-4" />
                            <span className="chart-text-4 footer">
                              Previous Month
                            </span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/past30.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card card-134 darkcard darkcard cus-card-bg">
                        <div className="card-body d-flex justify-content-between align-items-center">
                          <div>
                            <h1 className="head mb-0  ">
                              {DashboardData?.audited_total_charts_count ||
                                "NA"}
                            </h1>
                            <p className="main mb-3">
                              {DashboardData?.audited_total_charts_count > 1
                                ? "  Audited Charts"
                                : "  Audited Chart"}
                            </p>
                            <div className="d-flex align-items-center">
                              <FaCalendar className="me-2 chart-text-5" />
                              <span className="chart-text-5 footer">Total</span>
                            </div>
                          </div>
                          <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                            <img
                              src="images/coder-dashboard/totalaudit.svg"
                              alt=""
                              className="log w-50 h-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="head mb-0 ">
                            {DashboardData?.error_today_charts_count || "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.error_today_charts_count > 1
                              ? "Error Charts"
                              : "Error Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text" />
                            <span className="chart-text footer">Today</span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/Today.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="head mb-0 ">
                            {DashboardData?.error_yesterday_charts_count ||
                              "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.error_yesterday_charts_count > 1
                              ? "Error Charts"
                              : "Error Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-2" />
                            <span className="chart-text-2 footer">
                              Yesterday
                            </span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/yesterday.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="head mb-0 ">
                            {DashboardData?.error_this_month_charts_count ||
                              "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.error_this_month_charts_count > 1
                              ? "Error Charts"
                              : "Error Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-3" />
                            <span className="chart-text-3 footer">
                              This month
                            </span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/past 7.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="head mb-0 ">
                            {DashboardData?.error_previous_month_charts_count ||
                              "NA"}
                          </h1>
                          <p className="main mb-3">
                            {DashboardData?.error_previous_month_charts_count >
                            1
                              ? "Error Charts"
                              : "Error Chart"}
                          </p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-4" />
                            <span className="chart-text-4 footer">
                              Previous month
                            </span>
                          </div>
                        </div>
                        <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                          <img
                            src="images/coder-dashboard/past30.svg"
                            alt=""
                            className="log"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card card-134 darkcard darkcard cus-card-bg">
                        <div className="card-body d-flex justify-content-between align-items-center">
                          <div>
                            <h1 className="head mb-0  ">
                              {DashboardData?.error_total_charts_count || "NA"}
                            </h1>
                            <p className="main mb-3">
                              {DashboardData?.error_total_charts_count > 1
                                ? "Error Charts"
                                : "Error Chart"}
                            </p>
                            <div className="d-flex align-items-center">
                              <FaCalendar className="me-2 chart-text-5" />
                              <span className="chart-text-5 footer">Total</span>
                            </div>
                          </div>
                          <div className="rounded-circle lightcard d-flex align-items-center justify-content-center log-image">
                            <img
                              src="images/coder-dashboard/totalaudit.svg"
                              alt=""
                              className="log w-50 h-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <img
                            src="images/coder-dashboard/quality1.svg"
                            alt=""
                            className="quality"
                          />
                          <p className="main mb-1">Chart Quality</p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text" />
                            <span className="chart-text footer">Today</span>
                          </div>
                        </div>
                        <div className=" d-flex align-items-center justify-content-center circlebar-coder ">
                          <CircularProgressbar
                            value={DashboardData?.today_charts_count || 0}
                            text={
                              DashboardData?.today_charts_count
                                ? `${DashboardData?.today_charts_count}%`
                                : "NA"
                            }
                            styles={{
                              path: {
                                stroke:
                                  theme === "dark" ? "#33B1FF" : "#33B1FF", // same color but can customize
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
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <img
                            src="images/coder-dashboard/quality2.svg"
                            alt=""
                            className="quality"
                          />
                          <p className="main mb-1">Chart Quality</p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-2" />
                            <span className="chart-text-2 footer">
                              Yesterday
                            </span>
                          </div>
                        </div>
                        <div className=" d-flex align-items-center justify-content-center circlebar-coder ">
                          <CircularProgressbar
                            value={DashboardData?.yesterday_charts_count || 0}
                            text={
                              DashboardData?.yesterday_charts_count
                                ? `${DashboardData?.yesterday_charts_count}%`
                                : "NA"
                            }
                            styles={{
                              path: {
                                stroke:
                                  theme === "dark" ? "#33B1FF" : "#33B1FF", // same color but can customize
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
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <img
                            src="images/coder-dashboard/quality3.svg"
                            alt=""
                            className="quality"
                          />
                          <p className="main mb-1">Chart Quality</p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-3" />
                            <span className="chart-text-3 footer">
                              This month
                            </span>
                          </div>
                        </div>
                        <div className=" d-flex align-items-center justify-content-center circlebar-coder">
                          <CircularProgressbar
                            value={DashboardData?.this_month_charts_count || 0}
                            text={
                              DashboardData?.this_month_charts_count
                                ? `${DashboardData?.this_month_charts_count}%`
                                : "NA"
                            }
                            styles={{
                              path: {
                                stroke:
                                  theme === "dark" ? "#33B1FF" : "#33B1FF", // same color but can customize
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
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <img
                            src="images/coder-dashboard/quality4.svg"
                            alt=""
                            className="quality"
                          />
                          <p className="main mb-1">Chart Quality</p>
                          <div className="d-flex align-items-center ">
                            <FaCalendar className="me-2 chart-text-4" />
                            <span className="chart-text-4 footer">
                              Previous month
                            </span>
                          </div>
                        </div>
                        <div className=" d-flex align-items-center justify-content-center circlebar-coder ">
                          <CircularProgressbar
                            value={
                              DashboardData?.previous_month_charts_count || 0
                            }
                            text={
                              DashboardData?.previous_month_charts_count
                                ? `${DashboardData?.previous_month_charts_count}%`
                                : "NA"
                            }
                            styles={{
                              path: {
                                stroke:
                                  theme === "dark" ? "#33B1FF" : "#33B1FF", // same color but can customize
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
                  </div>
                  <div className="col">
                    <div className="card card-134 darkcard">
                      <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                          <img
                            src="images/lead-dashboard/dashboardlead15.svg"
                            alt=""
                            className="quality"
                          />
                          <p className="main mb-1">Chart Quality</p>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 chart-text-5" />
                            <span className="chart-text-5 footer">Total</span>
                          </div>
                        </div>
                        <div className=" d-flex align-items-center justify-content-center circlebar-coder ">
                          <CircularProgressbar
                            value={DashboardData?.total_charts_count || 0}
                            text={
                              DashboardData?.total_charts_count
                                ? `${DashboardData?.total_charts_count}%`
                                : "NA"
                            }
                            styles={{
                              path: {
                                stroke:
                                  theme === "dark" ? "#33B1FF" : "#33B1FF", // same color but can customize
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
                  </div>
                  <div className="col-12 col-sm-12 col-md-12 col-lg-12">
                    <div className="card card-450 darkcard">
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
                              onChange={(option) =>
                                setSelectedPeriod(option.value)
                              }
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
                  {/* <div className='col-12 col-sm-12 col-md-12 col-lg-12'>
                  <div className='card  darkcard'>
                    <div className='card-body'>
                      <MonthlyQualityChart />
                    </div>
                  </div>
                </div> */}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
