import { changeTabTitle } from "../../utils/changeTabTitle";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { useLocation, useNavigate, useParams } from "react-router";
import { Link } from "react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import CoderTabColumns from "../teams/tableColumns/CoderTabColumns";
import AuditorTabColumns from "../teams/tableColumns/AuditorTabColumns";
import ProductionTable from "../teams/teamSummary/table/ProductionTable";
const Production = ({ defaultTab }) => {
  //Lead Production
  changeTabTitle("Production");
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const selectedRow = location.state?.rows ?? id;

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [this_project, setThis_project] = useState(null);
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["getCurrentUser"],
    queryFn: async () => {
      const response = await apiClient.get("get-current-user-data");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleTabSelect = (selectedKey) => {
    setActiveTab(selectedKey);
    const newPath =
      selectedKey === "teams_coder"
        ? `/production/coders/${userData?.data?.team_id}`
        : `/production/auditors/${userData?.data?.team_id}`;
    navigate(newPath, { state: { rows: selectedRow } });
  };

  const teamSummary =
    activeTab === "teams_coder"
      ? `/production/coders/charts/${selectedRow}`
      : `/production/auditors/charts/${selectedRow}`;

  if (userLoading) return <div>Loading...</div>;

  return (
    <div className="container-fluid">
      <div className="h-100">
        <div className="d-flex justify-content-between align-items-center mx-3">
          <h5 className="t-title">Production</h5>
          <div className="d-flex align-items-center mb-1">
            <Link className="text-decoration-none" to={teamSummary}>
              <button className="btn btn-primary custom-primary-btn font-size13 px-3 mb-2">
                Team summary
              </button>
            </Link>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          id="production-tab"
          className="darkcard py-0 px-2 border-none mb-2 rounded-3"
        >
          <Tab eventKey="teams_coder" title="Coders">
            {/* {activeTab === "teams_coder" && ( */}
            <ProductionTable
              activeTab="teams_coder"
              apiEndPoint={`team-users/${userData?.data?.team_id}?role=coder`}
              tableHeight={"80%"}
              title="Coders"
              tableColumns={CoderTabColumns}
              queryKey={"getCoderTab"}
              module="production"
              exportApiEndPoint={`coders/export?team_id=${userData?.data?.team_id}`}
              hourlyCoderExportApi={`coders/export-coder-chart-hourly?team_id=${userData?.data?.team_id}`}
              setThis_project={setThis_project}
            />
            {/* )} */}
          </Tab>

          <Tab eventKey="teams_auditor" title="Auditors">
            {/* {activeTab === "teams_auditor" && ( */}
            <ProductionTable
              activeTab="teams_auditor"
              apiEndPoint={`team-users/${userData?.data?.team_id}?role=auditor`}
              title="Auditors"
              tableColumns={AuditorTabColumns}
              queryKey={"getAuditorTab"}
              module="production"
              exportApiEndPoint={`auditors/export?team_id=${userData?.data?.team_id}`}
              hourlyAuditorExportApi={`auditors/export-auditor-chart-hourly?team_id=${userData?.data?.team_id}`}
              setThis_project={setThis_project}
            />
            {/* )} */}
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default Production;
