import { changeTabTitle } from "../../../utils/changeTabTitle";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { useLocation, useNavigate, useParams } from "react-router";
import CoderTeamSummaryColumns from "./tableColumns/CoderTeamSummaryColumns";
import AuditorTeamSummaryColumns from "./tableColumns/AuditorTeamSummaryColumns";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ProductionTable from "./table/ProductionTable";
import { useAuth } from "../../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";
import CoderTeamSummaryR from "./tableColumns/CoderTeamSummaryR";
import AuditorTeamSummaryR from "./tableColumns/AuditorTeamSummaryR";

const TeamSummary = () => {
  changeTabTitle("TeamSummary");
  const navigate = useNavigate();
  const auth = useAuth();
  const location = useLocation();
  const { id } = useParams();
  // const setProjectId = null;
  const [projectId, setProjectId] = useState(null);

  const initialTab = location.pathname.includes("coders")
    ? "teams_coder"
    : "teams_auditor";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [this_project, setThis_project] = useState(null);
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);

  useEffect(() => {
    const newPath =
      activeTab === "teams_coder"
        ? `/production/coders/charts/${id}`
        : `/production/auditors/charts/${id}`;
    navigate(newPath, { replace: true });
  }, [activeTab, id, navigate]);

  const handleTabSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };
  const { data: userData } = useQuery({
    queryKey: ["getCurrentUser"],
    queryFn: async () => {
      const response = await apiClient.get("get-current-user-data");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mt-3 mx-3">
        <h5 className="t-title">Team Summary</h5>
        <OverlayTrigger overlay={<Tooltip>Back</Tooltip>} placement="left">
          <Link
            className="text-decoration-none"
            to={
              activeTab === "teams_coder"
                ? `/production/coders/${id}`
                : `/production/auditors/${id}`
            }
          >
            <button
              className="btn btn-primary custom-primary-btn back-btn font-size13"
              onClick={() =>
                navigate(
                  activeTab === "teams_coder"
                    ? `/production/coders/${id}`
                    : `/production/auditors/${id}`
                )
              }
            >
              <IoMdArrowRoundBack className="fs-5" />
            </button>
          </Link>
        </OverlayTrigger>
      </div>
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabSelect}
        className="mt-3 py-0 px-3 darkcard w-auto border-none mb-3"
      >
        <Tab eventKey="teams_coder" title="Coders">
          {activeTab === "teams_coder" && (
            <ProductionTable
              activeTab="teams_coder"
              apiEndPoint={
                auth.user.role === "lead"
                  ? `coder-chart?team_id=${userData?.data.team_id}`
                  : `coder-chart?team_id=${id}`
              }
              exportApiEndPoint={
                auth.user.role === "lead"
                  ? `coders/export?team_id=${userData?.data.team_id}`
                  : `coders/export?team_id=${id}`
              }
              queryKey={"coderSummary"}
              title="Charts"
              // tableColumns={CoderTeamSummaryColumns}
              tableColumns={
                this_project == clientR
                  ? CoderTeamSummaryR
                  : CoderTeamSummaryColumns
              }
              onProjectIdChange={setProjectId}
              module="Coder team summary"
              from="teamsummary"
              setThis_project={setThis_project}
            />
          )}
        </Tab>
        <Tab eventKey="teams_auditor" title="Auditors">
          {activeTab === "teams_auditor" && (
            <ProductionTable
              activeTab="teams_auditor"
              apiEndPoint={
                auth.user.role === "lead"
                  ? `auditor-chart?team_id=${userData?.data.team_id}`
                  : `auditor-chart?team_id=${id}`
              }
              exportApiEndPoint={
                auth.user.role === "lead"
                  ? `auditors/export?team_id=${userData?.data.team_id}`
                  : `auditors/export?team_id=${id}`
              }
              queryKey={"auditorSummary"}
              title="Audits"
              // tableColumns={AuditorTeamSummaryColumns}
              tableColumns={
                this_project == clientR
                  ? AuditorTeamSummaryR
                  : AuditorTeamSummaryColumns
              }
              onProjectIdChange={setProjectId}
              module="Auditor team summary"
              from="teamsummary"
              setThis_project={setThis_project}
            />
          )}
        </Tab>
      </Tabs>
    </div>
  );
};
export default TeamSummary;
