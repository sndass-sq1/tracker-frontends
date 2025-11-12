

import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { changeTabTitle } from "../../utils/changeTabTitle";
import { useAuth } from "../../context/AuthContext";
import { ucFirst } from "../../utils/ucFirst";

const Profile = () => {
  const auth = useAuth();
  changeTabTitle("Profile");

  const getProfiles = async () => {
    try {
      const response = await apiClient.get(`profiles`);
      return response.data?.data;
    } catch (error) {
      throw error;
    }
  };

  const {
    data: profileData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["getProfiles"],
    queryFn: getProfiles,
    staleTime: 5 * 60 * 1000,
  });

  // const getTeamInfo = async () => {
  //   try {
  //     const response = await apiClient.get(`profiles/project-team-info`);
  //     return response.data?.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // };
  // const {
  //   data: teamInfo,
  //   isError: isTeamInfoError,
  //   isLoading: isTeamInfoLoading,
  // } = useQuery({
  //   queryKey: ["getTeamInfo"],
  //   queryFn: getTeamInfo,
  //   enabled: auth.user?.role !== "sme",
  // });

  if (isLoading) return <div>Loading profile...</div>;
  if (isError) return <div>Error fetching profile data</div>;

  return (
    <div className="container-fluid overflow-y-auto">
      <div className="row profile-parent">
        {profileData ? (
          <div className="col-12 col-sm-12 col-md-12 col-lg-5 mx-auto ">
            <h5 className="fw-semibold lh-sm fs-3  mb-3 text-center profile-text">
              Profile Info
            </h5>
            <div className="card darkcard card-316 ">
              <div className="card-body">
                <div className="rounded-circle d-flex align-items-center justify-content-center profile-log mb-2 mx-auto">
                  <img
                    src="images/profile-info/profileinfo.png"
                    className="profile-icon "
                    alt="img"
                  />
                </div>

                <div className="card darkcard border-0 shadow-none card-136 py-4">
                  <div className="card-body mx-auto">
                    <div className="profile-info">
                      <p className="grey-text">Name</p>
                      <span className="fw-semibold mx-3">
                        {ucFirst(profileData.name) || "NA"}
                      </span>

                      <p className="grey-text">Role</p>
                      <span className="fw-semibold mx-3">
                        {ucFirst(profileData.role_name.replace("_", " ")) ||
                          "NA"}
                      </span>
                      {auth.user.role === "coder" ||
                        auth.user.role === "auditor" ? (
                        <>
                          <p className="grey-text">Login Name</p>
                          <span className="fw-semibold mx-3">
                            {profileData.login_name || "NA"}
                          </span>
                          <p className="grey-text">Login Email</p>
                          <span className="fw-semibold ms-3">
                            {profileData.login_email || "NA"}
                          </span>
                        </>
                      ) : (
                        ""
                      )}
                      {/* <p className="grey-text">Role ID</p>
                      <span className="fw-semibold mx-3">
                        {profileData.role_id || "NA"}
                      </span> */}

                      <p className="grey-text">Email</p>
                      <span className="fw-semibold mx-3">
                        <img
                          src="images/profile-info/email.svg"
                          alt="img"
                          className="mx-1 profile-info-icon filtered-image"
                        />
                        {profileData.email || "NA"}
                      </span>

                      <p className="grey-text">Employee ID</p>
                      <span className="fw-semibold mx-3">
                        <img
                          src="images/profile-info/employeeid.svg"
                          alt="img"
                          className="mx-1 profile-info-icon filtered-image "
                        />
                        {profileData.employee_id || "NA"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No Profile Data</p>
        )}
        {/* {auth.user?.role !== "sme" && (
        <div className="col-12 col-sm-12 col-md-12 col-lg-6 ">
          <h5 className="fw-semibold lh-sm text-dark mb-3 profile-text">
            Project Team Info
          </h5>
          <div className="card card-316 ">
            <div className="card-body">
              {isTeamInfoLoading ? (
                <div>Loading team info...</div>
              ) : isTeamInfoError ? (
                <div>Error fetching team info</div>
              ) : teamInfo ? (
                <div className="text-sm">
                  <div className="row  gy-5 gx-5">
                    <div className="col-12 col-sm-12 col-md-6 col-lg-4">
                      <div className="card card-114">
                        <div className="card-body">
                          <img
                            src="images/profile-info/profileprojects.svg"
                            className="  float-end profile-team-icon "
                            alt="img"
                          />
                          <h4 className="mt-4">
                            {teamInfo.projects_count || "NA"}
                          </h4>
                          <p className="grey-text">Projects</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-6 col-lg-4">
                      
                      <div className="card card-114">
                        <div className="card-body">
                          <img
                            src="images/profile-info/profileteams.svg"
                            className="  float-end profile-team-icon "
                            alt="img"
                          />
                          <h4 className="mt-4">
                            {teamInfo.teams_count || "NA"}
                          </h4>
                          <p className="grey-text">Teams</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-6 col-lg-4">
                      
                      <div className="card card-114">
                        <div className="card-body">
                          <img
                            src="images/profile-info/profileusers.svg"
                            className="  float-end profile-team-icon "
                            alt="img"
                          />
                          <h4 className="mt-4">
                            {teamInfo.users_count || "NA"}
                          </h4>
                          <p className="grey-text">Users</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-6 col-lg-4">
                      
                      <div className="card card-114">
                        <div className="card-body">
                          <img
                            src="images/profile-info/profilecoder.svg"
                            className="  float-end profile-team-icon "
                            alt="img"
                          />
                          <h4 className="mt-4">
                            {teamInfo.coders_count || "NA"}
                          </h4>
                          <p className="grey-text">Coders</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-6 col-lg-4">
                      
                      <div className="card card-114">
                        <div className="card-body">
                          <img
                            src="images/profile-info/profilecoder.svg"
                            className="  float-end profile-team-icon "
                            alt="img"
                          />
                          <h4 className="mt-4">
                            {teamInfo.auditors_count || "NA"}
                          </h4>
                          <p className="grey-text">Auditor</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-6 col-lg-4">
                      
                      <div className="card card-114">
                        <div className="card-body">
                          <img
                            src="images/profile-info/profileclient.svg"
                            className="  float-end profile-team-icon "
                            alt="img"
                          />
                          <h4 className="mt-4">
                            {teamInfo.client_count || "NA"}
                          </h4>
                          <p className="grey-text">Clients</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm">No Project Team Info Data</p>
              )}
            </div>
          </div>
        </div>
      )} */}
      </div>
    </div>
  );
};

export default Profile;
