import React from "react";
import { changeTabTitle } from "../../utils/changeTabTitle";
import AddAudit from "./AddAudit";
import apiClient from "../../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import AddClientR from "./auditsClient-R/AddClientR";
import ErrorCharts from "../charts/ErrorChart";
import AddAnthem from "./auditsAnthem/AddAnthem";
import AddHumana from "./aduitsHumana/AddHumana";

const Audits = () => {
  changeTabTitle("Charts");
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const anthemElevance = Number(import.meta.env.VITE_APP_ANTHEM_ELEVANCE);
  const humana = Number(import.meta.env.VITE_APP_HUMANA);
  const libertyProjectID = Number(import.meta.env.VITE_APP_LIBERTY);
  const prominenceProjectID = Number(import.meta.env.VITE_APP_PROMINENCE);
  const humanaWave2ProjectID = Number(import.meta.env.VITE_APP_HUMANA_WAVE_2);
  const getProjectID = async () => {
    const response = await apiClient.get("get-current-user-data");
    return response.data;
  };

  const { data: projectID, isLoading: projectIDLoading } = useQuery({
    queryKey: ["getProjectID"],
    queryFn: getProjectID,
    staleTime: 5 * 60 * 1000,
  });
  const getFeedback = async () => {
    try {
      const response = await apiClient.get("feedback");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ["getFeedback"],
    queryFn: getFeedback,
    staleTime: 5 * 60 * 1000,
    enabled: !!projectID?.data,
  });

  if (projectIDLoading || feedbackLoading) {
    return <div></div>;
  }

  const project_name = projectID.data.this_project;

  let selectedProjectID = null;

  if (project_name === humana) {
    selectedProjectID = humana;
  } else if (project_name === libertyProjectID) {
    selectedProjectID = libertyProjectID;
  } else if (project_name === prominenceProjectID) {
    selectedProjectID = prominenceProjectID;
  } else if (project_name === humanaWave2ProjectID) {
    selectedProjectID = humanaWave2ProjectID;
  } else {
    selectedProjectID = "";
  }

  return (
    <div className="container-fluid">
      {projectID?.data.mail_mapping === null ? (
        <div className="d-flex justify-content-center align-items-center access">
          <div className="access-head">
            <img
              src="./images/restrictedaccess.svg"
              className="access-image"
              alt="Restricted Access"
            />
            <p className="access-body1">
              The page you’re trying to access has restricted access,
            </p>
            <p className="m-t-20 access-body2">
              You are not assigned any mail!
            </p>
          </div>
        </div>
      ) : projectID?.data.team_id === null ? (
        <div className="d-flex justify-content-center align-items-center access">
          <div className="access-head">
            <img
              src="./images/restrictedaccess.svg"
              className="access-image"
              alt="Restricted Access"
            />
            <p className="access-body1">
              The page you’re trying to access has restricted access,
            </p>
            <p className="m-t-20 access-body2">
              You are not assigned any team! Contact your team lead or admin for
              access.
            </p>
          </div>
        </div>
      ) : Number(projectID?.data?.this_project) == Number(clientR) ? (
        feedbackData?.data?.length > 0 ? (
          <ErrorCharts feedbackData={feedbackData} projectID={projectID} />
        ) : (
          <>
            <div className="d-flex justify-content-between">
              <h5 className="t-title">Add Audit</h5>
            </div>
            <AddClientR />
          </>
        )
      ) : Number(projectID?.data?.this_project) == anthemElevance ? (
        feedbackData?.data?.length > 0 ? (
          <ErrorCharts feedbackData={feedbackData} projectID={projectID} />
        ) : (
          <>
            <div className="d-flex justify-content-between">
              <h5 className="t-title">Add Audit</h5>
            </div>
            <AddAnthem />
          </>
        )
      ) : Number(projectID?.data?.this_project) == selectedProjectID ? (
        feedbackData?.data?.length > 0 ? (
          <ErrorCharts feedbackData={feedbackData} projectID={projectID} />
        ) : (
          <>
            <div className="d-flex justify-content-between">
              <h5 className="t-title">Add Audit</h5>
            </div>
            <AddHumana projectID={projectID} />
          </>
        )
      ) : feedbackData?.data?.length > 0 ? (
        <ErrorCharts feedbackData={feedbackData} projectID={projectID} />
      ) : (
        <>
          <div className="d-flex justify-content-between">
            <h5 className="t-title">Add Audit</h5>
          </div>
          <AddAudit />
        </>
      )}
    </div>
  );
};

export default Audits;
