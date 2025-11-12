import React, { useContext } from "react";
import { FaCalendar, FaCaretDown, FaCaretUp } from "react-icons/fa";
import apiClient from "../../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { changeTabTitle } from "../../../utils/changeTabTitle";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ModelChart from "../../../components/ModelChart";
import Select from "react-select";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useState } from "react";
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
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
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
            message: "You are not assign any team!! Please contact your Lead",
          },
        })
      ) : !isLoading ? (
        <>
          <h5 className="m-2">Dashboard</h5>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-5 g-3 ">
            <div className="col">
              <div className="card darkcard card-134 cus-card-bg">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h1 className="head mb-0  ">
                      {DashboardData?.today_charts_count || "NA"}
                    </h1>
                    <p className="main mb-3">Audits</p>
                    <div className="d-flex align-items-center">
                      <FaCalendar className="me-2 chart-text" />
                      <span className="chart-text footer">Today</span>
                    </div>
                  </div>
                  <div className="rounded-circle d-flex align-items-center justify-content-center log-image">
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
              <div className="card card-134 border border-0 ">
                <div className="card card-134 darkcard cus-card-bg">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h1 className="head mb-0 ">
                        {DashboardData?.yesterday_charts_count || "NA"}
                      </h1>
                      <p className="main mb-3">Audits</p>
                      <div className="d-flex align-items-center">
                        <FaCalendar className="me-2 chart-text-2" />
                        <span className="chart-text-2 footer">Yesterday</span>
                      </div>
                    </div>
                    <div className="rounded-circle d-flex align-items-center justify-content-center log-image">
                      <img
                        src="images/coder-dashboard/yesterday.svg"
                        alt=""
                        className="log"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card card-134 border border-0">
                <div className="card card-134 darkcard cus-card-bg">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h1 className="head mb-0  ">
                        {DashboardData?.this_month_charts_count || "NA"}
                      </h1>
                      <p className="main mb-3">Audits</p>
                      <div className="d-flex align-items-center">
                        <FaCalendar className="me-2 chart-text-3" />
                        <span className="chart-text-3 footer">This Month</span>
                      </div>
                    </div>
                    <div className="rounded-circle d-flex align-items-center justify-content-center log-image">
                      <img
                        src="images/coder-dashboard/past 7.svg"
                        alt=""
                        className="log"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card card-134 border border-0">
                <div className="card card-134 darkcard cus-card-bg">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h1 className="head mb-0  ">
                        {DashboardData?.previous_month_charts_count || "NA"}
                      </h1>
                      <p className="main mb-3">Audits</p>
                      <div className="d-flex align-items-center icon-bottom">
                        <FaCalendar className="me-2 chart-text-4" />
                        <span className="chart-text-4 footer">
                          previous month
                        </span>
                      </div>
                    </div>
                    <div className="rounded-circle d-flex align-items-center justify-content-center log-image">
                      <img
                        src="images/coder-dashboard/past30.svg"
                        alt=""
                        className="log"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card card-134 border border-0">
                <div className="card card-134 darkcard cus-card-bg">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h1 className="head mb-0  ">
                        {DashboardData?.total_charts_count || "NA"}
                      </h1>
                      <p className="main mb-3">Audits</p>
                      <div className="d-flex align-items-center">
                        <FaCalendar className="me-2 chart-text-5" />
                        <span className="chart-text-5 footer">Total</span>
                      </div>
                    </div>
                    <div className="rounded-circle d-flex align-items-center justify-content-center log-image">
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
              <div className="card card-134 border border-0">
                <div className="card card-134 darkcard cus-card-bg">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      {/* <h1 className='head mb-0 mt-3 '>234</h1> */}
                      <p className="main mb-3">Error Percentage</p>
                      <div className="d-flex align-items-center">
                        <FaCalendar className="me-2 chart-text" />
                        <span className="chart-text footer">Today</span>
                      </div>
                    </div>
                    <div className=" d-flex align-items-center justify-content-center circlebar-auditor">
                      <CircularProgressbar
                        value={DashboardData?.today_error_percentage || 0}
                        text={
                          DashboardData?.today_error_percentage
                            ? `${DashboardData?.today_error_percentage}%`
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
              </div>
            </div>
            <div className="col">
              <div className="card card-134 border border-0">
                <div className="card card-134 darkcard cus-card-bg">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      {/* <h1 className='head mb-0 mt-3 '>253</h1> */}
                      <p className="main mb-3">Error Percentage</p>
                      <div className="d-flex align-items-center">
                        <FaCalendar className="me-2 chart-text-2" />
                        <span className="chart-text-2 footer">Yesterday</span>
                      </div>
                    </div>
                    <div className=" d-flex align-items-center justify-content-center circlebar-auditor">
                      <CircularProgressbar
                        value={DashboardData?.yesterday_error_percentage || 0}
                        text={
                          DashboardData?.yesterday_error_percentage
                            ? `${DashboardData?.yesterday_error_percentage}%`
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
              </div>
            </div>
            <div className="col">
              <div className="card card-134 border border-0">
                <div className="card card-134 darkcard cus-card-bg">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      {/* <h1 className='head mb-0 mt-3 '>253</h1> */}
                      <p className="main mb-3">Error Percentage</p>
                      <div className="d-flex align-items-center">
                        <FaCalendar className="me-2 chart-text-3" />
                        <span className="chart-text-3 footer">This Month</span>
                      </div>
                    </div>
                    <div className=" d-flex align-items-center justify-content-center circlebar-auditor">
                      <CircularProgressbar
                        value={DashboardData?.this_month_error_percentage || 0}
                        text={
                          DashboardData?.this_month_error_percentage
                            ? `${DashboardData?.this_month_error_percentage}%`
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
              </div>
            </div>
            <div className="col">
              <div className="card card-134 border border-0">
                <div className="card card-134 darkcard cus-card-bg">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      {/* <h1 className='head mb-0 mt-3 '>253</h1> */}
                      <p className="main mb-3">Error Percentage</p>
                      <div className="d-flex align-items-center">
                        <FaCalendar className="me-2 chart-text-4" />
                        <span className="chart-text-4 footer">
                          previous month
                        </span>
                      </div>
                    </div>
                    <div className=" d-flex align-items-center justify-content-center circlebar-auditor">
                      <CircularProgressbar
                        value={DashboardData?.last_month_error_percentage || 0}
                        text={
                          DashboardData?.last_month_error_percentage
                            ? `${DashboardData?.last_month_error_percentage}%`
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
              </div>
            </div>
            <div className="col">
              <div className="card card-134 border border-0">
                <div className="card card-134 darkcard cus-card-bg">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      {/* <h1 className='head mb-0 mt-3 '>253</h1> */}
                      <p className="main mb-3">Error Percentage</p>
                      <div className="d-flex align-items-center">
                        <FaCalendar className="me-2 chart-text-5" />
                        <span className="chart-text-5 footer">Total</span>
                      </div>
                    </div>
                    <div className=" d-flex align-items-center justify-content-center circlebar-auditor">
                      <CircularProgressbar
                        value={DashboardData?.total_error_percentage || 0}
                        text={
                          DashboardData?.total_error_percentage
                            ? `${DashboardData?.total_error_percentage}%`
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
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-12 col-lg-12">
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
            {/* <div className='col-12 col-sm-12 col-md-12 col-lg-12'>
      <div className='card  border border-0'>
        <div className='card-body'>
          <MonthlyQualityChart />
        </div>
      </div>
    </div> */}
          </div>
        </>
      ) : (
        <div className="loading-indicator-dashboard" />
      )}
    </div>
  );
};

export default Dashboard;
