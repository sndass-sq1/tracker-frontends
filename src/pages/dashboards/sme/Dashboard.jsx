import { changeTabTitle } from "../../../utils/changeTabTitle";
import apiClient from "../../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import MixePieGuideChartComp from "../../charts/MixePieGuideChartComp";
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";
import { ucFirst } from "../../../utils/ucFirst";
import { useRef, useEffect, useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Dashboard = () => {
  changeTabTitle("Dashboard");
  const locationRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [locationId, setLocationId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: listLocation } = useQuery({
    queryKey: ["listLocationData"],
    queryFn: async () => {
      const response = await apiClient.get("locations/dropdown");
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: DashboardData, isLoading } = useQuery({
    queryKey: ["DashboardData", locationId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (locationId) queryParams.append("location_id", locationId);
      const endpoint = `dashboard?${queryParams.toString()}`;
      const response = await apiClient.get(endpoint);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const pieChartData = [
    DashboardData?.guidelines_approved_count || 0,
    DashboardData?.guidelines_rejected_count || 0,
    DashboardData?.guidelines_pending_count || 0,
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const handleCityClick = (location) => {
    setLocationId(location.id);
    setIsOpen(false);
  };

  const handleResetLocation = () => {
    setLocationId(null);
    setIsOpen(false);
  };

  const { data: projects } = useQuery({
    queryKey: ["getCurrentUser"],
    queryFn: async () => {
      const response = await apiClient.get("get-current-user-data");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      {projects?.data.project_id === null ? (
        navigate("/accessDenied", {
          replace: true,
          state: {
            message: "No projects mapped for this login!",
          },
        })
      ) : (
        <div>
          {!isLoading ? (
            <div className="container-fluid">
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
                      ? "Overall-Location"
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
              {!isLoading ? (
                <div className="row g-3">
                  <div className="col-12 col-sm-6 col-md-6 col-lg-2">
                    <div className="card card-134 darkcard  baseStyle card-one">
                      <div className="circleStyle circle-pink">
                        <img
                          src="/images/sme-dashboard/iconseven.svg"
                          alt="Clients"
                          className="icon-size"
                        />
                      </div>
                      <div className="ms-3 mt-3">
                        <p className="fw-bolder cardcount-text">
                          {DashboardData?.clients_count || "NA"}
                        </p>
                        <p className="font-normal cardname-text">
                          {DashboardData?.clients_count > 1
                            ? "Clients"
                            : "Client"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-2">
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
                          {DashboardData?.projects_count || "NA"}
                        </p>
                        <p className="font-normal cardname-text">
                          {DashboardData?.projects_count > 1
                            ? "Projects"
                            : "Project"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-2">
                    <div className="card card-134 darkcard baseStyle card-three">
                      <div className="circleStyle circle-green">
                        <img
                          src="/images/superadmin-dashboard/adminteam.svg "
                          alt="Teams"
                          className="icon-size"
                        />
                      </div>
                      <div className="ms-3 mt-3">
                        <p className="fw-bolder cardcount-text">
                          {DashboardData?.teams_count || "NA"}
                        </p>
                        <p className="font-normal cardname-text">
                          {DashboardData?.teams_count > 1 ? "Teams" : "Team"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-2">
                    <div className="card card-134 darkcard baseStyle card-four">
                      <div className="circleStyle circle-yellow">
                        <img
                          src="/images/sme-dashboard/iconsix.svg"
                          alt="Managers"
                          className="icon-size"
                        />
                      </div>
                      <div className="ms-3 mt-3">
                        <p className="fw-bolder cardcount-text">
                          {DashboardData?.managers_count || "NA"}
                        </p>
                        <p className="font-normal cardname-text">
                          {DashboardData?.managers_count > 1
                            ? "Managers"
                            : "Manager"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-2">
                    <div className="card card-134 darkcard baseStyle card-five">
                      <div className="circleStyle circle-skyblue ">
                        <img
                          src="/images/superadmin-dashboard/adminprojecthead.svg"
                          alt="Project Heads"
                          className="icon-size"
                        />
                      </div>
                      <div className="ms-3 mt-3">
                        <p className="fw-bolder cardcount-text">
                          {DashboardData?.project_heads_count || "NA"}
                        </p>
                        <p className="font-normal cardname-text">
                          {DashboardData?.project_heads_count > 1
                            ? " Project Heads"
                            : " Project Head"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-2">
                    <div className="card card-134 darkcard baseStyle card-six">
                      <div className="circleStyle circle-violet">
                        <img
                          src="/images/sme-dashboard/iconfour.svg"
                          alt="Leads"
                          className="icon-size"
                        />
                      </div>
                      <div className="ms-3 mt-3">
                        <p className="fw-bolder cardcount-text">
                          {DashboardData?.leads_count || "NA"}
                        </p>
                        <p className="font-normal cardname-text">
                          {DashboardData?.leads_count > 1 ? " Leads" : " Lead"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="row g-3">
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                        <div className="card card-134 darkcard baseStyle card-seven">
                          <div className="circleStyle circle-lavender">
                            <img
                              src="/images/sme-dashboard/icontwo.svg"
                              alt="Coders"
                              className="icon-size"
                            />
                          </div>
                          <div className="ms-3 mt-3">
                            <p className="fw-bolder cardcount-text">
                              {DashboardData?.coders_count || "NA"}
                            </p>
                            <p className="font-normal cardname-text">
                              {DashboardData?.coders_count > 1
                                ? " Coders"
                                : " Coder"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                        <div className="card card-134 darkcard baseStyle card-eight">
                          <div className="circleStyle circle-blue">
                            <img
                              src="/images/sme-dashboard/iconone.svg"
                              alt="Auditors"
                              className="icon-size"
                            />
                          </div>
                          <div className="ms-3 mt-3">
                            <p className="fw-bolder cardcount-text">
                              {DashboardData?.auditors_count || "NA"}
                            </p>
                            <p className="font-normal cardname-text">
                              {DashboardData?.auditors_count > 1
                                ? "Auditors"
                                : "Auditor"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="card card-270 darkcard">
                          <div className="card-body d-flex justify-content-center">
                            {/* <div className="bg-danger">
                        <div className="circleStyle circle-marron">
                          <img
                            src="/images/sme-dashboard/guide.svg"
                            alt="Auditors"
                            className="icon-size"
                          />
                        </div>
                        <div className="ms-3 mt-70">
                          <p className="fw-bolder cardcount-text">
                            {DashboardData?.guidelines_count || "NA"}
                          </p>
                          <p className="fw-medium fs-base lh-base  customguide-background">
                            Guides Uploaded
                          </p>
                        </div>
                      </div> */}
                            <div>
                              <h6 className="text-center fw-semibold fs-base lh-base text-nowrap customguide-background">
                                Guide status
                              </h6>
                              <MixePieGuideChartComp data={pieChartData} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="card card-202 darkcard">
                          <div className="card-body">
                            <div className="d-flex justify-content-center w-100 h-100">
                              <div
                                for="dropzone-file"
                                className="d-flex flex-column align-items-center header-skyblue justify-content-center w-100 mt-2 mb-2 cardborder rounded cursor-pointer "
                              >
                                <Link
                                  to="/guidelines"
                                  className="text-decoration-none"
                                >
                                  <div className="d-flex flex-column align-items-center justify-content-center py-2 ">
                                    <div className="circleStyle circle-normalskyblue">
                                      <img
                                        src="/images/sme-dashboard/exportguide.png"
                                        alt="Auditors"
                                        className="icon-size "
                                      />
                                    </div>
                                    <p className="mb-2 text-center text-primary ">
                                      <span className="font-weight-bold">
                                        Click to add
                                      </span>
                                      guidelines
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

                  <div className="col-lg-8">
                    <div className="row g-3">
                      <div className="col-12 col-sm-12 col-md-12 col-lg-9">
                        <div className="card  card-202 h-100  darkcard baseStyle card-eleven">
                          <div className="card-body">
                            <h5 className="m-2 fw-semibold fs-base lh-base text-nowrap customguide-background">
                              User Activity
                            </h5>
                            <div className="d-flex m-2 gap-3">
                              <div className="card bg-users  lightcard w-132 align-items-center">
                                <div className="card-body p-1">
                                  <div className="circleStyle circle-brinjal ">
                                    <img
                                      src="/images/sme-dashboard/totalusers.svg"
                                      alt="Auditors"
                                      className="icon-size"
                                    />
                                  </div>
                                  <div className="ms-3 mt-3">
                                    <p className="fw-bolder cardcount-text">
                                      {DashboardData?.all_users_count || "NA"}
                                    </p>
                                    <p className="main">
                                      {DashboardData?.all_users_count > 1
                                        ? "Users"
                                        : "user"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="card bg-users w-400 lightcard ">
                                <div className="card-body d-flex justify-content-around  p-1">
                                  <div>
                                    <div className="circleStyle circle-darkgreen">
                                      <img
                                        src="/images/sme-dashboard/activeuser.svg"
                                        alt="Auditors"
                                        className="icon-size"
                                      />
                                    </div>
                                    <div className="ms-3 ">
                                      <p className="fw-bolder cardcount-text">
                                        {DashboardData?.assigned_count || "NA"}
                                      </p>
                                      <p className="main">
                                        {DashboardData?.assigned_count > 1
                                          ? "Assigned Users"
                                          : "Assigned User"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid-divider"></div>
                                  <div>
                                    <div className="circleStyle circle-red">
                                      <img
                                        src="/images/sme-dashboard/inactiveuser.svg"
                                        alt="Auditors"
                                        className="icon-size"
                                      />
                                    </div>
                                    <div className="ms-3 ">
                                      <p className="fw-bolder cardcount-text">
                                        {DashboardData?.unassigned_count ||
                                          "NA"}
                                      </p>
                                      <p className="main">
                                        {DashboardData?.unassigned_count > 1
                                          ? "Unassigned Users"
                                          : "Unassigned User"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-3">
                        <div className="card  card-202 h-100 darkcard">
                          {/* <div className="card-body">
                      
                      <div className="circleStyle circle-pinkviolet">
                        <img
                          src="/images/sme-dashboard/iconnine.svg"
                          alt="Auditors"
                          className="icon-size"
                        />
                      </div>
                      <div className="ms-3 mt-70">
                        <p className="fw-bolder cardcount-text">
                          {DashboardData?.query_count || "NA"}
                        </p>
                        <p className="fw-medium fs-base lh-base text-nowrap customguide-background">
                          Query Request
                        </p>
                      </div>
                    </div> */}
                          <div className="p-3">
                            <div className="circleStyle circle-marron">
                              <img
                                src="/images/sme-dashboard/guide.svg"
                                alt="Auditors"
                                className="icon-size"
                              />
                            </div>
                            <div className="ms-3 mt-70">
                              <p className="fw-bolder cardcount-text">
                                {DashboardData?.guidelines_count || "NA"}
                              </p>
                              <p className="fw-medium fs-base lh-base  customguide-background">
                                Guide Uploaded
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="card card-413 darkcard p-3">
                          <h6 className="fw-semibold fs-base lh-base text-nowrap customguide-background ms-2">
                            Uploaded Guides
                          </h6>
                          <div className="table-br overflow-auto">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th scope="col">Title</th>
                                  <th scope="col">Project Name</th>
                                  <th scope="col">Uploaded by</th>
                                  <th scope="col">Date Uploaded</th>
                                  <th scope="col">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {DashboardData?.latest_guidelines?.length >
                                0 ? (
                                  DashboardData.latest_guidelines.map(
                                    (file, index) => (
                                      <tr className="fs-6" key={index}>
                                        <td className="py-3">
                                          <div className="d-flex align-items-center gap-3">
                                            <div>
                                              <div>
                                                {ucFirst(file.title) || "NA"}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td>
                                          <div>
                                            {ucFirst(file.project_name) || "NA"}
                                          </div>
                                        </td>
                                        <td>
                                          <div>
                                            {ucFirst(file.uploader_name) ||
                                              "NA"}
                                          </div>
                                        </td>
                                        <td>
                                          <div>
                                            {file.updated_at
                                              ? formatDate(file.updated_at)
                                              : "NA"}
                                          </div>
                                        </td>
                                        <td>
                                          <div>
                                            {file.status ? file.status : "NA"}
                                          </div>
                                        </td>
                                      </tr>
                                    )
                                  )
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="text-center py-4 text-muted"
                                    >
                                      No Data Found
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
              ) : (
                <div className="loading-indicator-dashboard" />
              )}
            </div>
          ) : (
            <div className="loading-indicator-dashboard" />
          )}
        </div>
      )}
    </>
  );
};
export default Dashboard;
