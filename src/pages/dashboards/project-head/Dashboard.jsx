import apiClient from "../../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { changeTabTitle } from "../../../utils/changeTabTitle";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { IoCalendarClear } from "react-icons/io5";
import { useState, useMemo, useRef, useEffect, useContext } from "react";
import ReactTable from "../../../components/ReactTable";
import Select from "react-select";
import { useDebouncedCallback } from "use-debounce";
import DropdownOptions from "../../../components/DropdownOptions";
import ModalComp from "../../../components/ModalComp";
import { ucFirst } from "../../../utils/ucFirst";
import { RiAccountPinCircleFill } from "react-icons/ri";
import { FaChevronDown, FaChevronUp, FaAward } from "react-icons/fa";
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
const Dashboard = () => {
  const projectRef = useRef(null);
  const dateRef = useRef(null);
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const navigate = useNavigate();
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const [SelectedteamId, setSelectedteamId] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [isDateOpen, setIsDateOpen] = useState(false);
  // const [teamId, setTeamId] = useState(null);
  const [projectid, setProjectId] = useState(null);
  const [countsOpen, setCountsOpen] = useState(false);
  changeTabTitle("Dashboard");

  const getData = async (teamId = null) => {
    const endpoint = teamId ? `dashboard?team_id=${teamId}` : "dashboard";
    const response = await apiClient.get(endpoint);
    return response.data?.data;
  };

  const getIdleUsers = async (periodId, page, perPage) => {
    const response = await apiClient.get(
      `dashboard/idle-users/${periodId}?page=${page}&perPage=${perPage}`
    );
    return response.data;
  };

  const { data: DashboardData, refetch } = useQuery({
    queryKey: ["getData", SelectedteamId],
    queryFn: () => getData(SelectedteamId),

    staleTime: 5 * 60 * 1000,
  });
  const { data: idleUsersData } = useQuery({
    queryKey: ["idleUsers", SelectedteamId, page, perPage],
    queryFn: () => getIdleUsers(SelectedteamId, page, perPage),

    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const { data: projectData } = useQuery({
    queryKey: ["projectData"],
    queryFn: async () => {
      const response = await apiClient.get("projects/dropdown");
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboardData", projectid, dateFilter, SelectedteamId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (projectid) queryParams.append("project_id", projectid);
      if (SelectedteamId) queryParams.append("team_id", SelectedteamId);
      if (dateFilter !== "" && dateFilter !== null && dateFilter !== undefined)
        queryParams.append("date_filter", dateFilter);

      const queryString = queryParams.toString();
      const endpoint = queryString ? `dashboard?${queryString}` : `dashboard`;

      const response = await apiClient.get(endpoint);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const dropdownEndpoints = {
    lead_name: "dashboard/get-teams",
    // project_id: "projects/dropdown",
  };
  const dropdownFields = [
    {
      name: "lead_name",
      label: "Lead name",
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

  const handleteamIdChange = async (selectedOption) => {
    const teamId = selectedOption?.value;
    setSelectedteamId(teamId);
    await refetch();
  };

  useEffect(() => {
    const pages = dropdowns?.lead_name?.data?.pages;

    if (Array.isArray(pages)) {
      const options = pages.reduce((acc, page) => [...acc, ...page.data], []);

      if (!SelectedteamId && options.length > 0) {
        setSelectedteamId(options[0]?.value);
      }
    }
  }, [dropdowns?.lead_name?.data, SelectedteamId]);

  const columnsList = () => [
    {
      accessorKey: "name",
      header: "Name",
      editable: false,
      enableSorting: false,
      cell: (props) => <span>{ucFirst(props.getValue())}</span>,
    },
    {
      accessorKey: "employee_id",
      header: "Employee Id",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      editable: false,
      enableSorting: false,
    },
    {
      accessorKey: "role",
      header: "Role",
      editable: false,
      enableSorting: false,
      cell: (props) => <span>{ucFirst(props.getValue())}</span>,
    },
    {
      accessorKey: "location",
      header: "Location",
      editable: false,
      enableSorting: false,
    },
  ];
  let tableColumns = useMemo(() => columnsList(), [page]);
  const [show, setShow] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["getCurrentUser"],
    queryFn: async () => {
      const response = await apiClient.get("get-current-user-data");
      return response.data;
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

  const selectProject = (project_id) => {
    setProjectId(project_id);
    setCountsOpen(false);
  };

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    setCountsOpen(false);
  };
  const countToggleDropdown = () => {
    setCountsOpen(!countsOpen);
  };
  const handleResetProject = () => {
    setProjectId(null);
    setCountsOpen(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
      if (projectRef.current && !projectRef.current.contains(event.target)) {
        setCountsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const customStyles = (theme) => ({
    control: (base, state) => ({
      ...base,
      width: "auto",
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
    <div className="container-fluid ">
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
          <div className="d-flex justify-content-between mb-2 flex-wrap">
            <div className="d-flex align-items-center gap-2  flex-wrap">
              <div>
                <p className="fs-5 fw-semibold project-text  ">
                  <span className="mx-2"> Project :</span> {}
                  <span>
                    {DashboardData?.project_name
                      ? ucFirst(DashboardData?.project_name)
                      : "NA"}
                  </span>
                </p>
              </div>
              <div className="vertical-line mx-2"></div>
              <p className="fs-6 fw-semibold coder-text ">
                {DashboardData?.coder_count > 1 ? "Coders" : "Coder"}
              </p>
              <div className="badge-black me-3">
                <p className="badge-text ">
                  {DashboardData?.coder_count || "NA"}
                </p>
              </div>
              <div className="vertical-line mx-2"></div>
              <p className="fs-6 fw-semibold coder-text ">
                {DashboardData?.auditor_count > 1 ? "Auditors" : "Auditor"}
              </p>
              <div className="badge-black">
                <p className="badge-text ">
                  {DashboardData?.auditor_count || "NA"}
                </p>
              </div>
              <div className="vertical-line mx-2"></div>
              {/* className="cus-count mx-2" */}
              <div className="fs-6 fw-semibold coder-text ">
                Sub Project Count
                <button
                  // className="disable-cus-count mx-2"
                  className={`${
                    DashboardData?.sub_project_count === 0
                      ? "disable-cus-count mx-2"
                      : "cus-count mx-2"
                  }`}
                  onClick={() => setShow(true)}
                >
                  {DashboardData?.sub_project_count || 0}
                </button>
                <div className="subCount">
                  <ModalComp
                    isOpen={show}
                    onClose={() => setShow(false)}
                    showActions={false}
                    dialogClassName="modal-85w"
                  >
                    <div className="modal-header ">
                      <h4>Sub Project Count</h4>
                      <button
                        type="button"
                        className="btn-close filtered-image"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                        onClick={() => setShow(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <h5>Charts Count based on Sub Project</h5>
                      <div className="d-flex gap-3">
                        {[
                          {
                            title: "Today",
                            data: DashboardData?.sub_project_today,
                          },
                          {
                            title: "Yesterday",
                            data: DashboardData?.sub_project_yesterday,
                          },
                          {
                            title: "Current Month",
                            data: DashboardData?.sub_project_this_month,
                          },
                          {
                            title: "Previous Month",
                            data: DashboardData?.sub_project_previous_month,
                          },
                          {
                            title: "Total",
                            data: DashboardData?.sub_project_total,
                          },
                        ].map((section, idx) => (
                          <div className="col inside-card" key={idx}>
                            <h5 className="py-2 px-2 chart-sub-count">
                              {section.title}
                            </h5>
                            <ul
                              className="sub-project-text list-unstyled p-2"
                              style={{
                                maxHeight: "240px",
                                overflowY: "auto",
                                minWidth: "180px",
                              }}
                            >
                              {section.data?.length > 0 ? (
                                section.data.map((project, index) => (
                                  <li key={index}>
                                    {project.sub_project_name} - C:
                                    {project.count}
                                  </li>
                                ))
                              ) : (
                                <p className="d-flex justify-content-center align-items-center">
                                  No Data Found
                                </p>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ModalComp>
                </div>
              </div>
            </div>

            {/* <div className='d-flex gap-3'>
          <div className='custom-element d-flex  align-items-center justify-content-center text-center'>
            <img src='images/lead-dashboard/useractive.svg' alt='img' />
            <p className='active-text fs-6 fw-semibold ms-1 me-2 '>Active</p>
            <div className='badge-active fw-semibold fs-6'>35</div>
          </div>
          <div className='custom-element d-flex  align-items-center justify-content-center text-center'>
            <img src='images/lead-dashboard/userinactive.svg' alt='img' />
            <p className='active-text fs-6 fw-semibold  ms-1 me-2'>Inactive</p>
            <div className='badge-inactive fw-semibold fs-6'>35</div>
          </div>
        </div> */}

            <div className="my-3">
              <>
                {dropdownFields.map(({ name, label, isMulti, isMandatory }) => {
                  const {
                    data,
                    fetchNextPage,
                    hasNextPage,
                    isFetchingNextPage,
                  } = dropdowns[name];
                  const options =
                    data?.pages?.reduce(
                      (acc, page) => [...acc, ...page.data],
                      []
                    ) || [];
                  const defaultValue = options[0];

                  return (
                    <div
                      className="emp-dashboard col-lg-12  d-flex gap-2 mx-4"
                      key={name}
                    >
                      <label
                        htmlFor={name}
                        className={`form-label mt-2 w-25 ${
                          isMandatory === true ? "" : ""
                        }`}
                      >
                        {label}
                      </label>

                      <Select
                        styles={customStyles(theme)}
                        classNamePrefix="custom-select"
                        className="font-size13 w-50"
                        // classNamePrefix="select"
                        isSearchable
                        name={name}
                        options={options}
                        onChange={handleteamIdChange}
                        onMenuScrollToBottom={() => {
                          if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                          }
                        }}
                        onInputChange={handleInputChange}
                        value={
                          SelectedteamId &&
                          options.some(
                            (option) => option.value === SelectedteamId
                          )
                            ? options.find(
                                (option) => option.value === SelectedteamId
                              )
                            : defaultValue
                        }
                      />

                      <div>
                        <Link
                          to={`/emp-dashboard/`}
                          state={{ teamIdss: SelectedteamId }}
                          className="profile-board"
                        >
                          <li className="me-5 py-2 px-4 list-unstyled pointer employee-button  ">
                            EmployeeDashboard
                          </li>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </>
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
                          DashboardData?.overall_quality_today_charts_count || 0
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

                      <span className="text-center  fw-normal">Yesterday</span>
                    </div>
                  </div>
                </div>
                <div className="vertical-cardline mx-3"></div>
                <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                  <div className="card-body  d-grid align-content-center justify-content-center  flex-column   ">
                    <div className=" gap-2">
                      <div className="text-theme fw-bold fs-2">
                        {DashboardData?.auditor_yesterday_charts_count || "NA"}
                      </div>
                      <div className="main fw-normal  mt-4">
                        {DashboardData?.auditor_yesterday_charts_count > 1
                          ? "Audits"
                          : "Audit"}
                      </div>
                    </div>

                    <div className="chart-text-2 fw-bold mt-3 text-nowrap">
                      <IoCalendarClear className="me-1" />

                      <span className="text-center  fw-normal">Yesterday</span>
                    </div>
                  </div>
                </div>
                <div className="vertical-cardline mx-3"></div>
                <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                  <div className="card-body  d-grid align-content-center justify-content-center flex-column   ">
                    <div className=" gap-2">
                      <div className="text-theme fw-bold fs-2">
                        {DashboardData?.audited_yesterday_charts_count || "NA"}
                      </div>
                      <div className="main fw-normal  mt-4">
                        {DashboardData?.audited_yesterday_charts_count > 1
                          ? "Audited Charts"
                          : "Audited Chart"}
                      </div>
                    </div>

                    <div className="chart-text-2 fw-bold mt-3 text-nowrap">
                      <IoCalendarClear className="me-1" />

                      <span className="text-center  fw-normal">Yesterday</span>
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

                      <span className="text-center  fw-normal">Yesterday</span>
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

                      <span className="text-center  fw-normal">Yesterday</span>
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

                      <span className="text-center  fw-normal">This month</span>
                    </div>
                  </div>
                </div>
                <div className="vertical-cardline mx-3"></div>
                <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                  <div className="card-body  d-grid align-content-center justify-content-center  flex-column   ">
                    <div className=" gap-2">
                      <div className="text-theme fw-bold fs-2">
                        {DashboardData?.auditor_this_month_charts_count || "NA"}
                      </div>
                      <div className="main fw-normal  mt-4">
                        {DashboardData?.auditor_this_month_charts_count > 1
                          ? "Audits"
                          : "Audit"}
                      </div>
                    </div>

                    <div className="chart-text-3 fw-bold mt-3 text-nowrap">
                      <IoCalendarClear className="me-1" />

                      <span className="text-center  fw-normal">This month</span>
                    </div>
                  </div>
                </div>
                <div className="vertical-cardline mx-3"></div>
                <div className="col-12 col-sm-6 col-md-2 col-lg-2">
                  <div className="card-body  d-grid align-content-center justify-content-center  flex-column   ">
                    <div className=" gap-2">
                      <div className="text-theme fw-bold fs-2">
                        {DashboardData?.audited_this_month_charts_count || "NA"}
                      </div>
                      <div className="main fw-normal  mt-4">
                        {DashboardData?.audited_this_month_charts_count > 1
                          ? "Audited Charts"
                          : "Audited Chart"}
                      </div>
                    </div>

                    <div className="chart-text-3 fw-bold mt-3 text-nowrap">
                      <IoCalendarClear className="me-1" />

                      <span className="text-center  fw-normal">This month</span>
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

                      <span className="text-center  fw-normal">This month</span>
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

                      <span className="text-center  fw-normal">This month</span>
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
                        {DashboardData?.auditor_previous_month_charts_count > 1
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
                        {DashboardData?.audited_previous_month_charts_count > 1
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
                          DashboardData?.overall_quality_total_charts_count || 0
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
          <div className="col-12 col-sm-12 col-md-12 col-lg-12 mb-3">
            <div className="card darkcard p-3">
              <div className="d-flex justify-content-between flex-wrap">
                <div className="d-flex justify-content-between">
                  <h5 className="d-flex align-items-center fw-semibold fs-base lh-base text-nowrap customguide-background fw-bold fs-5">
                    <RiAccountPinCircleFill className="fs-2 mr-1 location-icon icon-size me-1" />
                    Performance Overview
                  </h5>
                </div>

                <div className="d-flex my-2">
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

                    {/* <div
                      className="position-relative"
                      ref={projectRef}
                      style={{ width: "200px" }}
                    >
                      <button
                        onClick={countToggleDropdown}
                        className="w-100 d-flex justify-content-between dropdown-theme align-items-center px-3 py-2"
                        // style={{
                        //   border: "1px solid #ddd",
                        //   borderRadius: "8px",
                        //   backgroundColor: "#fff",
                        //   fontSize: "16px",
                        //   color: "#555",
                        //   height: "40px",
                        // }}
                      >
                        <span className="text-truncate">
                          {projectid
                            ? projectData?.data.find((p) => p.id === projectid)
                              ?.project_name
                            : "Over all"}
                        </span>
                        <span className="d-flex align-items-center ms-2">
                          <span
                            style={{
                              borderLeft: "1px solid #ccc",
                              height: "20px",
                              margin: "0 8px",
                            }}
                          ></span>
                          {countsOpen ? (
                            <FaChevronUp size={14} classname="text-theme" />
                          ) : (
                            <FaChevronDown size={14} classname="text-theme" />
                          )}
                        </span>
                      </button>

                      {countsOpen && (
                        <ul
                          className="position-absolute darkcard p-2 rounded shadow-sm mt-2 w-100"
                          style={{
                            maxHeight: "220px",
                            overflowY: "auto",
                            zIndex: 10,
                          }}
                        >
                          <li
                            className={`py-2 px-3 list-unstyled pointer hover-list ${projectid === null ? "active-location" : ""
                              }`}
                            onClick={() => {
                              handleResetProject();
                              setCountsOpen(false);
                            }}
                          >
                            Over all
                          </li>
                          {projectData?.data.map((project) => (
                            <li
                              key={project.id}
                              className={`py-2 px-3 list-unstyled hover-list pointer ${projectid === project.id
                                ? "active-location"
                                : ""
                                }`}
                              onClick={() => {
                                selectProject(project.id);
                                setCountsOpen(false);
                              }}
                            >
                              {project.project_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div> */}
                  </div>
                </div>
              </div>

              <div className="row">
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
                            <th>Coder Name</th>
                            <th>Lead Name</th>
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
                                  <td> {ucFirst(auditor.user_name) || "NA"}</td>
                                  <td> {ucFirst(auditor.lead_name) || "NA"}</td>
                                  <td>{auditor.chart_count || "NA"}</td>
                                </tr>
                              )
                            )
                          ) : (
                            <tr>
                              <td colSpan="5">
                                <div className=" d-flex justify-content-center align-content-center align-items-center performance-table-body">
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
                            <th>Lead Name</th>
                            <th width="20%">Quality</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData?.coder_of_day?.quality?.length > 0 ? (
                            dashboardData.coder_of_day.quality.map(
                              (auditor, index) => (
                                <tr key={`auditor-${index}`}>
                                  <td>
                                    {/* <span
                                      className={`rank-badge ${getRankColor(
                                        index
                                      )}`}
                                    > */}
                                    {getMedalIcon(index)}
                                    {/* </span> */}
                                  </td>
                                  <td>{auditor.employee_id || "NA"}</td>
                                  <td> {ucFirst(auditor.user_name) || "NA"}</td>
                                  <td> {ucFirst(auditor.lead_name) || "NA"}</td>
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
                {/* </table> */}
                {/* </div> */}
                {/* </div> */}
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-12 col-md-12 col-lg-12 mb-3">
            <div className="card shadow-sm darkcard">
              <div className="fs-5 fw-bold py-3 px-3">
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
                  {/* {loadingIdleUsers ? (
                    <p>Loading idle users...</p>
                  ) : ( */}
                  {/* <> */}
                  <div className="table-responsive  overflow-auto ">
                    <ReactTable
                      data={idleUsersData}
                      columns={tableColumns}
                      page={page}
                      setPage={setPage}
                      perPage={perPage}
                      setPerPage={setPerPage}
                      // isLoading={isLoading}
                      setSortType={setSortType}
                      setSortColumn={setSortColumn}
                      sortType={sortType}
                      sortColumn={sortColumn}
                    />
                  </div>
                  {/* </>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="loading-indicator-dashboard" />
      )}
    </div>
  );
};

export default Dashboard;
